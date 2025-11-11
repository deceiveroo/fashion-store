// lib/productUtils.ts
export const normalizeProductImage = (product: any): string => {
  // Если есть mainImage - используем его
  if (product.mainImage && typeof product.mainImage === 'string') {
    return product.mainImage;
  }
  
  // Если есть массив images
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const mainImage = product.images.find((img: any) => img.isMain) || product.images[0];
    return mainImage.url;
  }
  
  // Fallback
  return '/api/placeholder/300/300';
};

export const normalizeProductForCart = (product: any) => {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: normalizeProductImage(product),
  };
};