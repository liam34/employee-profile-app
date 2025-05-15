// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// This is a way to prevent creating too many Prisma Client instances
// during development when Next.js hot reloads your code.
declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-unused-vars
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // You can add logging here if you want to see the queries Prisma makes:
    // log: ['query', 'info', 'warn', 'error'],
  });

// If we're not in a production environment, set the global prisma variable.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;