import { useState, useEffect } from "react";
import { ShoppingCart, Star, Heart, Share, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured?: boolean;
}

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  available: boolean;
  option1?: string;
  option2?: string;
}

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  title: string;
  price: number;
  image: string;
}

// Sample product data - would be fetched from Shopify API
const sampleProducts: Product[] = [
  {
    id: "1",
    title: "Spandex Salvation Classic Tee",
    description:
      "Premium cotton tee with vintage logo design. Perfect for any metal fan.",
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
    description:
      "Heavy-duty hoodie with embroidered logo. Built for the coldest metal nights.",
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
    description:
      "15oz ceramic mug to fuel your metal mornings. Dishwasher safe.",
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
    description:
      "Exclusive compilation of classic metal hits. Limited to 500 copies.",
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
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
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

  const addToCart = (
    product: Product,
    variant: ProductVariant,
    quantity: number = 1,
  ) => {
    const existingItem = cart.find((item) => item.variantId === variant.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.variantId === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      );
    } else {
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

  const handleBuyNow = (product: Product, variant: ProductVariant) => {
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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <section 
      id="merch" 
      className="py-20 transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="font-orbitron font-black text-3xl md:text-4xl mb-4"
            style={{ 
              color: currentTheme === 'light-mode' ? '#000000' : colors.text 
            }}
          >
            OFFICIAL MERCH STORE
          </h2>
          <p 
            className="text-lg font-semibold"
            style={{ color: colors.textMuted }}
          >
            Show your metal pride with exclusive Spandex Salvation Radio
            merchandise.
          </p>
        </div>

        {/* Cart Summary */}
                      {(cart || []).length > 0 && (
          <div className="mb-8">
            <Card 
              className="transition-all duration-300"
              style={{ 
                backgroundColor: currentTheme === 'light-mode' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 30, 30, 0.5)',
                borderColor: colors.primary
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" style={{ color: colors.primary }} />
                    <span 
                      className="font-black"
                      style={{ color: currentTheme === 'light-mode' ? '#000000' : '#ffffff' }}
                    >
                      {(cart || []).reduce((total, item) => total + item.quantity, 0)}{" "}
                      items in cart
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-black text-xl text-metal-orange">
                      ${getCartTotal().toFixed(2)}
                    </span>
                    <Button
                      onClick={handleCheckout}
                      className="bg-metal-orange hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold"
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Featured Products */}
        <div className="mb-12 text-center">
          <h3
            className="font-black text-xl mb-6 text-center"
            style={{ color: colors.primary }}
          >
            Featured Products
          </h3>
          <div className="w-full flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {products
                ?.filter((product) => product.featured)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(variant, quantity) =>
                      addToCart(product, variant, quantity)
                    }
                    onViewDetails={() => setSelectedProduct(product)}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Product Modal */}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(variant, quantity) =>
              addToCart(selectedProduct, variant, quantity)
            }
          />
        )}
      </div>
    </section>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (variant: ProductVariant, quantity: number) => void;
  onViewDetails: () => void;
}

