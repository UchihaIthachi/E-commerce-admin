import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInPage from './page';
import { useRouter } from 'next/navigation';

// Mock fetch
global.fetch = jest.fn();

// Mock next/navigation
jest.mock('next/navigation');

// Type assertion for the mocked useRouter
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Helper to silence console.error for specific tests
const silenceConsoleErrors = (testFn: () => Promise<void> | void) => async () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await testFn();
  } finally {
    consoleErrorSpy.mockRestore();
  }
};

describe('SignInPage', () => {
  let mockRouterPush: jest.Mock;
  let originalLocation: Location;

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();

    mockRouterPush = jest.fn();
    (mockedUseRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });

    originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = {
        assign: jest.fn(),
        replace: jest.fn(),
        href: 'http://localhost/sign-in', // Provide a default href
    };
  });

  afterEach(() => {
    window.location = originalLocation;
    jest.restoreAllMocks();
  });

  it('renders the sign-in form correctly', () => {
    render(<SignInPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i, type: 'submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account?/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot your password?/i)).toBeInTheDocument();
  });

  it('shows error message if email or password is not provided', async () => {
    render(<SignInPage />);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i, type: 'submit' });
    await userEvent.click(submitButton);
    expect(await screen.findByText('Email and password are required.')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('calls login API and redirects on successful login', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Login successful', user: { id: '1', email: 'test@example.com' } }),
    });

    render(<SignInPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i, type: 'submit' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
    });
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows error message on failed API login', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    render(<SignInPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i, type: 'submit' }));
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('shows generic error message on network failure', silenceConsoleErrors(async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    render(<SignInPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i, type: 'submit' }));
    expect(await screen.findByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  })); // Corrected closing for the test case

  it('redirects to Google login when Google button is clicked', silenceConsoleErrors(() => {
    render(<SignInPage />);
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(googleButton);
    // GoogleLoginButton.tsx calls `window.location.href = ...`
    // The mock in beforeEach sets `window.location.assign = jest.fn()`.
    // JSDOM often translates `href` assignment to a call to `assign`.
    expect((window.location as any).assign).toHaveBeenCalledWith('/api/auth/google/login');
  })); // Corrected closing for the test case
});
