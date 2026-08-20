const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/api\/?$/, "");

export function getImageUrl(img) {
  if (!img || typeof img !== "string") return null;
  if (img.startsWith("http")) return img;
  if (img.startsWith("/uploads")) return `${API_BASE}${img}`;
  return img;
}

export function getProductImage(product) {
  if (!product) return null;
  const img = product.images?.[0] || product.image;
  return getImageUrl(img);
}
