// __mocks__/next/navigation.js

const actualNav = jest.requireActual('next/navigation');

module.exports = {
  ...actualNav, // Import and retain default exports
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'), // Default mock pathname
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})), // Default mock params
  redirect: jest.fn((url) => {
    // Mock implementation of redirect
    // console.log(`Mock redirect to: ${url}`);
  }),
  // Add any other specific exports from next/navigation you use and need to mock
};
