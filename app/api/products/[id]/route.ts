// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productImages } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// GET - получение конкретного товара
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 GET product request for ID:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'ID товара не указан' },
        { status: 400 }
      );
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(productImages.order);

    return NextResponse.json({
      ...product[0],
      images,
      mainImage: images.find(img => img.isMain)?.url || images[0]?.url || '/placeholder-image.jpg'
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке товара' },
      { status: 500 }
    );
  }
}

// PUT - обновление товара
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, description, price, category, inStock, featured, images } = await request.json();

    console.log('✏️ Updating product:', id, {
      name, description, price, category, inStock, featured, images
    });

    // Валидация
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { 
          error: 'Все обязательные поля должны быть заполнены',
          success: false
        },
        { status: 400 }
      );
    }

    // Проверяем существование товара
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Товар не найден', success: false },
        { status: 404 }
      );
    }

    // Обновляем товар
    await db
      .update(products)
      .set({
        name,
        description,
        price: parseFloat(price),
        category,
        inStock: Boolean(inStock),
        featured: Boolean(featured),
      })
      .where(eq(products.id, id));

    // Удаляем старые изображения и добавляем новые
    await db
      .delete(productImages)
      .where(eq(productImages.productId, id));

    if (images && images.length > 0) {
      const imageRecords = images.map((url: string, index: number) => ({
        id: uuidv4(),
        productId: id,
        url,
        isMain: index === 0,
        order: index,
      }));

      await db.insert(productImages).values(imageRecords);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Товар успешно обновлен'
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при обновлении товара',
        success: false
      },
      { status: 500 }
    );
  }
}

// DELETE - удаление товара
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔄 Starting delete process for product:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'ID товара не указан', success: false },
        { status: 400 }
      );
    }

    // Проверяем существование товара
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Товар не найден', success: false },
        { status: 404 }
      );
    }

    // Удаляем изображения
    await db
      .delete(productImages)
      .where(eq(productImages.productId, id));

    // Удаляем товар
    await db
      .delete(products)
      .where(eq(products.id, id));

    return NextResponse.json({ 
      success: true,
      message: 'Товар успешно удален',
      deletedId: id
    });
    
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка при удалении товара',
        success: false
      },
      { status: 500 }
    );
  }
}