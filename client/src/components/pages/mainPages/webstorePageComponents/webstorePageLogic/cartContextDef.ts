import { createContext } from "react";
import type { Item } from "@/types/PageTypes";

export interface CartItem {
  item: Item;
  quantity: number;
}

export interface CartContextValue {
  cart: CartItem[];
  addToCart: (item: Item, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const noop = () => {};

export const CartContext = createContext<CartContextValue>({
  cart: [],
  addToCart: noop,
  removeFromCart: noop,
  updateQuantity: noop,
  clearCart: noop,
  totalItems: 0,
  totalPrice: 0,
});
