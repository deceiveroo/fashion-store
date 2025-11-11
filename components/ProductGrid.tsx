import { db } from '@/lib/db';
import { products, productImages } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import ProductCard from './ProductCard';

async function getProducts() {
  const allProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  // Для каждого товара получаем главное изображение
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

  return productsWithImages;
}

export default async function ProductGrid() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Товары пока не добавлены</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}