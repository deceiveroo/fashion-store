import { Suspense } from 'react';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { or, like } from 'drizzle-orm';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageHero from '@/components/PageHero';

async function MenProducts() {
  const menProducts = await db
    .select()
    .from(products)
    .where(or(
      like(products.category, '%курт%'),
      like(products.category, '%брюк%'),
      like(products.category, '%худи%')
    ));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {menProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function MenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <PageHero
        title="Мужское"
        description="Инновационная мужская одежда, сочетающая передовые технологии с безупречным стилем. От умных курток до технологичных аксессуаров."
      backgroundImage="/images/Pradasphere_DT.avif"
      />
      
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingSpinner />}>
            <MenProducts />
          </Suspense>
        </div>
      </section>
    </div>
  );
}