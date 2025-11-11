// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  discount: number;
  deliveryPrice: number;
  deliveryMethod: string;
  paymentMethod: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  recipient: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
  };
  comment?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName: string;
  lastName: string;
  phone: string;
  orders: Order[];
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    checkAuth();
  }, []);

  const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  };

  const setToken = (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  };

  const removeToken = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        removeToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error('Failed to refresh user data');
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }

      const { user: userData, token } = await response.json();
      
      setToken(token);
      setUser(userData);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string }): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || 'Registration failed');
      }

      const { user: newUser, token } = await response.json();
      
      setToken(token);
      setUser(newUser);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const logout = (): void => {
    setUser(null);
    removeToken();
  };

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> => {
    const token = getToken();
    if (!token) {
      throw new Error('User not authenticated. Please log in to complete your order.');
    }

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create order' }));
        throw new Error(errorData.message || 'Failed to create order');
      }

      const newOrder: Order = await response.json();
      
      // Обновляем пользователя с новым заказом
      setUser(prev => prev ? {
        ...prev,
        orders: [newOrder, ...prev.orders]
      } : null);

      return newOrder;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create order');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
    const token = getToken();
    if (!token || !user) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update order status' }));
        throw new Error(errorData.message || 'Failed to update order status');
      }

      const updatedOrder: Order = await response.json();
      
      // Обновляем заказ в списке
      setUser(prev => prev ? {
        ...prev,
        orders: prev.orders.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      } : null);
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update order status');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      addOrder,
      updateOrderStatus,
      refreshUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}