import { useState, useCallback, type ReactNode } from "react";
import { CartContext } from "./cartContextDef";
import type { CartItem } from "./cartContextDef";
import type { Item } from "@/types/PageTypes";

export type { CartItem };
export { CartContext };

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: Item, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + quantity }
            : ci,
        );
      }
      return [...prev, { item, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
      return;
    }
    setCart((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity } : ci)),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const totalItems = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
