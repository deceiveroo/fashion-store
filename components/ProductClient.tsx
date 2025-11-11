'use client';

import { motion } from 'framer-motion';
import { Heart, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton';
import FavoriteButton from './FavoriteButton';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  featured: boolean;
  images: { id: string; url: string; isMain: boolean }[];
}

interface ProductClientProps {
  product: Product;
}

// ✅ Та же функция для placeholder
const getPlaceholderImage = (width: number = 600, height: number = 600): string => {
  const services = [
    `https://picsum.photos/${width}/${height}?random=${Math.random()}`,
    `https://via.placeholder.com/${width}x${height}/f3f4f6/9ca3af?text=No+Image`,
    `https://placehold.co/${width}x${height}/f3f4f6/9ca3af/png?text=No+Image`
  ];
  return services[0];
};

export default function ProductClient({ product }: ProductClientProps) {
  const mainImage = product.images.find(img => img.isMain) || product.images[0];
  const otherImages = product.images.filter(img => img.id !== mainImage?.id);

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Кнопка назад */}
        <Link 
          href="/collections"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Назад к коллекциям
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Изображения товара */}
          <div className="space-y-4">
            {/* Главное изображение */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-square overflow-hidden rounded-2xl bg-gray-100"
            >
              <img
                src={mainImage?.url || getPlaceholderImage(600, 600)}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </motion.div>

            {/* Дополнительные изображения */}
            {otherImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {otherImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="aspect-square overflow-hidden rounded-lg bg-gray-100"
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} view ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Информация о товаре */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {product.featured && (
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Star size={14} />
                  <span>Избранное</span>
                </div>
              )}

              <p className="text-3xl font-bold text-gray-900 mb-6">
                {product.price.toLocaleString('ru-RU')} ₽
              </p>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-t border-b border-gray-200">
                  <span className="text-gray-600">Категория</span>
                  <span className="font-medium text-gray-900">{product.category}</span>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <span className="text-gray-600">Наличие</span>
                  <span className={`font-medium ${
                    product.inStock ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.inStock ? 'В наличии' : 'Нет в наличии'}
                  </span>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-4 mt-8">
                <AddToCartButton 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: mainImage?.url || getPlaceholderImage(300, 300),
                  }}
                  disabled={!product.inStock}
                />
                
                <FavoriteButton productId={product.id} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Детали</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Характеристики</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Категория: {product.category}</li>
                <li>• Состояние: {product.inStock ? 'В наличии' : 'Нет в наличии'}</li>
                <li>• Статус: {product.featured ? 'Популярный' : 'Стандартный'}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Доставка и возврат</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Бесплатная доставка от 5000 ₽</li>
                <li>• Возврат в течение 30 дней</li>
                <li>• Гарантия подлинности</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}