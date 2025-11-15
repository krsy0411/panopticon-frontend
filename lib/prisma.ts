import { PrismaClient } from '@prisma/client';

// PrismaClient 싱글톤 패턴
// Next.js 개발 환경에서 Hot Reload 시 PrismaClient 인스턴스가 계속 생성되는 것을 방지

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
