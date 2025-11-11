'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Upload, X, Link as LinkIcon, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  featured: boolean;
  images: { id: string; url: string; isMain: boolean }[];
  mainImage: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [deletingProducts, setDeletingProducts] = useState<Set<string>>(new Set());
  const [updatingProducts, setUpdatingProducts] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inStock: true,
    featured: false,
    images: [] as string[],
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/auth/signin');
      return;
    }

    loadProducts();
  }, [session, status, router]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Ошибка загрузки товаров');
      }
    } catch (error) {
      console.error('Load products error:', error);
      toast.error('Ошибка загрузки товаров');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите файл изображения');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Файл успешно загружен');
        setForm(prev => ({
          ...prev,
          images: [...prev.images, data.url]
        }));
      } else {
        toast.error(data.error || 'Ошибка загрузки файла');
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Ошибка соединения');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addImageUrl = () => {
    if (!newImageUrl.trim()) {
      toast.error('Введите URL изображения');
      return;
    }

    if (form.images.includes(newImageUrl)) {
      toast.error('Это изображение уже добавлено');
      return;
    }

    setForm(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl('');
    toast.success('URL изображения добавлен');
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация формы
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.category.trim()) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      toast.error('Введите корректную цену');
      return;
    }

    setIsLoading(true);

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price,
        category: form.category.trim(),
        inStock: form.inStock,
        featured: form.featured,
        images: form.images
      };

      console.log('📤 Sending product data:', { url, method, data: productData });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      let responseData;
      try {
        const responseText = await response.text();
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        responseData = { error: 'Неверный формат ответа от сервера' };
      }

      console.log('📡 Response:', {
        status: response.status,
        ok: response.ok,
        data: responseData
      });

      if (response.ok) {
        const successMessage = editingProduct ? 'Товар успешно обновлен' : 'Товар успешно добавлен';
        toast.success(successMessage);
        
        setIsAdding(false);
        setEditingProduct(null);
        setForm({
          name: '',
          description: '',
          price: '',
          category: '',
          inStock: true,
          featured: false,
          images: [],
        });
        
        // Обновляем список товаров
        await loadProducts();
      } else {
        const errorMessage = responseData.error || 
                            responseData.details || 
                            `Ошибка ${response.status} при ${editingProduct ? 'обновлении' : 'добавлении'} товара`;
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить товар "${productName}"?`)) return;
    
    setDeletingProducts(prev => new Set(prev).add(productId));
    
    try {
      console.log('🔄 Deleting product:', productId);
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      let data = {};
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        data = { error: 'Неверный формат ответа' };
      }
      
      if (response.ok) {
        toast.success(data.message || 'Товар успешно удален');
        // Немедленно обновляем UI
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        console.error('❌ Delete error:', data);
        toast.error(data.error || 'Ошибка при удалении товара');
      }
    } catch (error) {
      console.error('❌ Delete catch error:', error);
      toast.error('Ошибка соединения при удалении товара');
    } finally {
      setDeletingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleEdit = (product: Product) => {
    try {
      console.log('✏️ Starting edit for product:', product.name);
      
      setEditingProduct(product);
      setIsAdding(true);
      
      // Заполняем форму данными товара
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '0',
        category: product.category || '',
        inStock: Boolean(product.inStock),
        featured: Boolean(product.featured),
        images: product.images?.map(img => img.url) || [product.mainImage].filter(Boolean),
      });

      toast.success('Товар готов к редактированию');
      
    } catch (error) {
      console.error('Edit error:', error);
      toast.error('Ошибка подготовки формы редактирования');
    }
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingProduct(null);
    setForm({
      name: '',
      description: '',
      price: '',
      category: '',
      inStock: true,
      featured: false,
      images: [],
    });
    toast.info('Редактирование отменено');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Панель администратора</h1>
            <p className="text-gray-600 mt-2">Управление товарами магазина</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsAdding(true);
              setEditingProduct(null);
              setForm({
                name: '',
                description: '',
                price: '',
                category: '',
                inStock: true,
                featured: false,
                images: [],
              });
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Добавить товар
          </motion.button>
        </div>

        {/* Форма добавления/редактирования товара */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? `Редактирование: ${editingProduct.name}` : 'Добавление товара'}
              </h2>
              {editingProduct && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  Режим редактирования
                </span>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название товара *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Введите название товара"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена (₽) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Подробное описание товара"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория *
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Например: Одежда, Электроника"
                    required
                  />
                </div>
                
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.inStock}
                      onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">В наличии</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">Избранное</span>
                  </label>
                </div>
              </div>

              {/* Загрузка изображений */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Изображения товара {form.images.length > 0 && `(${form.images.length})`}
                </label>
                
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      uploadMethod === 'url' 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <LinkIcon size={16} />
                    URL ссылка
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('file')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      uploadMethod === 'file' 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Upload size={16} />
                    Загрузить файл
                  </button>
                </div>

                {uploadMethod === 'url' && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      disabled={!newImageUrl.trim()}
                      className="bg-green-600 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                      Добавить
                    </button>
                  </div>
                )}

                {uploadMethod === 'file' && (
                  <div className="mb-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-colors"
                    />
                    {isUploading && (
                      <div className="mt-2 flex items-center gap-2 text-purple-600">
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Загрузка файла...</span>
                      </div>
                    )}
                  </div>
                )}
                
                {form.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">Добавленные изображения:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {form.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-purple-500 transition-colors"
                            onError={(e) => {
                              console.error('Image load error:', url);
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUM5QzlGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md"
                            title="Удалить изображение"
                          >
                            <X size={14} />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow-sm">
                              Главная
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-lg transition-all min-w-[160px] justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {editingProduct ? 'Обновление...' : 'Добавление...'}
                    </>
                  ) : (
                    <>
                      {editingProduct ? <Save size={16} /> : <Plus size={16} />}
                      {editingProduct ? 'Обновить товар' : 'Добавить товар'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Список товаров */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Список товаров
              </h3>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {products.length} товаров
              </span>
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-2">Товаров пока нет</p>
              <p className="text-gray-400 text-sm">
                Добавьте первый товар через форму выше
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Товар</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Цена</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Категория</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Статус</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={product.mainImage}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded border group-hover:border-purple-500 transition-colors"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjI0IiB5PSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM5QzlDOUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+Tm8gSW1nPC90ZXh0Pgo8L3N2Zz4K';
                              }}
                            />
                            {product.featured && (
                              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{product.name}</div>
                            <div className="text-gray-500 text-sm line-clamp-2">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{product.price} ₽</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.inStock 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {product.inStock ? 'В наличии' : 'Нет в наличии'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                            title="Редактировать товар"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deletingProducts.has(product.id)}
                            className={`p-2 rounded-lg transition-colors border ${
                              deletingProducts.has(product.id) 
                                ? 'text-gray-400 cursor-not-allowed border-gray-300' 
                                : 'text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300'
                            }`}
                            title="Удалить товар"
                          >
                            {deletingProducts.has(product.id) ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}