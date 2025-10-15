import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useTheme } from "../contexts/ThemeContext";
export default function ShoppingCartComponent({ cart, onUpdateQuantity, onRemoveItem, onCheckout, }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const { getColors } = useTheme();
    const colors = getColors();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    useEffect(() => {
        if ((cart?.length || 0) > 0) {
            setIsVisible(true);
        }
    }, [(cart?.length || 0)]);
    useEffect(() => {
        // Listen for cart animation events
        const handleCartAnimation = (e) => {
            const cartIcon = document.getElementById("cart-icon");
            if (cartIcon) {
                cartIcon.classList.add("animate-bounce");
                setTimeout(() => {
                    cartIcon.classList.remove("animate-bounce");
                }, 600);
            }
        };
        window.addEventListener("cartItemAdded", handleCartAnimation);
        return () => window.removeEventListener("cartItemAdded", handleCartAnimation);
    }, []);
    if (!isVisible)
        return null;
    return (_jsxs("div", { className: "relative", children: [_jsxs(Button, { onClick: () => setIsOpen(!isOpen), variant: "ghost", className: "relative p-2 focus:outline-none focus:ring-0", id: "cart-icon", children: [_jsx(ShoppingCart, { className: "h-5 w-5", style: { color: colors.text } }), totalItems > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs flex items-center justify-center text-white", style: { backgroundColor: colors.primary }, children: totalItems }))] }), isOpen && (_jsx("div", { className: "absolute top-full right-0 mt-2 w-80 z-50", children: _jsx(Card, { style: {
                        backgroundColor: colors.card,
                        borderColor: colors.primary,
                    }, children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-bold text-lg", style: { color: colors.text }, children: "Shopping Cart" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsOpen(false), children: _jsx(X, { className: "h-4 w-4" }) })] }), (cart || []).length === 0 ? (_jsx("p", { style: { color: colors.textMuted }, children: "Your cart is empty" })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "space-y-3 mb-4 max-h-60 overflow-y-auto", children: (cart || []).map((item) => (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("img", { src: item.image, alt: item.title, className: "w-12 h-12 object-cover rounded" }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-sm font-semibold", style: { color: colors.text }, children: item.title }), _jsxs("p", { className: "text-sm", style: { color: colors.textMuted }, children: ["$", item.price] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => onUpdateQuantity(item.variantId, item.quantity - 1), className: "h-6 w-6 p-0 focus:outline-none focus:ring-0", children: _jsx(Minus, { className: "h-3 w-3" }) }), _jsx("span", { className: "text-sm mx-2", style: { color: colors.text }, children: item.quantity }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => onUpdateQuantity(item.variantId, item.quantity + 1), className: "h-6 w-6 p-0 focus:outline-none focus:ring-0", children: _jsx(Plus, { className: "h-3 w-3" }) })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => onRemoveItem(item.variantId), className: "h-6 w-6 p-0 focus:outline-none focus:ring-0", children: _jsx(X, { className: "h-3 w-3" }) })] }, item.variantId))) }), _jsxs("div", { className: "border-t pt-3", style: { borderColor: colors.primary }, children: [_jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { style: { color: colors.textMuted }, children: "Subtotal:" }), _jsxs("span", { style: { color: colors.text }, children: ["$", subtotal.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { style: { color: colors.textMuted }, children: "Tax:" }), _jsxs("span", { style: { color: colors.text }, children: ["$", tax.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between font-bold", children: [_jsx("span", { style: { color: colors.text }, children: "Total:" }), _jsxs("span", { style: { color: colors.text }, children: ["$", total.toFixed(2)] })] })] }), _jsx(Button, { onClick: onCheckout, className: "w-full mt-3 font-bold focus:outline-none focus:ring-0", style: {
                                                    backgroundColor: colors.primary,
                                                    color: colors.primaryText || "white",
                                                }, children: "Proceed to Checkout" })] })] }))] }) }) }))] }));
}
