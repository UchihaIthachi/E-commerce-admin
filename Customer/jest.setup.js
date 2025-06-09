// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

import 'whatwg-fetch'; // For polyfilling fetch, Request, Response, Headers in Node environment for API tests
// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'; // Changed from /extend-expect

// Mock Next.js server components used in API routes
jest.mock('next/server', () => {
  const actualNextServer = jest.requireActual('next/server');
  return {
    ...actualNextServer,
    NextResponse: {
      ...actualNextServer.NextResponse,
      json: jest.fn((body, init) => ({ // Simple mock for NextResponse.json
        status: init?.status || 200,
        headers: new Headers(init?.headers),
        json: async () => body,
        text: async () => JSON.stringify(body),
        // Add other methods if your code uses them from the returned object
      })),
    },
  };
});

// Mock environment variables if necessary - example:
// process.env.JWT_ACCESS_SECRET = 'test_secret';
// process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
// process.env.GOOGLE_CLIENT_ID = 'test_google_id';
// process.env.GOOGLE_CLIENT_SECRET = 'test_google_secret';
// process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// You might need to mock specific modules globally here if they cause issues
// e.g. next/router or next/navigation if not handled by __mocks__

// jest.mock('next/router', () => require('next-router-mock'));
// jest.mock('next/dist/client/router', () => require('next-router-mock'));

// For Next 13+ App Router, navigation hooks like useRouter, usePathname, useSearchParams
// often need to be mocked if components using them are tested directly.
// jest.mock('next/navigation', () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//     replace: jest.fn(),
//     refresh: jest.fn(),
//     back: jest.fn(),
//     forward: jest.fn(),
//   }),
//   usePathname: () => '/',
//   useSearchParams: () => new URLSearchParams(),
//   useParams: () => ({}),
// }));
