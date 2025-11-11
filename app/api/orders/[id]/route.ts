// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

async function authenticateToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateToken(request);
  if (!user) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { status } = await request.json();
    const orderId = params.id;

    // Проверяем, что заказ принадлежит пользователю
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (order.length === 0) {
      return NextResponse.json({ message: 'Заказ не найден' }, { status: 404 });
    }

    if (order[0].userId !== user.userId) {
      return NextResponse.json({ message: 'Нет доступа к этому заказу' }, { status: 403 });
    }

    // Обновляем статус заказа
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();

    const fullOrder = {
      id: updatedOrder.id,
      items: [], // Будет заполнено при необходимости
      total: Number(updatedOrder.total),
      discount: Number(updatedOrder.discount || 0),
      deliveryPrice: Number(updatedOrder.deliveryPrice || 0),
      deliveryMethod: updatedOrder.deliveryMethod,
      paymentMethod: updatedOrder.paymentMethod,
      status: updatedOrder.status as 'processing' | 'shipped' | 'delivered' | 'cancelled',
      createdAt: updatedOrder.createdAt?.toString() || new Date().toISOString(),
      recipient: typeof updatedOrder.recipient === 'string' 
        ? JSON.parse(updatedOrder.recipient) 
        : updatedOrder.recipient,
      comment: updatedOrder.comment
    };

    return NextResponse.json(fullOrder);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { message: 'Ошибка при обновлении заказа' },
      { status: 500 }
    );
  }
}