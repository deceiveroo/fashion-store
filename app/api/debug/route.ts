// app/api/debug/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';

export async function GET() {
  try {
    // Проверяем подключение к БД
    const allProducts = await db.select().from(products).limit(5);
    
    return NextResponse.json({
      database: 'connected',
      productsCount: allProducts.length,
      sampleProducts: allProducts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}