import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { ShoppingCart, Star, Heart, Share, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { useTheme } from "../contexts/ThemeContext";
// Sample product data - would be fetched from Shopify API
const sampleProducts = [
    {
        id: "1",
        title: "Spandex Salvation Classic Tee",
        description: "Premium cotton tee with vintage logo design. Perfect for any metal fan.",
        price: 24.99,
        compareAtPrice: 29.99,
        images: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
        ],
        variants: [
            {
                id: "1-s",
                title: "Small",
                price: 24.99,
                available: true,
                option1: "S",
            },
            {
                id: "1-m",
                title: "Medium",
                price: 24.99,
                available: true,
                option1: "M",
            },
            {
                id: "1-l",
                title: "Large",
                price: 24.99,
                available: true,
                option1: "L",
            },
            {
                id: "1-xl",
                title: "X-Large",
                price: 24.99,
                available: false,
                option1: "XL",
            },
        ],
        tags: ["apparel", "tee", "classic"],
        rating: 4.8,
        reviewCount: 127,
        inStock: true,
        featured: true,
    },
    {
        id: "2",
        title: "Rebellion Hoodie",
        description: "Heavy-duty hoodie with embroidered logo. Built for the coldest metal nights.",
        price: 49.99,
        images: [
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
        ],
        variants: [
            {
                id: "2-s",
                title: "Small",
                price: 49.99,
                available: true,
                option1: "S",
            },
            {
                id: "2-m",
                title: "Medium",
                price: 49.99,
                available: true,
                option1: "M",
            },
            {
                id: "2-l",
                title: "Large",
                price: 49.99,
                available: true,
                option1: "L",
            },
        ],
        tags: ["apparel", "hoodie", "winter"],
        rating: 4.9,
        reviewCount: 89,
        inStock: true,
    },
    {
        id: "3",
        title: "Metal Fuel Coffee Mug",
        description: "15oz ceramic mug to fuel your metal mornings. Dishwasher safe.",
        price: 19.99,
        images: [
            "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
        ],
        variants: [
            { id: "3-default", title: "Default", price: 19.99, available: true },
        ],
        tags: ["accessories", "mug", "coffee"],
        rating: 4.6,
        reviewCount: 234,
        inStock: true,
        featured: true,
    },
    {
        id: "4",
        title: "Limited Edition Vinyl Collection",
        description: "Exclusive compilation of classic metal hits. Limited to 500 copies.",
        price: 34.99,
        images: [
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
        ],
        variants: [
            {
                id: "4-default",
                title: "Limited Edition",
                price: 34.99,
                available: true,
            },
        ],
        tags: ["music", "vinyl", "limited"],
        rating: 5.0,
        reviewCount: 45,
        inStock: true,
        featured: true,
    },
];
export default function ShopifyEcommerce() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { getColors, currentTheme } = useTheme();
    const colors = getColors();
    useEffect(() => {
        // Simulate API call to Shopify
        setTimeout(() => {
            setProducts(sampleProducts);
            setLoading(false);
        }, 1000);
    }, []);
    const addToCart = (product, variant, quantity = 1) => {
        const existingItem = cart.find((item) => item.variantId === variant.id);
        if (existingItem) {
            setCart(cart.map((item) => item.variantId === variant.id
                ? { ...item, quantity: item.quantity + quantity }
                : item));
        }
        else {
            setCart([
                ...cart,
                {
                    productId: product.id,
                    variantId: variant.id,
                    quantity,
                    title: `${product.title} - ${variant.title}`,
                    price: variant.price,
                    image: product.images[0],
                },
            ]);
        }
        toast({
            title: "Added to Cart",
            description: `${product.title} has been added to your cart.`,
        });
    };
    const handleBuyNow = (product, variant) => {
        // For direct checkout, we create a temporary checkout session
        // In a real implementation, this would integrate with Shopify's Checkout API
        toast({
            title: "Redirecting to Checkout",
            description: `Taking you to secure checkout for ${product.title}...`,
        });
        // Simulate direct checkout process
        setTimeout(() => {
            // Generate a mock order ID for demo purposes
            const orderId = `SS${Date.now().toString().slice(-6)}`;
            // In a real implementation, this would redirect to Shopify checkout
            // For demo purposes, we'll redirect to our custom confirmation page
            const confirmationUrl = `/order-confirmation?order_id=${orderId}&product_id=${product.id}&variant_id=${variant.id}`;
            window.location.href = confirmationUrl;
        }, 1000);
    };
    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };
    const handleCheckout = async () => {
        // In a real implementation, this would redirect to Shopify checkout
        const checkoutUrl = `https://spandex-salvation-radio.myshopify.com/cart/${(cart || []).map((item) => `${item.variantId}:${item.quantity}`).join(",")}`;
        toast({
            title: "Redirecting to Checkout",
            description: "Taking you to secure Shopify checkout...",
        });
        // Simulate redirect
        console.log("Redirecting to:", checkoutUrl);
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" }) }));
    }
    return (_jsx("section", { id: "merch", className: "py-20 transition-colors duration-300", style: { backgroundColor: colors.background }, children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "font-orbitron font-black text-3xl md:text-4xl mb-4", style: {
                                color: currentTheme === 'light-mode' ? '#000000' : colors.text
                            }, children: "OFFICIAL MERCH STORE" }), _jsx("p", { className: "text-lg font-semibold", style: { color: colors.textMuted }, children: "Show your metal pride with exclusive Spandex Salvation Radio merchandise." })] }), (cart || []).length > 0 && (_jsx("div", { className: "mb-8", children: _jsx(Card, { className: "transition-all duration-300", style: {
                            backgroundColor: currentTheme === 'light-mode' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 30, 30, 0.5)',
                        }, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(ShoppingCart, { className: "h-5 w-5 mr-2", style: { color: colors.primary } }), _jsxs("span", { className: "font-black", style: { color: currentTheme === 'light-mode' ? '#000000' : '#ffffff' }, children: [(cart || []).reduce((total, item) => total + item.quantity, 0), " ", "items in cart"] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("span", { className: "font-black text-xl text-metal-orange", children: ["$", getCartTotal().toFixed(2)] }), _jsx(Button, { onClick: handleCheckout, className: "bg-metal-orange hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold", children: "Checkout" })] })] }) }) }) })), _jsxs("div", { className: "mb-12 text-center", children: [_jsx("h3", { className: "font-black text-xl mb-6 text-center", style: { color: colors.primary }, children: "Featured Products" }), _jsx("div", { className: "w-full flex justify-center", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center", children: products
                                    ?.filter((product) => product.featured)
                                    .map((product) => (_jsx(ProductCard, { product: product, onAddToCart: (variant, quantity) => addToCart(product, variant, quantity), onViewDetails: () => setSelectedProduct(product) }, product.id))) }) })] }), selectedProduct && (_jsx(ProductModal, { product: selectedProduct, onClose: () => setSelectedProduct(null), onAddToCart: (variant, quantity) => addToCart(selectedProduct, variant, quantity) }))] }) }));
}
function ProductCard({ product, onAddToCart, onViewDetails, }) {
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const { getColors, currentTheme } = useTheme();
    const colors = getColors();
    return (_jsx(Card, { className: "transition-all duration-300 group h-full flex flex-col", style: {
            backgroundColor: currentTheme === 'light-mode' ? '#ffffff' : 'rgba(30, 30, 30, 0.5)',
            border: 'none'
        }, children: _jsxs(CardContent, { className: "p-4 flex flex-col h-full", children: [_jsxs("div", { className: "relative mb-4", children: [_jsx("img", { src: product.images[0], alt: product.title, className: "w-full h-48 object-cover rounded-lg" }), product.featured && (_jsx(Badge, { className: "absolute top-2 left-2", style: { backgroundColor: colors.primary, color: "white" }, children: "Featured" })), product.compareAtPrice && (_jsx(Badge, { className: "absolute top-2 left-2 w-auto", style: {
                                backgroundColor: "#dc2626",
                                color: "white",
                                marginTop: product.featured ? "30px" : "0"
                            }, children: "Sale" })), _jsxs("div", { className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2", children: [_jsx(Button, { size: "sm", variant: "secondary", onClick: onViewDetails, className: "bg-white/90 text-black hover:bg-white focus:outline-none focus:ring-0", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "secondary", className: "bg-white/90 text-black hover:bg-white focus:outline-none focus:ring-0", children: _jsx(Heart, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "secondary", className: "bg-white/90 text-black hover:bg-white focus:outline-none focus:ring-0", children: _jsx(Share, { className: "h-4 w-4" }) })] })] }), _jsx("h4", { className: "font-black mb-2", style: { color: currentTheme === 'light-mode' ? '#000000' : '#ffffff' }, children: product.title }), _jsx("p", { className: "text-sm font-semibold line-clamp-2 flex-grow", style: { color: colors.textMuted }, children: product.description }), _jsxs("div", { className: "flex flex-col items-center mb-3 mt-3", children: [_jsxs("div", { className: "flex items-center", children: [[...Array(5)].map((_, i) => (_jsx(Star, { className: `h-4 w-4 ${i < Math.floor(product.rating)
                                        ? "fill-current"
                                        : "text-gray-600"}`, style: {
                                        color: i < Math.floor(product.rating) ? colors.accent : undefined
                                    } }, i))), _jsxs("span", { className: "text-sm font-semibold ml-2", style: {
                                        color: currentTheme === 'light-mode' ? '#6b7280' : '#9ca3af'
                                    }, children: ["(", product.reviewCount, ")"] })] }), _jsxs("div", { className: "mt-2 mb-3", children: [_jsxs("span", { className: "text-xl font-black text-metal-orange", children: ["$", product.price] }), product.compareAtPrice && (_jsxs("span", { className: "line-through ml-2", style: {
                                        color: currentTheme === 'light-mode' ? '#6b7280' : '#9ca3af'
                                    }, children: ["$", product.compareAtPrice] }))] }), !product.inStock && (_jsx(Badge, { variant: "secondary", className: "bg-gray-600 text-white mt-2", children: "Out of Stock" }))] }), _jsxs("div", { className: "mt-auto", children: [(product.variants || []).length > 1 && (_jsxs("div", { className: "relative mb-3", children: [_jsx("select", { value: selectedVariant.id, onChange: (e) => setSelectedVariant(product.variants?.find((v) => v.id === e.target.value)), className: "w-full p-2 rounded appearance-none pr-8 text-center", style: {
                                        backgroundColor: currentTheme === 'light-mode' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 30, 30, 0.5)',
                                        color: currentTheme === 'light-mode' ? '#000000' : '#ffffff',
                                        borderColor: colors.primary,
                                        textAlign: 'center'
                                    }, children: (product.variants || []).map((variant) => (_jsxs("option", { value: variant.id, disabled: !variant.available, children: [variant.title, " ", !variant.available && "(Out of Stock)"] }, variant.id))) }), _jsx("div", { className: "absolute inset-y-0 right-2 flex items-center pointer-events-none", children: _jsx("svg", { className: "w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) }) })] })), _jsxs(Button, { onClick: () => console.log('Buy now:', product, selectedVariant), disabled: !product.inStock || !selectedVariant.available, className: "w-full font-bold transition-all duration-300 focus:outline-none focus:ring-0", style: {
                                backgroundColor: colors.primary,
                                color: colors.primaryText || "white",
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor =
                                    colors.primaryDark || colors.primary;
                                e.currentTarget.style.transform = "scale(1.02)";
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = colors.primary;
                                e.currentTarget.style.transform = "scale(1)";
                            }, children: [_jsx(ShoppingCart, { className: "mr-2 h-4 w-4" }), "Buy Now"] })] })] }) }));
}
function ProductModal({ product, onClose, onAddToCart }) {
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const [quantity, setQuantity] = useState(1);
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50", children: _jsx(Card, { className: "bg-dark-bg max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-6", children: [_jsx("h3", { className: "font-black text-2xl", style: { color: '#ffffff' }, children: product.title }), _jsx(Button, { variant: "ghost", onClick: onClose, className: "text-gray-400 hover:text-white", children: "\u00D7" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx("div", { children: _jsx("img", { src: product.images[0], alt: product.title, className: "w-full h-64 object-cover rounded-lg" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold mb-4", style: { color: '#9ca3af' }, children: product.description }), _jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "flex items-center", children: [...Array(5)].map((_, i) => (_jsx(Star, { className: `h-5 w-5 ${i < Math.floor(product.rating)
                                                        ? "fill-current"
                                                        : "text-gray-600"}`, style: {
                                                        color: i < Math.floor(product.rating) ? '#f59e0b' : undefined
                                                    } }, i))) }), _jsxs("span", { className: "font-semibold ml-2", style: {
                                                    color: '#9ca3af'
                                                }, children: [product.rating, " (", product.reviewCount, " reviews)"] })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("span", { className: "text-2xl font-black text-metal-orange", children: ["$", selectedVariant.price] }), product.compareAtPrice && (_jsxs("span", { className: "line-through ml-2", style: {
                                                    color: '#9ca3af'
                                                }, children: ["$", product.compareAtPrice] }))] }), (product.variants || []).length > 1 && (_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "Size:" }), _jsx("select", { value: selectedVariant.id, onChange: (e) => setSelectedVariant(product.variants?.find((v) => v.id === e.target.value)), className: "w-full p-2 bg-dark-bg text-white placeholder-gray-500 rounded text-center", style: { textAlign: 'center' }, children: (product.variants || []).map((variant) => (_jsxs("option", { value: variant.id, disabled: !variant.available, children: [variant.title, " ", !variant.available && "(Out of Stock)"] }, variant.id))) })] })), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "Quantity:" }), _jsx("input", { type: "number", min: "1", max: "10", value: quantity, onChange: (e) => setQuantity(parseInt(e.target.value)), className: "w-20 p-2 bg-dark-bg/50 text-white rounded" })] }), _jsxs(Button, { onClick: () => {
                                            console.log('Buy now:', product, selectedVariant);
                                            onClose();
                                        }, disabled: !product.inStock || !selectedVariant.available, className: "w-full bg-metal-orange hover:bg-orange-600 text-white font-bold focus:outline-none focus:ring-0", children: [_jsx(ShoppingCart, { className: "mr-2 h-4 w-4" }), "Buy Now - $", (selectedVariant.price * quantity).toFixed(2)] })] })] })] }) }) }));
}
