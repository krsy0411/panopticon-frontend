import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type Params = Promise<{ id: string }>;

// GET /api/apps/[id] - 특정 앱 조회
export async function GET(_request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;

    const app = await prisma.application.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        lastAccessedAt: true,
      },
    });

    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...app,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      lastAccessedAt: app.lastAccessedAt ? app.lastAccessedAt.toISOString() : null,
    });
  } catch (error) {
    console.error('Failed to fetch app:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}

// PUT /api/apps/[id] - 앱 수정
export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
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

    return NextResponse.json({
      ...updatedApp,
      createdAt: updatedApp.createdAt.toISOString(),
      updatedAt: updatedApp.updatedAt.toISOString(),
      lastAccessedAt: updatedApp.lastAccessedAt ? updatedApp.lastAccessedAt.toISOString() : null,
    });
  } catch (error) {
    console.error('Failed to update app:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

// DELETE /api/apps/[id] - 앱 삭제
export async function DELETE(_request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Failed to delete app:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
