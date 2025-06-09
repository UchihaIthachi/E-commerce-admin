// __mocks__/prisma.ts

// Mock the main PrismaClient export
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    // Add other user methods if needed
  },
  account: {
    findFirst: jest.fn(),
    findUnique: jest.fn(), // Though findFirst is often used with where for non-id uniques
    create: jest.fn(),
    update: jest.fn(),
    // Add other account methods if needed
  },
  session: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    // Add other session methods if needed
  },
  verificationToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    // Add other verificationToken methods if needed
  },
  // Mock $transaction if it's used directly
  // This is a simplified mock; real transactions might need more complex setup
  $transaction: jest.fn().mockImplementation(async (callback) => {
    // Create a mock transaction object (tx) that mirrors the Prisma methods
    const mockTx = {
      user: {
        create: jest.fn(),
        update: jest.fn(),
        // ... other user methods used in transactions
      },
      account: {
        create: jest.fn(),
        update: jest.fn(),
        // ... other account methods used in transactions
      },
      verificationToken: {
          delete: jest.fn(),
          // ...
      }
      // ... other models used in transactions
    };
    // You might need to pre-configure responses for these mockTx methods if the callback uses them
    return callback(mockTx);
  }),
  // Add other models if they are directly accessed, e.g. prisma.someOtherModel.find...
};

// Export the mock client instance
// This default export will be used when jest.mock('@/server/infrastructure/clients/prisma') is called.
// Note: The actual path in jest.mock should match how it's imported in your routes.
// If routes use `import prisma from '@/server/infrastructure/clients/prisma';`
// then the mock path should be `src/server/infrastructure/clients/prisma.ts` relative to root,
// or use moduleNameMapper to ensure `@/` works.
// For manual mocks in __mocks__ folder adjacent to the actual module, Jest picks it up automatically.
export default mockPrismaClient;


// If your actual prisma.ts exports new PrismaClient(), then the mock should reflect that:
// export const PrismaClient = jest.fn(() => mockPrismaClient);
// export default new PrismaClient(); // This line may or may not be needed depending on how prisma client is exported/used

// Given `import prisma from '@/server/infrastructure/clients/prisma';`
// The default export is what's used. So the above `export default mockPrismaClient` is correct.
