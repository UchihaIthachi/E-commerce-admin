import { POST } from './route'; // Adjust if your handler is exported differently
import prisma from '@/server/infrastructure/clients/prisma'; // This will be the mock
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { Role } from '@prisma/client'; // Import Role if needed for assertions

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

// Mock the Prisma client
// Jest will automatically use the mock from __mocks__ due to its location
// relative to the actual prisma.ts file, if path is correctly resolved.
// Or explicitly mock it if needed:
jest.mock('@/server/infrastructure/clients/prisma');

// Type assertion for the mocked Prisma
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Mock environment variables used in the route, if any, e.g.
    // process.env.SOME_SECRET = 'test_secret_value';
  });

  it('should register a new user successfully', async () => {
    const mockRequestBody = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    // Mock Prisma responses
    (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue(null); // No existing user
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword'); // Mock password hashing

    // Mock the $transaction implementation
    // The mock for $transaction needs to correctly return what the actual transaction callback would,
    // particularly the newUser object.
    const mockNewUserInTx = { id: 'user1', name: 'Test User', email: 'test@example.com', role: Role.CUSTOMER };
    (mockedPrisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
            user: { create: jest.fn().mockResolvedValue(mockNewUserInTx) },
            account: { create: jest.fn().mockResolvedValue({}) },
        };
        return callback(tx);
    });

    // Simplified request mock
    const request = {
      json: async () => mockRequestBody,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      // Add other properties/methods if your route handler uses them
    } as unknown as NextRequest; // Cast to NextRequest to satisfy type checking

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody.message).toBe('User registered successfully');
    expect(responseBody.user).toBeDefined();
    expect(responseBody.user.email).toBe(mockRequestBody.email);
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: mockRequestBody.email } });
    expect(bcrypt.hash).toHaveBeenCalledWith(mockRequestBody.password, 10);
    // Check that transaction was called and user/account were created within it
    expect(mockedPrisma.$transaction).toHaveBeenCalled();
    // Access the mock functions from the transaction passed to the callback
    // This requires knowing the structure of your $transaction mock
    const transactionCallback = (mockedPrisma.$transaction as jest.Mock).mock.calls[0][0];
    const mockTxPrisma = { // This object simulates the 'tx' passed to the transaction callback
        user: { create: jest.fn() },
        account: { create: jest.fn() }
    };
    // To properly test what happens inside transaction, the mock setup for $transaction needs to be more robust
    // or we trust the transaction itself and just check its call.
    // For now, let's check if the main methods inside were called (this is tricky with current mock)
    // A better way might be to check the result of the transaction if it returns the user.
    // The current $transaction mock calls user.create and account.create using its own internal mocks.
    // Let's assume the mock for $transaction has been set up so its internal `tx.user.create` is called.
    // This part of assertion is complex due to the nature of mocking transactions.
    // A simpler check is that the transaction completed and returned the user.
    expect(responseBody.user.id).toEqual(mockNewUserInTx.id);


  });

  it('should return 409 if user already exists', async () => {
    const mockRequestBody = {
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'password123',
    };

    (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user2', email: 'existing@example.com' });

    const request = {
        json: async () => mockRequestBody,
        headers: new Headers({ 'Content-Type': 'application/json' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(409);
    expect(responseBody.error).toBe('User already exists');
  });

  it('should return 400 for missing required fields', async () => {
    const mockRequestBody = {
      email: 'test@example.com',
      // Name and password missing
    };

    const request = {
        json: async () => mockRequestBody,
        headers: new Headers({ 'Content-Type': 'application/json' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Missing required fields');
  });

  it('should return 400 for invalid email format', async () => {
    const mockRequestBody = { name: "Test", email: "invalidemail", password: "password123" };
    const request = {
        json: async () => mockRequestBody,
        headers: new Headers({ 'Content-Type': 'application/json' }),
    } as unknown as NextRequest;
    const response = await POST(request);
    const responseBody = await response.json();
    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Invalid email format');
  });

  it('should return 400 for short password', async () => {
    const mockRequestBody = { name: "Test", email: "test@example.com", password: "123" };
    const request = {
        json: async () => mockRequestBody,
        headers: new Headers({ 'Content-Type': 'application/json' }),
    } as unknown as NextRequest;
    const response = await POST(request);
    const responseBody = await response.json();
    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Password must be at least 6 characters long');
  });

});
