import { useState, useEffect } from "react";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useTheme } from "../contexts/ThemeContext";

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  title: string;
  price: number;
  image: string;
}

interface ShoppingCartProps {
  cart: CartItem[];
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemoveItem: (variantId: string) => void;
  onCheckout: () => void;
}

export default function ShoppingCartComponent({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: ShoppingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { getColors } = useTheme();
  const colors = getColors();

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  useEffect(() => {
    if ((cart?.length || 0) > 0) {
      setIsVisible(true);
    }
  }, [(cart?.length || 0)]);

  useEffect(() => {
    // Listen for cart animation events
    const handleCartAnimation = (e: CustomEvent) => {
      const cartIcon = document.getElementById("cart-icon");
      if (cartIcon) {
        cartIcon.classList.add("animate-bounce");
        setTimeout(() => {
          cartIcon.classList.remove("animate-bounce");
        }, 600);
      }
    };

    window.addEventListener("cartItemAdded" as any, handleCartAnimation);
    return () =>
      window.removeEventListener("cartItemAdded" as any, handleCartAnimation);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        className="relative p-2 focus:outline-none focus:ring-0"
        id="cart-icon"
      >
        <ShoppingCart className="h-5 w-5" style={{ color: colors.text }} />
        {totalItems > 0 && (
          <span
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs flex items-center justify-center text-white"
            style={{ backgroundColor: colors.primary }}
          >
            {totalItems}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 z-50">
          <Card
            style={{
              backgroundColor: colors.card,
              borderColor: colors.primary,
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="font-bold text-lg"
                  style={{ color: colors.text }}
                >
                  Shopping Cart
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {(cart || []).length === 0 ? (
                <p style={{ color: colors.textMuted }}>Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {(cart || []).map((item) => (
                      <div
                        key={item.variantId}
                        className="flex items-center space-x-3"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4
                            className="text-sm font-semibold"
                            style={{ color: colors.text }}
                          >
                            {item.title}
                          </h4>
                          <p
                            className="text-sm"
                            style={{ color: colors.textMuted }}
                          >
                            ${item.price}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onUpdateQuantity(
                                item.variantId,
                                item.quantity - 1,
                              )
                            }
                            className="h-6 w-6 p-0 focus:outline-none focus:ring-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span
                            className="text-sm mx-2"
                            style={{ color: colors.text }}
                          >
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onUpdateQuantity(
                                item.variantId,
                                item.quantity + 1,
                              )
                            }
                            className="h-6 w-6 p-0 focus:outline-none focus:ring-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.variantId)}
                          className="h-6 w-6 p-0 focus:outline-none focus:ring-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div
                    className="border-t pt-3"
                    style={{ borderColor: colors.primary }}
                  >
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: colors.textMuted }}>
                          Subtotal:
                        </span>
                        <span style={{ color: colors.text }}>
                          ${subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: colors.textMuted }}>Tax:</span>
                        <span style={{ color: colors.text }}>
                          ${tax.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span style={{ color: colors.text }}>Total:</span>
                        <span style={{ color: colors.text }}>
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={onCheckout}
                      className="w-full mt-3 font-bold focus:outline-none focus:ring-0"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.primaryText || "white",
                      }}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