function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
}: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0],
  );
  const { getColors, currentTheme } = useTheme();
  const colors = getColors();

  return (
    <Card
      className="transition-all duration-300 group h-full flex flex-col"
      style={{ 
        backgroundColor: currentTheme === 'light-mode' ? '#ffffff' : 'rgba(30, 30, 30, 0.5)',
        borderColor: colors.primary 
      }}
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="relative mb-4">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-48 object-cover rounded-lg"
          />
          {product.featured && (
            <Badge
              className="absolute top-2 left-2"
              style={{ backgroundColor: colors.primary, color: "white" }}
            >
              Featured
            </Badge>
          )}
          {product.compareAtPrice && (
            <Badge
              className="absolute top-2 left-2 w-auto"
              style={{ 
                backgroundColor: "#dc2626", 
                color: "white",
                marginTop: product.featured ? "30px" : "0"
              }}
            >
              Sale
            </Badge>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onViewDetails}
              className="bg-white/90 text-black hover:bg-white"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 text-black hover:bg-white"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 text-black hover:bg-white"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <h4 
          className="font-black mb-2"
          style={{ color: currentTheme === 'light-mode' ? '#000000' : '#ffffff' }}
        >
          {product.title}
        </h4>
        <p 
          className="text-sm font-semibold line-clamp-2 flex-grow"
          style={{ color: colors.textMuted }}
        >
          {product.description}
        </p>

        <div className="flex flex-col items-center mb-3 mt-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-600"
                }`}
              />
            ))}
            <span 
              className="text-sm font-semibold ml-2"
              style={{ 
                color: currentTheme === 'light-mode' ? '#6b7280' : '#9ca3af' 
              }}
            >
              ({product.reviewCount})
            </span>
          </div>
          <div className="mt-2 mb-3">
            <span className="text-xl font-black text-metal-orange">
              ${product.price}
            </span>
            {product.compareAtPrice && (
              <span 
                className="line-through ml-2"
                style={{ 
                  color: currentTheme === 'light-mode' ? '#6b7280' : '#9ca3af' 
                }}
              >
                ${product.compareAtPrice}
              </span>
            )}
          </div>
          {!product.inStock && (
            <Badge variant="secondary" className="bg-gray-600 text-white mt-2">
              Out of Stock
            </Badge>
          )}
        </div>

        <div className="mt-auto">
          {(product.variants || []).length > 1 && (
            <div className="relative mb-3">
              <select
                value={selectedVariant.id}
                onChange={(e) =>
                  setSelectedVariant(
                    product.variants?.find((v) => v.id === e.target.value)!,
                  )
                }
                className="w-full p-2 rounded appearance-none pr-8 text-center"
                style={{ 
                  backgroundColor: currentTheme === 'light-mode' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 30, 30, 0.5)',
                  color: currentTheme === 'light-mode' ? '#000000' : '#ffffff',
                  borderColor: colors.primary,
                  textAlign: 'center'
                }}
              >
                {(product.variants || []).map((variant) => (
                  <option
                    key={variant.id}
                    value={variant.id}
                    disabled={!variant.available}
                  >
                    {variant.title} {!variant.available && "(Out of Stock)"}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          )}

          <Button
            onClick={() => console.log('Buy now:', product, selectedVariant)}
            disabled={!product.inStock || !selectedVariant.available}
            className="w-full font-bold transition-all duration-300"
            style={{
              backgroundColor: colors.primary,
              color: colors.primaryText || "white",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                colors.primaryDark || colors.primary;
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (variant: ProductVariant, quantity: number) => void;
}

function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0],
  );
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="bg-dark-bg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 
              className="font-black text-2xl"
              style={{ color: currentTheme === 'light-mode' ? '#000000' : '#ffffff' }}
            >
              {product.title}
            </h3>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            <div>
              <p 
                className="font-semibold mb-4"
                style={{ color: colors.textMuted }}
              >
                {product.description}
              </p>

              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span 
                  className="font-semibold ml-2"
                  style={{ 
                    color: '#9ca3af'
                  }}
                >
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-black text-metal-orange">
                  ${selectedVariant.price}
                </span>
                {product.compareAtPrice && (
                  <span 
                    className="line-through ml-2"
                    style={{ 
                      color: '#9ca3af'
                    }}
                  >
                    ${product.compareAtPrice}
                  </span>
                )}
              </div>

              {(product.variants || []).length > 1 && (
                <div className="mb-4">
                  <label className="block text-gray-300 font-semibold mb-2">
                    Size:
                  </label>
                  <select
                    value={selectedVariant.id}
                    onChange={(e) =>
                      setSelectedVariant(
                        product.variants?.find((v) => v.id === e.target.value)!,
                      )
                    }
                    className="w-full p-2 bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-primary rounded text-center"
                    style={{ textAlign: 'center' }}
                  >
                    {(product.variants || []).map((variant) => (
                      <option
                        key={variant.id}
                        value={variant.id}
                        disabled={!variant.available}
                      >
                        {variant.title} {!variant.available && "(Out of Stock)"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-300 font-semibold mb-2">
                  Quantity:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-20 p-2 bg-dark-bg/50 text-white rounded"
                />
              </div>

              <Button
                onClick={() => {
                  console.log('Buy now:', product, selectedVariant);
                  onClose();
                }}
                disabled={!product.inStock || !selectedVariant.available}
                className="w-full bg-metal-orange hover:bg-orange-600 text-white font-bold"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy Now - ${(selectedVariant.price * quantity).toFixed(2)}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
