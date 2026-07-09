import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateQuantity,
  removeFromCart as apiRemoveFromCart,
  mergeCart as apiMergeCart,
  clearCartOnServer,
} from "../api/cartService";

const CartContext = createContext(null);
const GUEST_KEY = "pethub_guest_cart";

function loadGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

function normalizeItem(item) {
  const product = item.product || item;
  return {
    _id: product._id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    images: product.images || [],
    category: product.category,
    stock: product.stock,
    quantity: item.quantity || 1,
  };
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const merging = useRef(false);

  // ---- Load cart on mount or when user changes ----
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (user) {
        try {
          const res = await fetchCart();
          const serverItems = (res.data.items || []).map(normalizeItem);

          // Merge guest cart into server cart once on login
          const guest = loadGuestCart();
          if (guest.length > 0 && !merging.current) {
            merging.current = true;
            const payload = guest.map((g) => ({
              productId: g._id,
              quantity: g.quantity,
            }));
            const merged = await apiMergeCart(payload);
            const mergedItems = (merged.data.items || []).map(normalizeItem);
            setItems(mergedItems);
            localStorage.removeItem(GUEST_KEY);
          } else {
            setItems(serverItems);
          }
        } catch {
          setItems([]);
        }
      } else {
        setItems(loadGuestCart());
      }
      setLoading(false);
    };
    load();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Persist guest cart to localStorage ----
  useEffect(() => {
    if (!user) {
      saveGuestCart(items);
    }
  }, [items, user]);

  // ---- Add item ----
  const addItem = useCallback(async (product, quantity = 1) => {
    if (user) {
      try {
        const res = await apiAddToCart(product._id, quantity);
        setItems((res.data.items || []).map(normalizeItem));
      } catch {
        // fallback to local
        setItems((prev) => {
          const existing = prev.find((i) => i._id === product._id);
          if (existing) {
            return prev.map((i) =>
              i._id === product._id ? { ...i, quantity: i.quantity + quantity } : i
            );
          }
          return [...prev, { ...product, quantity }];
        });
      }
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => i._id === product._id);
        if (existing) {
          return prev.map((i) =>
            i._id === product._id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { ...product, quantity }];
      });
    }
  }, [user]);

  // ---- Update quantity ----
  const updateQuantity = useCallback(async (id, quantity) => {
    const qty = Math.max(1, quantity);
    if (user) {
      try {
        const res = await apiUpdateQuantity(id, qty);
        setItems((res.data.items || []).map(normalizeItem));
      } catch {
        setItems((prev) =>
          prev.map((i) => (i._id === id ? { ...i, quantity: qty } : i))
        );
      }
    } else {
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, quantity: qty } : i))
      );
    }
  }, [user]);

  // ---- Remove item ----
  const removeItem = useCallback(async (id) => {
    if (user) {
      try {
        const res = await apiRemoveFromCart(id);
        setItems((res.data.items || []).map(normalizeItem));
      } catch {
        setItems((prev) => prev.filter((i) => i._id !== id));
      }
    } else {
      setItems((prev) => prev.filter((i) => i._id !== id));
    }
  }, [user]);

  // ---- Clear cart ----
  const clearCart = useCallback(async () => {
    if (user) {
      try {
        await clearCartOnServer();
      } catch {
        // ignore
      }
    }
    setItems([]);
  }, [user]);

  // ---- Sync from server (for external updates) ----
  const syncCart = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetchCart();
      setItems((res.data.items || []).map(normalizeItem));
    } catch {
      // ignore
    }
  }, [user]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
