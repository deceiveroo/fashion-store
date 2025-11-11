import { Suspense } from 'react';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { or, like } from 'drizzle-orm';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageHero from '@/components/PageHero';

async function WomenProducts() {
  const womenProducts = await db
    .select()
    .from(products)
    .where(or(
      like(products.category, '%рубаш%'),
      like(products.category, '%плать%')
    ));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {womenProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function WomenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <PageHero
        title="Женское"
        description="Эксклюзивная женская коллекция, где элегантность встречается с инновациями. Умные ткани, адаптивный дизайн и устойчивые материалы."
      backgroundImage="/images/pradasphere1e_DT.avif"
      />
      
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingSpinner />}>
            <WomenProducts />
          </Suspense>
        </div>
      </section>
    </div>
  );
}