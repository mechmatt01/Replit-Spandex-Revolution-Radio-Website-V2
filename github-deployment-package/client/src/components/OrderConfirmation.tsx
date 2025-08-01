import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Package, Mail, CreditCard, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";

interface OrderItem {
  id: string;
  title: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
}

interface OrderDetails {
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customerEmail: string;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: string;
  estimatedDelivery: string;
  trackingNumber?: string;
}

export default function OrderConfirmation() {
  const [location, setLocation] = useLocation();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
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
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.primary }}></div>
          <p className="text-white font-semibold">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
            <p className="text-gray-400 mb-6">
              We couldn't find the order you're looking for.
            </p>
            <Button 
              onClick={() => setLocation('/')}
              className="w-full font-bold transition-all duration-300"
              style={{ backgroundColor: colors.primary }}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleContinueShopping = () => {
    setLocation('/');
  };

  const handleViewOrder = () => {
    // In a real implementation, this would redirect to Shopify order tracking
    window.open(`https://spandexsalvation.myshopify.com/account/orders/${orderDetails.orderId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16" style={{ color: colors.primary }} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Order Confirmed!</h1>
          <p className="text-gray-400 text-lg">
            Thank you for your order. We've sent a confirmation email to{" "}
            <span className="text-white font-semibold">{orderDetails.customerEmail}</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white font-black">Order Summary</CardTitle>
              <p className="text-gray-400">Order #{orderDetails.orderId}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderDetails.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.variant}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-400">Qty: {item.quantity}</span>
                      <span className="font-bold text-white">${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>${orderDetails.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax</span>
                  <span>${orderDetails.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-gray-700">
                  <span>Total</span>
                  <span>${orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Payment Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-black flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 space-y-1">
                  <p className="font-semibold text-white">{orderDetails.shippingAddress.name}</p>
                  <p>{orderDetails.shippingAddress.address1}</p>
                  {orderDetails.shippingAddress.address2 && (
                    <p>{orderDetails.shippingAddress.address2}</p>
                  )}
                  <p>
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zip}
                  </p>
                  <p>{orderDetails.shippingAddress.country}</p>
                </div>
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2" style={{ color: colors.primary }} />
                    <span className="text-gray-400">Estimated delivery: </span>
                    <span className="text-white font-semibold ml-1">{orderDetails.estimatedDelivery}</span>
                  </div>
                  {orderDetails.trackingNumber && (
                    <div className="flex items-center text-sm mt-2">
                      <Package className="h-4 w-4 mr-2" style={{ color: colors.primary }} />
                      <span className="text-gray-400">Tracking: </span>
                      <span className="text-white font-semibold ml-1">{orderDetails.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-black flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-gray-400 mr-3" />
                    <div>
                      <p className="text-white font-semibold">Card ending in {orderDetails.paymentMethod}</p>
                      <p className="text-gray-400 text-sm">Payment processed successfully</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    Paid
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleViewOrder}
                className="w-full font-bold transition-all duration-300"
                style={{ backgroundColor: colors.primary }}
              >
                <Package className="h-4 w-4 mr-2" />
                View Order in Account
              </Button>
              <Button 
                onClick={handleContinueShopping}
                variant="outline"
                className="w-full font-bold transition-all duration-300 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <Card className="bg-gray-900 border-gray-800 mt-8">
          <CardContent className="p-6">
            <h3 className="text-white font-bold mb-3">What's Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 mt-0.5" style={{ color: colors.primary }} />
                <div>
                  <p className="text-white font-semibold">Order Confirmation</p>
                  <p className="text-gray-400">You'll receive an email confirmation shortly</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Package className="h-5 w-5 mt-0.5" style={{ color: colors.primary }} />
                <div>
                  <p className="text-white font-semibold">Processing</p>
                  <p className="text-gray-400">Your order will be processed within 1-2 business days</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Download className="h-5 w-5 mt-0.5" style={{ color: colors.primary }} />
                <div>
                  <p className="text-white font-semibold">Tracking</p>
                  <p className="text-gray-400">You'll receive tracking information once shipped</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}