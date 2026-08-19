import { createContext, useContext, useState, useEffect, useCallback } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "pethub_wishlist";

function loadWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWishlist(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => loadWishlist());

  useEffect(() => {
    saveWishlist(items);
  }, [items]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      if (prev.find((i) => i._id === product._id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const toggleItem = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i._id === product._id);
      if (exists) {
        return prev.filter((i) => i._id !== product._id);
      }
      return [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback(
    (id) => items.some((i) => i._id === id),
    [items]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
