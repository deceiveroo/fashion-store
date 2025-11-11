import { Suspense } from 'react';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageHero from '@/components/PageHero';

async function AllProducts() {
  const allProducts = await db
    .select()
    .from(products);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {allProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function KollektsiiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <PageHero
        title="Коллекции"
        description="Исследуйте полный ассортимент нашей инновационной одежды. От умных технологий до устойчивых материалов - каждая коллекция рассказывает свою уникальную историю."
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