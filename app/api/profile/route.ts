import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // ✅
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/schema';

// POST - обновление профиля (name, phone, address)
export async function POST(request: Request) {
  try {
    const session = await auth(); // ✅

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, address } = await request.json();

    await db
      .insert(userProfiles)
      .values({
        userId: session.user.id,
        name,
        phone,
        address,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: { name, phone, address }
      });

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
