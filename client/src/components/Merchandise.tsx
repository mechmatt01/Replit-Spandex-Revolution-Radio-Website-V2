import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  ShoppingCart, 
  CreditCard,
  Package,
  Star,
  Truck,
  Shield,
  X,
  Check
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface MerchandiseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  sizes?: string[];
  colors?: string[];
  stripeProductId?: string;
  stripePriceId?: string;
}

interface CartItem extends MerchandiseItem {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

// Default merchandise items - will be updated from API
const defaultMerchandiseItems: MerchandiseItem[] = [
  {
    id: 'tshirt-black',
    name: 'T-Shirt',
    description: 'This is for the T-shirt merchandise.',
    price: 25.00,
    image: '/api/placeholder/300/300',
    category: 'Clothing',
    inStock: true,
    rating: 4.8,
    reviews: 124,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Navy'],
    stripeProductId: 'prod_SYtbVypJilHtUK',
    stripePriceId: 'price_tshirt'
  },
  {
    id: 'hoodie-black',
    name: 'Metal Legends Hoodie',
    description: 'Comfortable pullover hoodie perfect for metal concerts',
    price: 49.99,
    image: '/api/placeholder/300/300',
    category: 'Clothing',
    inStock: true,
    rating: 4.9,
    reviews: 87,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Charcoal', 'Red']
  },
  {
    id: 'vinyl-album',
    name: 'Exclusive Vinyl Collection',
    description: 'Limited edition vinyl featuring the best of Spandex Salvation Radio',
    price: 34.99,
    image: '/api/placeholder/300/300',
    category: 'Music',
    inStock: true,
    rating: 5.0,
    reviews: 45,
    sizes: ['12"']
  },
  {
    id: 'mug-metal',
    name: 'Metal Head Coffee Mug',
    description: 'Ceramic mug with metallic finish - perfect for your morning metal',
    price: 16.99,
    image: '/api/placeholder/300/300',
    category: 'Accessories',
    inStock: true,
    rating: 4.7,
    reviews: 203
  },
  {
    id: 'poster-set',
    name: 'Band Poster Collection',
    description: 'Set of 5 high-quality posters featuring iconic metal bands',
    price: 29.99,
    image: '/api/placeholder/300/300',
    category: 'Accessories',
    inStock: true,
    rating: 4.6,
    reviews: 156
  },
  {
    id: 'keychain',
    name: 'Metal Logo Keychain',
    description: 'Durable metal keychain with Spandex Salvation logo',
    price: 8.99,
    image: '/api/placeholder/300/300',
    category: 'Accessories',
    inStock: true,
    rating: 4.5,
    reviews: 89
  }
];

interface PaymentFormProps {
  cartItems: CartItem[];
  total: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ cartItems, total, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent with backend
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            items: JSON.stringify(cartItems),
            customerEmail: customerInfo.email,
            customerName: customerInfo.name
          }
        })
      });

      const { paymentIntent } = await response.json();

      // Confirm payment with Stripe
      const { error } = await stripe.confirmCardPayment(paymentIntent.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            address: {
              line1: customerInfo.address,
              city: customerInfo.city,
              state: customerInfo.state,
              postal_code: customerInfo.zip,
              country: 'US'
            }
          }
        }
      });

      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Payment Successful!',
          description: 'Your merchandise order has been placed successfully.',
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Payment Error',
        description: 'Unable to process payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
            placeholder="john@example.com"
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={customerInfo.address}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
            placeholder="123 Main St"
            required
          />
        </div>
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={customerInfo.city}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
            placeholder="New York"
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={customerInfo.state}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, state: e.target.value }))}
            placeholder="NY"
            required
          />
        </div>
        <div>
          <Label htmlFor="zip">ZIP Code *</Label>
          <Input
            id="zip"
            value={customerInfo.zip}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, zip: e.target.value }))}
            placeholder="10001"
            required
          />
        </div>
      </div>

      <div>
        <Label>Payment Information *</Label>
        <div className="mt-2 p-4 border rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-semibold">Total: ${total.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Free shipping on orders over $50</p>
        </div>
        <div className="flex items-center text-gray-600">
          <Shield className="h-4 w-4 mr-1" />
          <span className="text-xs">Secure Payment</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function Merchandise() {
  const { isAuthenticated } = useFirebaseAuth();
  const { colors } = useTheme();
  const { toast } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [merchandiseItems, setMerchandiseItems] = useState<MerchandiseItem[]>(defaultMerchandiseItems);
  const [loading, setLoading] = useState(true);

  // Fetch merchandise from API
  useEffect(() => {
    const fetchMerchandise = async () => {
      try {
        const response = await fetch('/api/stripe/products?type=merchandise');
        const data = await response.json();
        
        if (data.success && data.products) {
          // Map API products to merchandise items
          const items = data.products.map((product: any, index: number) => ({
            id: product.productId,
            name: product.name,
            description: product.description,
            price: product.price,
            image: '/api/placeholder/300/300',
            category: product.category || 'Accessories',
            inStock: product.inStock !== false,
            rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
            reviews: Math.floor(Math.random() * 200) + 50, // Random reviews 50-250
            sizes: product.sizes || [],
            colors: product.colors || [],
            stripeProductId: product.productId,
            stripePriceId: product.priceId
          }));
          setMerchandiseItems(items);
        }
      } catch (error) {
        console.error('Error fetching merchandise:', error);
        // Keep default items if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchMerchandise();
  }, []);

  const categories = ['All', ...Array.from(new Set(merchandiseItems.map(item => item.category)))];

  const addToCart = (item: MerchandiseItem) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to add items to your cart.',
        variant: 'destructive'
      });
      return;
    }

    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }

    toast({
      title: 'Added to Cart',
      description: `${item.name} has been added to your cart.`
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    const total = getTotal();
    return total >= 50 ? 0 : 5.99;
  };

  const getFinalTotal = () => {
    return getTotal() + getShippingCost();
  };

  const filteredItems = selectedCategory === 'All' 
    ? merchandiseItems 
    : merchandiseItems.filter(item => item.category === selectedCategory);

  const handleCheckoutSuccess = () => {
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black mb-4" style={{ color: colors.primary }}>
          Spandex Salvation Merchandise
        </h1>
        <p className="text-xl text-gray-600">
          Show your metal pride with exclusive Spandex Salvation gear
        </p>
      </div>

      {/* Cart Button */}
      <div className="fixed top-4 right-4 z-40">
        <Button
          onClick={() => setShowCart(true)}
          className="relative"
          style={{ backgroundColor: colors.primary }}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Cart ({cart.length})
          {cart.length > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            style={selectedCategory === category ? { backgroundColor: colors.primary } : {}}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Merchandise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{item.category}</Badge>
                {!item.inStock && (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
              
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  ({item.reviews} reviews)
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold" style={{ color: colors.primary }}>
                  ${item.price}
                </span>
                <Button
                  onClick={() => addToCart(item)}
                  disabled={!item.inStock || !isAuthenticated}
                  size="sm"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">${item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{getShippingCost() === 0 ? 'Free' : `$${getShippingCost().toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>${getFinalTotal().toFixed(2)}</span>
                </div>
                
                <Button
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                  className="w-full"
                  style={{ backgroundColor: colors.primary }}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Checkout</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCheckout(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4">
              <Elements stripe={stripePromise}>
                <PaymentForm
                  cartItems={cart}
                  total={getFinalTotal()}
                  onSuccess={handleCheckoutSuccess}
                  onCancel={() => setShowCheckout(false)}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
