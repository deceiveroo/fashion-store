// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Находим пользователя
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 401 });
    }

    // Для демо-версии проверяем пароль без хеширования
    // В продакшене используйте: await bcrypt.compare(password, user[0].passwordHash)
    const isValidPassword = password === user[0].password;
    
    if (!isValidPassword) {
      return NextResponse.json({ message: 'Неверный пароль' }, { status: 401 });
    }

    // Создаем JWT токен с помощью jose
    const token = await new SignJWT({ 
      userId: user[0].id, 
      email: user[0].email 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = user[0];

    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        firstName: userWithoutPassword.name?.split(' ')[0] || '',
        lastName: userWithoutPassword.name?.split(' ')[1] || '',
        phone: '',
        orders: []
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}