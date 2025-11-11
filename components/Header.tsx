'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X, Search, Plus, LogOut } from 'lucide-react';
import SearchComponent from './Search';
import Cart from './Cart';
import { useCart } from '@/context/CartContext';

const navigation = [
  { name: 'Новинки', href: '/new' },
  { name: 'Коллекции', href: '/collections' },
  { name: 'Мужское', href: '/men' },
  { name: 'Женское', href: '/women' },
  { name: 'О Нас', href: '/about' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const { state: cart } = useCart();

  // Подсчет общего количества товаров в корзине
  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200' 
            : 'bg-white/90 backdrop-blur-md border-b border-gray-100'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ELEVATE
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ y: -2 }}
                  className="relative"
                >
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Search Component */}
              <SearchComponent />

              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-600 hover:text-purple-600 transition-colors relative"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <motion.span 
                    className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {itemCount}
                  </motion.span>
                )}
              </motion.button>

              {status === 'loading' ? (
                <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              ) : session ? (
                <div className="flex items-center space-x-3">
                  {/* Admin Button */}
                  {session.user?.role === 'admin' && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-shadow"
                      >
                        <Plus size={16} />
                        <span>Админ</span>
                      </Link>
                    </motion.div>
                  )}
                  
                  {/* User Menu */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 p-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {session.user?.image ? (
                          <img 
                            src={session.user.image} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={16} className="text-purple-600" />
                        )}
                      </div>
                    </motion.button>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
                        >
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                              {session.user?.name || 'Пользователь'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {session.user?.email}
                            </p>
                          </div>
                          
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Мой профиль
                          </Link>
                          
                          <Link
                            href="/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Мои заказы
                          </Link>
                          
                          <Link
                            href="/favorites"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Избранное
                          </Link>

                          <div className="border-t border-gray-100 mt-1">
                            <button
                              onClick={handleSignOut}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                            >
                              <LogOut size={16} className="mr-2" />
                              Выйти
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  {/* Register Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/auth/signup"
                      className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium hover:shadow-lg transition-shadow"
                    >
                      Регистрация
                    </Link>
                  </motion.div>
                  
                  {/* Login Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/auth/signin"
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-shadow"
                    >
                      Войти
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Mobile menu button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="md:hidden p-2 text-gray-600"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white/95 backdrop-blur-lg rounded-lg mt-2 p-4 shadow-xl border border-gray-200"
              >
                <div className="flex flex-col space-y-3">
                  {navigation.map((item) => (
                    <motion.div
                      key={item.name}
                      whileHover={{ x: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Link
                        href={item.href}
                        className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Mobile User Links */}
                  {session ? (
                    <>
                      <div className="border-t border-gray-200 pt-3 mt-2">
                        <Link
                          href="/profile"
                          className="block py-2 text-gray-700 hover:text-purple-600 font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          Мой профиль
                        </Link>
                        <Link
                          href="/orders"
                          className="block py-2 text-gray-700 hover:text-purple-600 font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          Мои заказы
                        </Link>
                        <Link
                          href="/favorites"
                          className="block py-2 text-gray-700 hover:text-purple-600 font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          Избранное
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="border-t border-gray-200 pt-3 mt-2">
                        <Link
                          href="/auth/signup"
                          className="block py-2 text-gray-700 hover:text-purple-600 font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          Регистрация
                        </Link>
                        <Link
                          href="/auth/signin"
                          className="block py-2 text-purple-600 hover:text-purple-700 font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          Войти
                        </Link>
                      </div>
                    </>
                  )}
                  
                  {/* Mobile Admin Link */}
                  {session?.user?.role === 'admin' && (
                    <div className="border-t border-gray-200 pt-3">
                      <Link
                        href="/admin"
                        className="block py-2 text-green-600 hover:text-green-700 font-medium"
                        onClick={() => setIsOpen(false)}
                      >
                        Админка
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>

      {/* Cart Component */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}