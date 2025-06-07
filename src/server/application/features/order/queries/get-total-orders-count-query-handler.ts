// src/server/application/features/order/queries/get-total-orders-count-query-handler.ts
import { PrismaClient } from '@prisma/client'; // Or your specific Prisma client import path
// If you have a central Prisma client instance, import it instead:
// import prisma from '@/server/infrastructure/clients/prisma';

// Assuming a prisma client instance is available.
// If not, this needs to be instantiated or imported.
const prisma = new PrismaClient(); // Replace with your actual prisma instance if it's exported from elsewhere

export default async function getTotalOrdersCountQueryHandler(): Promise<number> {
  try {
    const totalOrders = await prisma.order.count(); // Prisma's count aggregate
    return totalOrders;
  } catch (error) {
    console.error("Failed to get total orders count:", error);
    // Depending on error handling strategy, you might throw a custom error
    // or return a specific value indicating an error.
    // For simplicity, rethrowing or returning 0 if that's acceptable.
    throw new Error("Could not retrieve total orders count.");
  }
}
