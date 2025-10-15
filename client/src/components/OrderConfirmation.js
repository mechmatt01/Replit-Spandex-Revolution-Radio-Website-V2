import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Package, Mail, CreditCard, ArrowLeft, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useTheme } from "../contexts/ThemeContext";
export default function OrderConfirmation() {
    const [location, setLocation] = useLocation();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const { getColors } = useTheme();
    const colors = getColors();
    useEffect(() => {
        // Extract order details from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');
        const productId = urlParams.get('product_id');
        if (orderId) {
            // In a real implementation, this would fetch order details from Shopify API
            // For now, we'll simulate with sample data
            setTimeout(() => {
                setOrderDetails({
                    orderId: orderId,
                    items: [
                        {
                            id: productId || "1",
                            title: "Spandex Salvation Classic Tee",
                            variant: "Large",
                            quantity: 1,
                            price: 24.99,
                            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                        }
                    ],
                    subtotal: 24.99,
                    shipping: 5.99,
                    tax: 2.05,
                    total: 33.03,
                    customerEmail: "customer@example.com",
                    shippingAddress: {
                        name: "John Doe",
                        address1: "123 Metal Street",
                        city: "Rock City",
                        state: "CA",
                        zip: "90210",
                        country: "United States"
                    },
                    paymentMethod: "•••• 4242",
                    estimatedDelivery: "3-5 business days",
                    trackingNumber: "1Z999AA1234567890"
                });
                setLoading(false);
            }, 1000);
        }
        else {
            setLoading(false);
        }
    }, []);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-dark-bg flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4", style: { borderColor: colors.primary } }), _jsx("p", { className: "text-white font-semibold", children: "Loading order details..." })] }) }));
    }
    if (!orderDetails) {
        return (_jsx("div", { className: "min-h-screen bg-dark-bg flex items-center justify-center", children: _jsx(Card, { className: "bg-gray-900 border-gray-800 max-w-md w-full mx-4", children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(Package, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h2", { className: "text-xl font-bold text-white mb-2", children: "Order Not Found" }), _jsx("p", { className: "text-gray-400 mb-6", children: "We couldn't find the order you're looking for." }), _jsx(Button, { onClick: () => setLocation('/'), className: "w-full font-bold transition-all duration-300", style: { backgroundColor: colors.primary }, children: "Return to Home" })] }) }) }));
    }
    const handleContinueShopping = () => {
        setLocation('/');
    };
    const handleViewOrder = () => {
        // In a real implementation, this would redirect to Shopify order tracking
        window.open(`https://spandexsalvation.myshopify.com/account/orders/${orderDetails.orderId}`, '_blank');
    };
    return (_jsx("div", { className: "min-h-screen bg-dark-bg py-12 px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx(CheckCircle, { className: "h-16 w-16", style: { color: colors.primary } }) }), _jsx("h1", { className: "text-3xl font-black text-white mb-2", children: "Order Confirmed!" }), _jsxs("p", { className: "text-gray-400 text-lg", children: ["Thank you for your order. We've sent a confirmation email to", " ", _jsx("span", { className: "text-white font-semibold", children: orderDetails.customerEmail })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs(Card, { className: "bg-gray-900 border-gray-800", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-white font-black", children: "Order Summary" }), _jsxs("p", { className: "text-gray-400", children: ["Order #", orderDetails.orderId] })] }), _jsxs(CardContent, { className: "space-y-4", children: [orderDetails.items.map((item) => (_jsxs("div", { className: "flex items-center space-x-4 p-4 bg-gray-800 rounded-lg", children: [_jsx("img", { src: item.image, alt: item.title, className: "h-16 w-16 object-cover rounded-lg" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-bold text-white", children: item.title }), _jsx("p", { className: "text-gray-400 text-sm", children: item.variant }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsxs("span", { className: "text-gray-400", children: ["Qty: ", item.quantity] }), _jsxs("span", { className: "font-bold text-white", children: ["$", item.price.toFixed(2)] })] })] })] }, item.id))), _jsxs("div", { className: "border-t border-gray-700 pt-4 space-y-2", children: [_jsxs("div", { className: "flex justify-between text-gray-400", children: [_jsx("span", { children: "Subtotal" }), _jsxs("span", { children: ["$", orderDetails.subtotal.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between text-gray-400", children: [_jsx("span", { children: "Shipping" }), _jsxs("span", { children: ["$", orderDetails.shipping.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between text-gray-400", children: [_jsx("span", { children: "Tax" }), _jsxs("span", { children: ["$", orderDetails.tax.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between text-white font-bold text-lg pt-2 border-t border-gray-700", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: ["$", orderDetails.total.toFixed(2)] })] })] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-gray-900 border-gray-800", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-white font-black flex items-center", children: [_jsx(Package, { className: "h-5 w-5 mr-2" }), "Shipping Address"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-gray-300 space-y-1", children: [_jsx("p", { className: "font-semibold text-white", children: orderDetails.shippingAddress.name }), _jsx("p", { children: orderDetails.shippingAddress.address1 }), orderDetails.shippingAddress.address2 && (_jsx("p", { children: orderDetails.shippingAddress.address2 })), _jsxs("p", { children: [orderDetails.shippingAddress.city, ", ", orderDetails.shippingAddress.state, " ", orderDetails.shippingAddress.zip] }), _jsx("p", { children: orderDetails.shippingAddress.country })] }), _jsxs("div", { className: "mt-4 p-3 bg-gray-800 rounded-lg", children: [_jsxs("div", { className: "flex items-center text-sm", children: [_jsx(Mail, { className: "h-4 w-4 mr-2", style: { color: colors.primary } }), _jsx("span", { className: "text-gray-400", children: "Estimated delivery: " }), _jsx("span", { className: "text-white font-semibold ml-1", children: orderDetails.estimatedDelivery })] }), orderDetails.trackingNumber && (_jsxs("div", { className: "flex items-center text-sm mt-2", children: [_jsx(Package, { className: "h-4 w-4 mr-2", style: { color: colors.primary } }), _jsx("span", { className: "text-gray-400", children: "Tracking: " }), _jsx("span", { className: "text-white font-semibold ml-1", children: orderDetails.trackingNumber })] }))] })] })] }), _jsxs(Card, { className: "bg-gray-900 border-gray-800", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-white font-black flex items-center", children: [_jsx(CreditCard, { className: "h-5 w-5 mr-2" }), "Payment Method"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(CreditCard, { className: "h-8 w-8 text-gray-400 mr-3" }), _jsxs("div", { children: [_jsxs("p", { className: "text-white font-semibold", children: ["Card ending in ", orderDetails.paymentMethod] }), _jsx("p", { className: "text-gray-400 text-sm", children: "Payment processed successfully" })] })] }), _jsx(Badge, { variant: "secondary", className: "bg-green-600 text-white", children: "Paid" })] }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { onClick: handleViewOrder, className: "w-full font-bold transition-all duration-300 focus:outline-none focus:ring-0", style: { backgroundColor: colors.primary }, children: [_jsx(Package, { className: "h-4 w-4 mr-2" }), "View Order in Account"] }), _jsxs(Button, { onClick: handleContinueShopping, variant: "outline", className: "w-full font-bold transition-all duration-300 border-gray-600 text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-0", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Continue Shopping"] })] })] })] }), _jsx(Card, { className: "bg-gray-900 border-gray-800 mt-8", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("h3", { className: "text-white font-bold mb-3", children: "What's Next?" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Mail, { className: "h-5 w-5 mt-0.5", style: { color: colors.primary } }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-semibold", children: "Order Confirmation" }), _jsx("p", { className: "text-gray-400", children: "You'll receive an email confirmation shortly" })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Package, { className: "h-5 w-5 mt-0.5", style: { color: colors.primary } }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-semibold", children: "Processing" }), _jsx("p", { className: "text-gray-400", children: "Your order will be processed within 1-2 business days" })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Download, { className: "h-5 w-5 mt-0.5", style: { color: colors.primary } }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-semibold", children: "Tracking" }), _jsx("p", { className: "text-gray-400", children: "You'll receive tracking information once shipped" })] })] })] })] }) })] }) }));
}
