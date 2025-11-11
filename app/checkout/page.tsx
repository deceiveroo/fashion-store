// app/checkout/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Store, CreditCard, Shield, Zap, Gift, Sparkles, ShoppingBag, MapPin, Clock, Wallet, User, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  const { state: cart, clearCart } = useCart();
  const { user, addOrder } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'individual' | 'legal'>('individual');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'courier' | 'express'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    comment: ''
  });

  const steps = [
    { id: 1, name: 'Данные', completed: currentStep > 1, icon: User },
    { id: 2, name: 'Доставка', completed: currentStep > 2, icon: Package },
    { id: 3, name: 'Оплата', completed: false, icon: CreditCard }
  ];

  const deliveryOptions = [
    {
      id: 'pickup',
      title: 'Самовывоз',
      icon: Store,
      description: 'Пункты выдачи и отделения Почты России',
      price: 'Бесплатно',
      time: '1-3 дня',
      details: 'Более 200 пунктов выдачи в вашем городе'
    },
    {
      id: 'courier',
      title: 'Курьером',
      icon: Truck,
      description: 'По адресу до двери',
      price: 'Бесплатно от 2000 ₽',
      time: '1-2 дня',
      details: 'Бесплатная доставка при заказе от 2000 ₽'
    },
    {
      id: 'express',
      title: 'Экспресс',
      icon: Zap,
      description: 'Доставка за 2 часа',
      price: '490 ₽',
      time: '2 часа',
      details: 'В пределах города в течение 2 часов'
    }
  ];

  const paymentOptions = [
    {
      id: 'card',
      title: 'Банковская карта',
      icon: CreditCard,
      description: 'Visa, Mastercard, МИР',
      available: true
    },
    {
      id: 'online',
      title: 'Онлайн-банкинг',
      icon: Wallet,
      description: 'СБП, Qiwi, ЮMoney',
      available: deliveryMethod !== ''
    },
    {
      id: 'cash',
      title: 'Наличными',
      icon: Wallet,
      description: 'При получении',
      available: deliveryMethod === 'courier' || deliveryMethod === 'express'
    },
    {
      id: 'installment',
      title: 'Рассрочка',
      icon: Shield,
      description: '0% на 4 месяца',
      available: cart.total > 3000
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDeliverySelect = (method: 'pickup' | 'courier' | 'express') => {
    setDeliveryMethod(method);
    setCurrentStep(3);
    setPaymentMethod('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert('Выберите способ оплаты');
      return;
    }

    // Проверяем обязательные поля
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (deliveryMethod === 'courier' && !formData.address) {
      alert('Пожалуйста, укажите адрес доставки');
      return;
    }

    setIsSubmitting(true);

    try {
      // Создаем заказ
      const order = {
        items: cart.items,
        total: finalTotal,
        discount: getDiscount(),
        deliveryPrice: getDeliveryPrice(),
        deliveryMethod,
        paymentMethod,
        recipient: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address
        },
        comment: formData.comment
      };

      // Сохраняем заказ через API
      await addOrder(order);
      
      // Очищаем корзину
      clearCart();
      
      // Редирект на страницу успеха
      router.push('/checkout/success');
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Ошибка при оформлении заказа. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDiscount = () => {
    if (cart.total > 5000) return 500;
    if (cart.total > 3000) return 300;
    if (cart.total > 1000) return 100;
    return 0;
  };

  const getDeliveryPrice = () => {
    if (deliveryMethod === 'express') return 490;
    if (deliveryMethod === 'courier' && cart.total < 2000) return 200;
    return 0;
  };

  const finalTotal = Math.max(0, cart.total - getDiscount() + getDeliveryPrice());

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 text-center py-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <ShoppingBag size={80} className="mx-auto text-gray-400 mb-4" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Корзина пуста</h1>
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-xl transition-all"
          >
            Начать покупки
            <Zap size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Steps - улучшенный дизайн */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                      currentStep >= step.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent shadow-lg shadow-purple-200'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {step.completed ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-white"
                      >
                        <step.icon size={20} />
                      </motion.div>
                    ) : (
                      <step.icon 
                        size={20} 
                        className={currentStep >= step.id ? 'text-white' : 'text-gray-400'} 
                      />
                    )}
                    
                    {/* Активный индикатор */}
                    {currentStep === step.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                      />
                    )}
                  </motion.div>
                  <span className={`text-sm mt-3 font-medium ${
                    currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
                
                {/* Соединительная линия */}
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 mx-8 ${
                    currentStep > step.id 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                      : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          Оформление заказа
        </motion.h1>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Левая колонка - Форма - центрированная */}
          <div className="xl:col-span-3 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Тип получателя */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 justify-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="text-white" size={20} />
                  </div>
                  Данные получателя
                </h2>
                
                <div className="flex gap-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setActiveTab('individual')}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 text-center transition-all ${
                      activeTab === 'individual'
                        ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 shadow-lg'
                        : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    👤 Физическое лицо
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setActiveTab('legal')}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 text-center transition-all ${
                      activeTab === 'legal'
                        ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 shadow-lg'
                        : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    🏢 Юридическое лицо
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Имя *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Укажите ваше имя"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white/50 text-sm"
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Укажите вашу фамилию"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white/50 text-sm"
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+7 (999) 999-99-99"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white/50 text-sm"
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Эл. почта *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Укажите почту"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white/50 text-sm"
                      required
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Способ получения */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 justify-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Truck className="text-white" size={20} />
                  </div>
                  Способ получения
                </h2>
                
                <div className="space-y-4">
                  {deliveryOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => handleDeliverySelect(option.id as 'pickup' | 'courier' | 'express')}
                      className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                        deliveryMethod === option.id
                          ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 shadow-xl'
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-lg bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          deliveryMethod === option.id 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <option.icon size={22} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-gray-900 text-base">{option.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-sm ${
                                option.price === 'Бесплатно' ? 'text-green-600' : 'text-gray-900'
                              }`}>
                                {option.price}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Clock size={12} />
                                {option.time}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <MapPin size={12} />
                            {option.details}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {deliveryMethod === 'courier' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Адрес доставки *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Укажите полный адрес доставки"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white/50 text-sm"
                      required
                    />
                  </motion.div>
                )}
              </motion.div>

              {/* Способ оплаты */}
              {deliveryMethod && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 justify-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CreditCard className="text-white" size={20} />
                    </div>
                    Способ оплаты
                  </h2>
                  
                  <div className="space-y-4">
                    {paymentOptions.map((option) => (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: option.available ? 1.01 : 1 }}
                        whileTap={{ scale: option.available ? 0.99 : 1 }}
                        type="button"
                        onClick={() => option.available && setPaymentMethod(option.id)}
                        disabled={!option.available}
                        className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                          paymentMethod === option.id
                            ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
                            : option.available
                            ? 'border-gray-200 hover:border-purple-300 hover:shadow-md bg-white'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${
                            paymentMethod === option.id 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <option.icon size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm">{option.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                          </div>
                          {!option.available && (
                            <div className="text-xs text-gray-400">Недоступно</div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {paymentMethod && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200"
                    >
                      <div className="flex items-center gap-2 text-green-700 text-sm">
                        <Shield size={16} />
                        <span>Ваши платежные данные защищены</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Комментарий */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">💬 Комментарий к заказу</h2>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="Дополнительные пожелания к заказу..."
                  rows={3}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white/50 resize-none text-sm"
                />
              </motion.div>
            </form>
          </div>

          {/* Правая колонка - Итоги заказа - центрированная */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/50 sticky top-32"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3 justify-center">
                <Sparkles size={20} className="text-purple-600" />
                Ваш заказ
              </h2>
              
              {/* Состав заказа */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 font-medium text-sm">Состав заказа · {cart.itemCount} шт</span>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={`${item.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50"
                    >
                      <Image
                        src={item.image || '/api/placeholder/50/50'}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover border border-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs leading-tight line-clamp-2">{item.name}</div>
                        {(item.size || item.color) && (
                          <div className="text-xs text-gray-600 mt-1">
                            {item.size && <span className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">{item.size}</span>}
                            {item.size && item.color && ' '}
                            {item.color && <span className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">{item.color}</span>}
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xs">
                            {Math.round(item.price)} ₽
                          </span>
                          <span className="text-gray-600 font-medium text-xs">×{item.quantity}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Итоговая стоимость */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Товары · {cart.itemCount} шт</span>
                  <span className="font-medium">{Math.round(cart.total)} ₽</span>
                </div>
                
                {getDiscount() > 0 && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex justify-between text-xs items-center"
                  >
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <Gift size={12} />
                      Ваша выгода
                    </span>
                    <span className="text-green-600 font-bold">-{getDiscount()} ₽</span>
                  </motion.div>
                )}
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Доставка</span>
                  <span className={getDeliveryPrice() === 0 ? "text-green-600 font-medium" : "text-gray-900 font-medium"}>
                    {getDeliveryPrice() === 0 ? 'Бесплатно' : `${getDeliveryPrice()} ₽`}
                  </span>
                </div>
                
                <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-sm">Итого:</span>
                  <motion.span
                    key={finalTotal}
                    animate={{ scale: [1, 1.05, 1] }}
                    className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    {Math.round(finalTotal)} ₽
                  </motion.span>
                </div>
              </div>

              {/* Кнопка оформления */}
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 30px -10px rgba(168, 85, 247, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!paymentMethod || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-bold text-base mt-4 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center justify-center gap-2">
                  <Shield size={16} />
                  {isSubmitting ? 'Оформляем заказ...' : paymentMethod ? 'Оформить заказ' : 'Выберите способ оплаты'}
                  <Zap size={16} />
                </span>
              </motion.button>

              {/* Дополнительная информация */}
              <div className="mt-4 space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <input type="checkbox" className="mt-0.5" defaultChecked />
                  <span>Нажимая на кнопку, вы соглашаетесь с положением об обработке и защите персональных данных.</span>
                </div>
                
                <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <input type="checkbox" className="mt-0.5" />
                  <span>Я хочу получать информацию о скидках и специальных предложениях</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3 text-center">
                  <div className="font-medium">Служба поддержки:</div>
                  <div className="text-purple-600 font-bold text-sm">info@elevate.ru</div>
                  <div className="mt-1 text-gray-500 text-xs">© 2025 Все права защищены 18+</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}