// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productImages } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// GET - получение всех товаров
export async function GET() {
  try {
    const allProducts = await db
      .select()
      .from(products)
      .orderBy(products.createdAt);

    // Для каждого товара получаем изображения
    const productsWithImages = await Promise.all(
      allProducts.map(async (product) => {
        const images = await db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, product.id))
          .orderBy(productImages.order);

        return {
          ...product,
          images,
          mainImage: images.find(img => img.isMain)?.url || images[0]?.url || '/placeholder-image.jpg'
        };
      })
    );

    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке товаров' },
      { status: 500 }
    );
  }
}

// POST - создание нового товара
export async function POST(request: Request) {
  try {
    const { name, description, price, category, inStock, featured, images } = await request.json();

    console.log('📥 Creating product with data:', {
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

    const productId = uuidv4();

    // Создаем товар
    await db.insert(products).values({
      id: productId,
      name,
      description,
      price: parseFloat(price),
      category,
      inStock: Boolean(inStock),
      featured: Boolean(featured),
    });

    // Добавляем изображения
    if (images && images.length > 0) {
      const imageRecords = images.map((url: string, index: number) => ({
        id: uuidv4(),
        productId,
        url,
        isMain: index === 0,
        order: index,
      }));

      await db.insert(productImages).values(imageRecords);
    }

    return NextResponse.json(
      { 
        message: 'Товар успешно добавлен', 
        productId,
        success: true 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при создании товара',
        success: false
      },
      { status: 500 }
    );
  }
}