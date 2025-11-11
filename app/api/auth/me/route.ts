// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, orders, orderItems } from '@/lib/db/schema';
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

export async function GET(request: NextRequest) {
  const user = await authenticateToken(request);
  if (!user) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  try {
    // Находим пользователя
    const userData = await db.select().from(users).where(eq(users.id, user.userId)).limit(1);
    
    if (userData.length === 0) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    // Находим заказы пользователя
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.userId))
      .orderBy(orders.createdAt);

    // Для каждого заказа находим items
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        return {
          id: order.id,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            image: item.image,
            size: item.size || '',
            color: item.color || ''
          })),
          total: Number(order.total),
          discount: Number(order.discount || 0),
          deliveryPrice: Number(order.deliveryPrice || 0),
          deliveryMethod: order.deliveryMethod,
          paymentMethod: order.paymentMethod,
          status: order.status as 'processing' | 'shipped' | 'delivered' | 'cancelled',
          createdAt: order.createdAt?.toString() || new Date().toISOString(),
          recipient: typeof order.recipient === 'string' 
            ? JSON.parse(order.recipient) 
            : order.recipient,
          comment: order.comment
        };
      })
    );

    const { password: _, ...userWithoutPassword } = userData[0];
    const nameParts = userWithoutPassword.name?.split(' ') || ['', ''];

    return NextResponse.json({
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      name: userWithoutPassword.name,
      firstName: nameParts[0],
      lastName: nameParts[1] || '',
      phone: '',
      image: userWithoutPassword.image,
      orders: ordersWithItems
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}