// app/api/debug-db/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productImages } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');

    // Проверяем подключение к базе
    const allProducts = await db.select().from(products);
    const allImages = await db.select().from(productImages);

    let specificProduct = null;
    let specificProductImages = [];

    // Если указан ID, проверяем конкретный товар
    if (productId) {
      specificProduct = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (specificProduct.length > 0) {
        specificProductImages = await db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, productId));
      }
    }

    return NextResponse.json({
      success: true,
      database: 'connected',
      productsCount: allProducts.length,
      imagesCount: allImages.length,
      specificProduct: productId ? {
        exists: specificProduct.length > 0,
        product: specificProduct[0] || null,
        images: specificProductImages
      } : null,
      allProducts: allProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price
      }))
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}