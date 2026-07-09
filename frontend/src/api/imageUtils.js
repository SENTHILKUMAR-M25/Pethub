const BASE_URL = import.meta.env.VITE_IMAGE_URL || "";

export function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_URL}${img}`;
}

export function getProductImage(product) {
  if (!product) return null;
  const img = product.images?.[0] || product.image;
  return getImageUrl(img);
}
