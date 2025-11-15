import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET /api/apps - 모든 앱 조회 (서비스 개수 포함)
export async function GET() {
  try {
    const apps = await prisma.application.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        lastAccessedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const parsed = apps.map((app) => ({
      ...app,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      lastAccessedAt: app.lastAccessedAt ? app.lastAccessedAt.toISOString() : null,
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Failed to fetch apps:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// POST /api/apps - 새 앱 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required and must be a string' }, { status: 400 });
    }

    const newApp = await prisma.application.create({
      data: {
        name,
        description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        lastAccessedAt: true,
      },
    });

    return NextResponse.json(
      {
        ...newApp,
        createdAt: newApp.createdAt.toISOString(),
        updatedAt: newApp.updatedAt.toISOString(),
        lastAccessedAt: newApp.lastAccessedAt ? newApp.lastAccessedAt.toISOString() : null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create app:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}
