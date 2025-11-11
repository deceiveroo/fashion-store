import { db } from './db';
import { products } from './schema';

export async function seedDatabase() {
  const existingProducts = await db.select().from(products).limit(1);
  
  if (existingProducts.length > 0) {
    console.log('База данных уже заполнена');
    return;
  }

  await db.insert(products).values([
    {
      id: '1',
      name: 'Квантовая Куртка',
      description: 'Революционная куртка с адаптивным контролем температуры и технологией умной ткани',
      price: 399.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'куртки',
      inStock: true,
      featured: true,
    },
    {
      id: '2',
      name: 'Нео-Тех Брюки',
      description: 'Умные брюки с интегрированным гибким дисплеем и управлением жестами',
      price: 289.99,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'брюки',
      inStock: true,
      featured: true,
    },
    {
      id: '3',
      name: 'Голографические Кроссовки',
      description: 'Лимитированные кроссовки с динамическими голографическими панелями',
      price: 459.99,
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'обувь',
      inStock: true,
      featured: true,
    },
    {
      id: '4',
      name: 'AI Умная Рубашка',
      description: 'Рубашка с биометрическими датчиками и отслеживанием фитнеса на основе ИИ',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'рубашки',
      inStock: true,
      featured: false,
    },
    {
      id: '5',
      name: 'Солнечная Худи',
      description: 'Устойчивая худи с интегрированными солнечными панелями для зарядки устройств',
      price: 329.99,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'худи',
      inStock: true,
      featured: true,
    },
    {
      id: '6',
      name: 'Кибер Очки',
      description: 'Очки дополненной реальности с совместимостью с нейроинтерфейсом',
      price: 599.99,
      image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'аксессуары',
      inStock: true,
      featured: false,
    },
    // Добавляем больше товаров для разных категорий
    {
      id: '7',
      name: 'Умные Джинсы',
      description: 'Джинсы с технологией самоочистки и адаптивной посадкой',
      price: 349.99,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'брюки',
      inStock: true,
      featured: false,
    },
    {
      id: '8',
      name: 'Био-Платье',
      description: 'Платье из биологически разлагаемых материалов с меняющимся узором',
      price: 429.99,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'рубашки',
      inStock: true,
      featured: true,
    },
  ]);

  console.log('База данных успешно заполнена');
}