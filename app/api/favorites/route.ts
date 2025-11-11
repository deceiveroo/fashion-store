import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { favorites } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth'; // ✅
import { v4 as uuidv4 } from 'uuid'; // ✅ добавлено

// GET - получение избранного пользователя
export async function GET() {
  try {
    const session = await auth(); // ✅

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, session.user.id));

    return NextResponse.json(userFavorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Error fetching favorites' }, { status: 500 });
  }
}

// POST - добавление в избранное
export async function POST(request: Request) {
  try {
    const session = await auth(); // ✅

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Проверяем, не добавлен ли уже товар
    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, session.user.id),
          eq(favorites.productId, productId)
        )
      )
      .limit(1);

    if (existingFavorite.length > 0) {
      return NextResponse.json({ error: 'Product already in favorites' }, { status: 400 });
    }

    // Добавляем в избранное
    await db.insert(favorites).values({
      id: uuidv4(), // ✅ теперь uuid доступен
      userId: session.user.id,
      productId: productId,
    });

    return NextResponse.json({ message: 'Product added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json({ error: 'Error adding to favorites' }, { status: 500 });
  }
}