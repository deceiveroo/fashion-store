import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { products, productImages } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import ProductClient from '@/components/ProductClient';

async function getProduct(id: string) {
  if (!id) {
    console.error('Product ID is empty');
    return null;
  }

  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (product.length === 0) {
      return null;
    }

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(productImages.order);

    return {
      ...product[0],
      images,
      mainImage: images.find(img => img.isMain)?.url || images[0]?.url || '/placeholder-image.jpg'
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Используем правильный тип для params
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  // Ожидаем params
  const { id } = await params;
  
  if (!id) {
    console.error('No product ID provided');
    notFound();
  }

  const product = await getProduct(id);

  if (!product) {
    console.error('Product not found for ID:', id);
    notFound();
  }

  // Возвращаем клиентский компонент
  return <ProductClient product={product} />;
}

// Метаданные для SEO
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  
  if (!id) {
    return {
      title: 'Товар не найден',
    };
  }

  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Товар не найден',
    };
  }

  return {
    title: `${product.name} - ELEVATE`,
    description: product.description,
  };
}

// Генерация статических параметров
export async function generateStaticParams() {
  try {
    const allProducts = await db.select().from(products);
    
    return allProducts.map((product) => ({
      id: product.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}