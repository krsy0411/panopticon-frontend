import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type Params = Promise<{ id: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;

    const updated = await prisma.application.update({
      where: { id },
      data: {
        lastAccessedAt: new Date(),
      },
      select: {
        lastAccessedAt: true,
      },
    });

    return NextResponse.json({
      lastAccessedAt: updated.lastAccessedAt ? updated.lastAccessedAt.toISOString() : null,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    console.error('Failed to update last access:', error);
    return NextResponse.json({ error: 'Failed to record last access' }, { status: 500 });
  }
}
