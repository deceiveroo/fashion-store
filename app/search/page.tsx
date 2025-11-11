import { Suspense } from 'react';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { like } from 'drizzle-orm';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';

async function SearchResults({ query }: { query: string }) {
  if (!query) {
    return <p className="text-center text-gray-500">Введите поисковый запрос</p>;
  }

  const searchResults = await db
    .select()
    .from(products)
    .where(like(products.name, `%${query}%`));

  if (searchResults.length === 0) {
    return <p className="text-center text-gray-500">По запросу "{query}" ничего не найдено</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {searchResults.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Результаты поиска
        </h1>
        {query && (
          <p className="text-xl text-gray-600 mb-8">
            По запросу: <span className="font-semibold">"{query}"</span>
          </p>
        )}
        
        <Suspense fallback={<LoadingSpinner />}>
          <SearchResults query={query} />
        </Suspense>
      </div>
    </div>
  );
}