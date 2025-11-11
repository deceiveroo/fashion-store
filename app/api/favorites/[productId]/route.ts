import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { favorites } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth'; // ✅

// DELETE - удаление из избранного
export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await auth(); // ✅

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, session.user.id),
          eq(favorites.productId, params.productId)
        )
      );

    return NextResponse.json({ message: 'Product removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json({ error: 'Error removing from favorites' }, { status: 500 });
  }
}