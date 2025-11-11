// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
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

export async function POST(request: NextRequest) {
  const user = await authenticateToken(request);
  if (!user) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  try {
    const orderData = await request.json();
    
    // Создаем заказ
    const [newOrder] = await db.insert(orders).values({
      userId: user.userId,
      total: orderData.total.toString(),
      discount: (orderData.discount || 0).toString(),
      deliveryPrice: (orderData.deliveryPrice || 0).toString(),
      deliveryMethod: orderData.deliveryMethod,
      paymentMethod: orderData.paymentMethod,
      status: 'processing',
      recipient: JSON.stringify(orderData.recipient),
      comment: orderData.comment,
    }).returning();

    // Создаем элементы заказа
    const orderItemsData = orderData.items.map((item: any) => ({
      orderId: newOrder.id,
      productId: item.id,
      name: item.name,
      price: item.price.toString(),
      quantity: item.quantity,
      image: item.image,
      size: item.size,
      color: item.color,
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Получаем полный заказ с элементами
    const orderItemsList = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, newOrder.id));

    const fullOrder = {
      id: newOrder.id,
      items: orderItemsList.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.image,
        size: item.size || '',
        color: item.color || ''
      })),
      total: Number(newOrder.total),
      discount: Number(newOrder.discount || 0),
      deliveryPrice: Number(newOrder.deliveryPrice || 0),
      deliveryMethod: newOrder.deliveryMethod,
      paymentMethod: newOrder.paymentMethod,
      status: newOrder.status as 'processing' | 'shipped' | 'delivered' | 'cancelled',
      createdAt: newOrder.createdAt?.toString() || new Date().toISOString(),
      recipient: typeof newOrder.recipient === 'string' 
        ? JSON.parse(newOrder.recipient) 
        : newOrder.recipient,
      comment: newOrder.comment
    };

    return NextResponse.json(fullOrder);
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { message: 'Ошибка при создании заказа' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const user = await authenticateToken(request);
  if (!user) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  try {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.userId))
      .orderBy(orders.createdAt);

    // Для каждого заказа получаем items
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

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { message: 'Ошибка при получении заказов' },
      { status: 500 }
    );
  }
}