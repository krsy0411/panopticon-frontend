import { PrismaClient } from '@prisma/client';

// PrismaClient 싱글톤 패턴
// Next.js 개발 환경에서 Hot Reload 시 PrismaClient 인스턴스가 계속 생성되는 것을 방지

declare global {
  var prisma: PrismaClient | undefined;
}

// DATABASE_URL이 없으면 PrismaClient를 초기화하지 않음 (에러 방지)
// RDS 생성 후 DATABASE_URL 환경변수 추가 필요
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Prisma client will not be initialized.');
    return null;
  }
  return new PrismaClient();
};

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production' && prisma) {
  global.prisma = prisma;
}
