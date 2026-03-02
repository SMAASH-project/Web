import { useContext } from "react";
import { CartContext } from "./cartContextDef";

export function useCart() {
  return useContext(CartContext);
}
