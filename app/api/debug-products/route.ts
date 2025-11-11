// app/api/debug-products/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productImages } from '@/lib/schema';

export async function GET() {
  try {
    // Получаем все товары
    const allProducts = await db.select().from(products);
    
    // Получаем все изображения
    const allImages = await db.select().from(productImages);
    
    // Проверяем структуру первого товара
    const sampleProduct = allProducts[0];
    let sampleProductImages = [];
    
    if (sampleProduct) {
      sampleProductImages = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, sampleProduct.id));
    }

    return NextResponse.json({
      success: true,
      productsCount: allProducts.length,
      imagesCount: allImages.length,
      sampleProduct: sampleProduct ? {
        ...sampleProduct,
        images: sampleProductImages
      } : null,
      allProducts: allProducts.map(p => ({
        id: p.id,
        name: p.name,
        hasImages: allImages.filter(img => img.productId === p.id).length
      }))
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}