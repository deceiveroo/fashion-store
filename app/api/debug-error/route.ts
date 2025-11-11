// app/api/debug-error/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productImages } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { productId, name, description, price, category, inStock, featured, images } = await request.json();
    
    console.log('=== DEBUG ERROR ENDPOINT START ===');
    console.log('Product ID:', productId);

    // Проверяем существование товара
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    console.log('Product exists:', existingProduct.length > 0);

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Обновляем товар
    const updateData = {
      name: name || 'Test Name',
      description: description || 'Test Description', 
      price: parseFloat(price) || 100.00,
      category: category || 'Test Category',
      inStock: Boolean(inStock),
      featured: Boolean(featured),
    };

    const updateResult = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, productId));
    console.log('✅ Product update OK');

    // Работаем с изображениями
    if (images && images.length > 0) {
      await db.delete(productImages).where(eq(productImages.productId, productId));
      
      const imageRecords = images.map((url: string, index: number) => ({
        id: uuidv4(),
        productId,
        url,
        isMain: index === 0,
        order: index,
      }));
      
      await db.insert(productImages).values(imageRecords);
      console.log('✅ Images update OK');
    }

    console.log('=== DEBUG ERROR ENDPOINT END ===');

    return NextResponse.json({ 
      success: true,
      message: 'All tests passed' 
    });

  } catch (error) {
    console.error('=== DEBUG ERROR CAUGHT ===');
    console.error('Error:', error);
    console.error('=== DEBUG ERROR END ===');

    return NextResponse.json({
      success: false,
      error: 'Debug test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}