// app/api/debug-update/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { productId, name, price } = await request.json();
    
    console.log('🧪 Debug update received:', { productId, name, price });

    // Проверяем существование товара
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    console.log('📦 Product exists:', existingProduct.length > 0);

    if (existingProduct.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    // Пробуем обновить
    const result = await db
      .update(products)
      .set({
        name: name || 'Test Name',
        price: parseFloat(price) || 100.00,
      })
      .where(eq(products.id, productId));

    console.log('✅ Update result:', result);

    return NextResponse.json({
      success: true,
      message: 'Debug update successful',
      result
    });

  } catch (error) {
    console.error('💥 Debug update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug update failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}