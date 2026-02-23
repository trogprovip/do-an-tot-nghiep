import { PrismaClient } from '@prisma/client';

declare module '@prisma/client' {
  interface PrismaClient {
    seatlocks: {
      findFirst: (args: any) => Promise<any>;
      findMany: (args: any) => Promise<any>;
      create: (args: any) => Promise<any>;
      update: (args: any) => Promise<any>;
      updateMany: (args: any) => Promise<{ count: number }>;
      upsert: (args: any) => Promise<any>;
      delete: (args: any) => Promise<any>;
    };
  }
}
