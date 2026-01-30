import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromRequest, logAdminAction } from '@/lib/auth';
import { UpdateResourceSchema } from '@/lib/validation';

// GET - Get resources (pending or all)
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    
    if (status !== 'all') {
      where.status = status;
    }
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: [
        { global_sticky_order: 'desc' },
        { category_sticky_order: 'desc' },
        { created_at: 'desc' },
      ],
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// PATCH - Update resource status
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = UpdateResourceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { id, status, category, global_sticky_order, category_sticky_order } = validationResult.data;

    // Get current resource
    const currentResource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!currentResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    
    if (status) updateData.status = status;
    if (category) updateData.category = category;
    if (global_sticky_order !== undefined) updateData.global_sticky_order = global_sticky_order;
    if (category_sticky_order !== undefined) updateData.category_sticky_order = category_sticky_order;
    
    if (status === 'published' && !currentResource.published_at) {
      updateData.published_at = new Date();
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: updateData,
    });

    // Log action
    await logAdminAction(
      request,
      status === 'published' ? 'APPROVE_RESOURCE' : 
      status === 'rejected' ? 'REJECT_RESOURCE' : 
      status === 'delisted' ? 'DELIST_RESOURCE' : 'UPDATE_RESOURCE',
      id,
      { previousStatus: currentResource.status, newStatus: status }
    );

    return NextResponse.json({ resource: updated });
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE - Delete resource
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    const currentResource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!currentResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    await prisma.resource.delete({
      where: { id },
    });

    await logAdminAction(request, 'DELETE_RESOURCE', null, {
      deletedResource: { name: currentResource.name, url: currentResource.url },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
