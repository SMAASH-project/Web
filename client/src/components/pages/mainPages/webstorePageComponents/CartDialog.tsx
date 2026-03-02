import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "./webstorePageLogic/useCart";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { ShoppingCart, Trash2, Minus, Plus, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CartDialog() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  const { settings } = useSettings();
  const glass = settings.useLiquidGlass;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={`relative cursor-pointer gap-2 ${
            glass
              ? "bg-white/20 text-white hover:bg-white/30 [text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
              : "bg-green-600 text-white hover:bg-green-500"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Cart
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center text-[10px] font-bold bg-amber-500 text-black border-0 px-1">
              {totalItems}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart
          </DialogTitle>
          <DialogDescription>
            {cart.length === 0
              ? "Your cart is empty."
              : `${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart`}
          </DialogDescription>
        </DialogHeader>

        {cart.length > 0 && (
          <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
            {cart.map(({ item, quantity }) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
              >
                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Coins className="w-3 h-3 text-amber-400/80" />
                    <span className="text-xs text-muted-foreground">
                      {item.price.toLocaleString()} each
                    </span>
                  </div>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, quantity - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium w-6 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                {/* Line total */}
                <div className="flex items-center gap-1 min-w-15 justify-end">
                  <Coins className="w-3.5 h-3.5 text-amber-400/80" />
                  <span className="text-sm font-bold">
                    {(item.price * quantity).toLocaleString()}
                  </span>
                </div>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <DialogFooter>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total:</span>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-lg font-bold">
                  {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={clearCart}
              >
                Clear
              </Button>
              <DialogClose asChild>
                <Button size="sm" className="cursor-pointer">
                  Purchase
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
