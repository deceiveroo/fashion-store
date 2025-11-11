// app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Типы для продукта
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  featured: boolean;
  mainImage: string;
  updatedAt?: string;
}

// Mock data - замените на вашу реальную базу данных
let products: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    description: 'Description 1',
    price: 1000,
    category: 'Category 1',
    inStock: true,
    featured: false,
    mainImage: '/images/product1.jpg'
  },
  {
    id: '2', 
    name: 'Product 2',
    description: 'Description 2',
    price: 2000,
    category: 'Category 2',
    inStock: true,
    featured: true,
    mainImage: '/images/product2.jpg'
  }
];

// Вспомогательная функция для проверки авторизации
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  // Если у вас есть проверка на роль администратора
  // if (session.user.role !== 'admin') {
  //   return { error: 'Forbidden', status: 403 };
  // }
  
  return { session };
}

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Get single product by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await checkAdminAuth();
    if (authCheck.error) {
      return NextResponse.json(
        { error: authCheck.error }, 
        { status: authCheck.status }
      );
    }

    const { id } = params;
    
    // Найти продукт по ID - замените на ваш database query
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update product by ID
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await checkAdminAuth();
    if (authCheck.error) {
      return NextResponse.json(
        { error: authCheck.error }, 
        { status: authCheck.status }
      );
    }

    const { id } = params;
    const body = await request.json();
    
    // Валидация обязательных полей
    const { name, price, description, category, inStock, featured, mainImage } = body;
    
    if (!name || !price || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Найти индекс продукта - замените на вашу database операцию
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' }, 
        { status: 404 }
      );
    }

    // Обновить продукт - замените на ваше database обновление
    products[productIndex] = {
      ...products[productIndex],
      name,
      price: Number(price),
      description,
      category,
      inStock: Boolean(inStock),
      featured: Boolean(featured),
      mainImage: mainImage || products[productIndex].mainImage,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(products[productIndex]);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product by ID
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await checkAdminAuth();
    if (authCheck.error) {
      return NextResponse.json(
        { error: authCheck.error }, 
        { status: authCheck.status }
      );
    }

    const { id } = params;
    
    // Найти индекс продукта - замените на вашу database операцию
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' }, 
        { status: 404 }
      );
    }

    // Удалить продукт - замените на ваше database удаление
    const deletedProduct = products.splice(productIndex, 1)[0];

    return NextResponse.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}