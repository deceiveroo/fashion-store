import { Suspense } from 'react';
import { db } from '@/lib/db';
import { products, productImages } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageHero from '@/components/PageHero';

async function AllProducts() {
  // Получаем продукты
  const allProducts = await db
    .select()
    .from(products);

  // ✅ Для каждого продукта получаем изображения и вычисляем mainImage
  const productsWithImages = await Promise.all(
    allProducts.map(async (product) => {
      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(productImages.order);

      // ✅ Вычисляем mainImage так же как в API
      return {
        ...product,
        images,
        mainImage: images.find(img => img.isMain)?.url || images[0]?.url || '/placeholder-image.jpg'
      };
    })
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {productsWithImages.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <PageHero
        title="Коллекции"
        description="Исследуйте полный ассортимент нашей инновационной одежды. От умных технологий до устойчивых материалов - каждая коллекция рассказывает свою уникальную историю."
      backgroundImage="/images/pradasphere_home_DT.webp"
      />
      
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingSpinner />}>
            <AllProducts />
          </Suspense>
        </div>
      </section>
    </div>
  );
}