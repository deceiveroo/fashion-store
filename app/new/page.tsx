import { Suspense } from 'react';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageHero from '@/components/PageHero';

async function NewProducts() {
  const newProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(12);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {newProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function NewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <PageHero
        title="Новинки"
        description="Самые свежие и инновационные модели, которые только появились в нашей коллекции. Будьте первыми, кто оценит новейшие тенденции будущего моды."
      backgroundImage="/images/pradasphere_home_DT.avif"
      />
      
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingSpinner />}>
            <NewProducts />
          </Suspense>
        </div>
      </section>
    </div>
  );
}