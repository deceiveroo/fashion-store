'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  productId: string;
  size?: number;
}

export default function FavoriteButton({ productId, size = 20 }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Проверяем, находится ли товар в избранном
  useEffect(() => {
    if (session?.user?.id) {
      checkIfFavorite();
    }
  }, [session, productId]);

  const checkIfFavorite = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const favorites = await response.json();
        const favorite = favorites.find((fav: any) => fav.productId === productId);
        setIsFavorite(!!favorite);
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!session) {
      toast.error('Войдите в систему чтобы добавлять в избранное');
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Удаляем из избранного
        await fetch(`/api/favorites/${productId}`, {
          method: 'DELETE',
        });
        setIsFavorite(false);
        toast.success('Удалено из избранного');
      } else {
        // Добавляем в избранное
        await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });
        setIsFavorite(true);
        toast.success('Добавлено в избранное');
      }
    } catch (error) {
      toast.error('Ошибка при обновлении избранного');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleFavorite}
      disabled={isLoading}
      className="p-2 text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      <Heart 
        size={size} 
        fill={isFavorite ? 'currentColor' : 'none'}
        className={isFavorite ? 'text-red-500' : ''}
      />
    </motion.button>
  );
}