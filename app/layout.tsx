// app/layout.tsx (обновленная версия)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/Toaster';
import AuthProvider from '@/components/AuthProvider';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider as CustomAuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ELEVATE',
  description: 'Переосмысливая роскошную моду с инновационным дизайном и устойчивыми практиками',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          <CustomAuthProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <Toaster />
              </div>
            </CartProvider>
          </CustomAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}