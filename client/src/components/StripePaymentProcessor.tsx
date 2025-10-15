import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { CreditCard, Lock, Check } from "lucide-react";
import RebelPackageIcon from "/RebelPackageIcon.png";
import LegendPackageIcon from "/LegendPackageIcon.png";
import IconPackageIcon from "/IconPackageIcon.png";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  priceId: string;
  productId: string;
  features: string[];
  popular?: boolean;
  icon: string;
  gradientStart: string;
  gradientEnd: string;
}

// Default subscription tiers - will be updated from API
const defaultSubscriptionTiers: SubscriptionTier[] = [
  {
    id: "rebel",
    name: "REBEL",
    price: 10.00,
    priceId: "price_rebel_monthly",
    productId: "prod_SYtaAhwYUbBRCN",
    icon: RebelPackageIcon,
    gradientStart: "#B56BFF",
    gradientEnd: "#FF50C3",
    features: [
      "Ad-free streaming experience",
      "High-quality audio (320kbps)",
      "Monthly exclusive playlist",
      "Priority song requests",
    ],
  },
  {
    id: "legend",
    name: "LEGEND",
    price: 15.00,
    priceId: "price_legend_monthly",
    productId: "prod_SYtb33Yg1ISFTP",
    popular: true,
    icon: LegendPackageIcon,
    gradientStart: "#E520C6",
    gradientEnd: "#F4654F",
    features: [
      "Everything in Rebel tier",
      "Exclusive live show access",
      "Artist interview archives",
      "VIP Discord community",
      "Monthly exclusive merch discount",
    ],
  },
  {
    id: "icon",
    name: "ICON",
    price: 24.99,
    priceId: "price_icon_monthly",
    productId: "prod_SYtbFUCPQe0qoz",
    icon: IconPackageIcon,
    gradientStart: "#00D4FF",
    gradientEnd: "#5200FF",
    features: [
      "Everything in Legend tier",
      "Personal DJ requests",
      "Exclusive artist meet & greets",
      "Limited edition vinyl access",
      "Co-host opportunities",
    ],
  },
];

interface PaymentFormProps {
  selectedTier: SubscriptionTier;
  onSuccess: () => void;
}

function PaymentForm({ selectedTier, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    name: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // First create a customer
      const customerResponse = await fetch('/api/stripe/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerInfo.email,
          name: customerInfo.name,
          firebaseUID: 'current-user-id' // In production, get from Firebase auth
        })
      });

      const { customer } = await customerResponse.json();

      // Create subscription with backend
      const subscriptionResponse = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          priceId: selectedTier.priceId,
        })
      });

      const { clientSecret } = await subscriptionResponse.json();

      // Confirm payment with Stripe
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
          },
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subscription Successful!",
          description: `Welcome to ${selectedTier.name} tier! Your subscription is now active.`,
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Subscription Error",
        description: "Unable to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-gray-300 font-semibold">
            Full Name *
          </Label>
          <Input
            id="name"
            value={customerInfo.name}
            onChange={(e) =>
              setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="John Doe"
            required
            className="bg-dark-bg/50 text-white placeholder-gray-400/60 2  50"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-gray-300 font-semibold">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={customerInfo.email}
            onChange={(e) =>
              setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="john@example.com"
            required
            className="bg-dark-bg/50 text-white placeholder-gray-400/60 2  50"
          />
        </div>
      </div>

      <div>
        <Label className="text-gray-300 font-semibold">
          Payment Information *
        </Label>
        <div className="mt-2 p-4 bg-dark-bg/50 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  color: "#ffffff",
                  fontFamily: '"Inter", sans-serif',
                  fontSmoothing: "antialiased",
                  fontSize: "16px",
                  "::placeholder": {
                    color: "#9ca3af",
                  },
                },
                invalid: {
                  color: "#ef4444",
                  iconColor: "#ef4444",
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-dark-surface/50 rounded-lg">
        <div>
          <p className="font-black text-white">
            Total: ${selectedTier.price}/month
          </p>
          <p className="text-gray-400 text-sm font-semibold">
            Billed monthly, cancel anytime
          </p>
        </div>
        <div className="flex items-center text-gray-400">
          <Lock className="h-4 w-4 mr-1" />
          <span className="text-xs font-semibold">Secure Payment</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-metal-orange hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold transition-all duration-300"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {processing ? "Processing..." : `Subscribe to ${selectedTier.name}`}
      </Button>
    </form>
  );
}

export default function StripePaymentProcessor() {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(
    null,
  );
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch subscription tiers from API
  useEffect(() => {
    const fetchSubscriptionTiers = async () => {
      try {
        const response = await fetch('/api/stripe/products?type=subscription');
        const data = await response.json();
        
        if (data.success && data.products) {
          // Map API products to subscription tiers - ALWAYS use Stripe prices
          const tiers = data.products.map((product: any) => ({
            id: product.name.toLowerCase(),
            name: product.name.toUpperCase(),
            price: product.price, // Always use Stripe API price
            priceId: product.priceId,
            productId: product.productId,
            icon: product.name === 'Rebel' ? RebelPackageIcon : 
                  product.name === 'Legend' ? LegendPackageIcon : IconPackageIcon,
            gradientStart: product.name === 'Rebel' ? "#B56BFF" : 
                          product.name === 'Legend' ? "#E520C6" : "#00D4FF",
            gradientEnd: product.name === 'Rebel' ? "#FF50C3" : 
                        product.name === 'Legend' ? "#F4654F" : "#5200FF",
            features: product.features || [],
            popular: product.name === 'Legend'
          }));
          setSubscriptionTiers(tiers);
          console.log('Loaded subscription tiers from Stripe API:', tiers);
        } else {
          console.error('Failed to fetch subscription tiers from API:', data);
        }
      } catch (error) {
        console.error('Error fetching subscription tiers:', error);
        // Don't fall back to default tiers - wait for API to respond
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionTiers();
  }, []);

  const handleTierSelect = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedTier(null);
  };

  if (showPaymentForm && selectedTier) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="font-black text-2xl text-white mb-2">
                Complete Your Subscription
              </h3>
              <p className="text-gray-400 font-semibold">
                You're subscribing to{" "}
                <span className="text-metal-orange font-bold">
                  {selectedTier.name}
                </span>{" "}
                tier
              </p>
            </div>

            <Elements stripe={stripePromise}>
              <PaymentForm
                selectedTier={selectedTier}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>

            <Button
              variant="ghost"
              onClick={() => setShowPaymentForm(false)}
              className="w-full mt-4 text-gray-400 hover:text-white"
            >
              Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while fetching from API
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-metal-orange mx-auto mb-4"></div>
          <p className="text-gray-400">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  // Show error state if no tiers loaded
  if (subscriptionTiers.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-400 mb-4">Unable to load subscription plans</p>
          <p className="text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Mobile Layout - Only visible on small screens */}
      <div className="md:hidden w-full h-full">
        <div className="flex flex-col gap-4 max-w-sm mx-auto h-full">
        {(subscriptionTiers || []).map((tier) => (
        <div key={`mobile-${tier.id}`} className="relative flex-1">
          {/* Title Above Box */}
          <h3 
            className="font-black text-white mb-4 text-center"
            style={{ 
              fontSize: tier.name === "LEGEND" ? "1.75rem" : "1.25rem" // 28px for LEGEND (20px + 8px), 20px for others
            }}
          >
            {tier.name}
          </h3>
          
          <div
            className="bg-transparent transition-all duration-300 relative rounded-lg flex flex-col"
            style={{
              minHeight: "calc(100% - 80px)", // Fill available height minus title space
              border: `${tier.name === "LEGEND" ? "6px" : "5px"} solid ${tier.gradientStart}`, // Fixed: Use gradient color instead of transparent
              background: `linear-gradient(#1f2937, #1f2937) padding-box, linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd}) border-box`,
              boxShadow: tier.name === "LEGEND" 
                ? `0 0 30px ${tier.gradientStart}60, 0 0 60px ${tier.gradientEnd}40, inset 0 0 20px ${tier.gradientStart}20`
                : `0 8px 32px ${tier.gradientStart}20`,
            }}
          >
            {tier.popular && (
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{ top: "0" }}
              >
                <span
                  className="px-4 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                    color: "black",
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST&nbsp;POPULAR
                </span>
              </div>
            )}

            <div className="p-4 flex flex-col h-full justify-between">
              <div>
                <div className="text-center mb-4">
                  {/* Package Icon */}
                  <div className="flex justify-center mb-3">
                    <img
                      src={tier.icon}
                      alt={`${tier.name} package icon`}
                      className={`object-contain ${
                        tier.id === "rebel" ? "w-16 h-16" : "w-14 h-14"
                      }`}
                    />
                  </div>

                  <div className="mb-3">
                    <span className="text-2xl font-black text-metal-orange">
                      ${tier.price}
                    </span>
                    <span className="text-gray-400 font-semibold">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {(tier.features || []).map((feature, index) => (
                    <li key={index} className="flex items-start justify-center">
                      <div className="flex items-start max-w-xs">
                        <Check className="text-metal-orange h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 font-semibold text-sm leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleTierSelect(tier)}
                className="w-full font-bold rounded-full transition-all duration-300 text-white transform hover:scale-105 hover:shadow-2xl py-2 text-sm focus:outline-none focus:ring-0"
                style={{
                  fontSize: "16px",
                  background: `linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd})`,
                  boxShadow: `0 4px 15px ${tier.gradientStart}40`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 25px ${tier.gradientStart}80, 0 0 10px ${tier.gradientEnd}60`;
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 4px 15px ${tier.gradientStart}40`;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      ))}
        </div>
      </div>

      {/* Desktop Layout with Overlapping - Only visible on medium screens and up */}
      <div 
        className="hidden md:block relative mx-auto h-full"
        style={{ 
          width: "100%", 
          maxWidth: "1000px"
        }}
      >
        {(subscriptionTiers || []).map((tier, index) => (
          <div
            key={`desktop-${tier.id}`}
            className="absolute transition-all duration-300"
            style={{
              width: "340px", // All packages same width
              left: index === 0 
                ? "calc(50% - 505px)" // Rebel: only 5px overlap (340 - 5 + 170)
                : index === 1 
                ? "calc(50% - 170px)" // Legend: center (340px width / 2)
                : "calc(50% + 165px)", // Icon: only 5px overlap (170 - 5)
              top: "20px", // Start from top with small margin
              zIndex: index === 1 ? 50 : 10,
              transform: "none" // Remove scale transform
            }}
          >
            <h3 
              className="font-black text-white mb-4 text-center"
              style={{ 
                fontSize: tier.name === "LEGEND" ? "1.75rem" : "1.25rem"
              }}
            >
              {tier.name}
            </h3>
            
            {/* MOST POPULAR badge positioned on card border */}
            {tier.popular && (
              <div
                className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                  color: "black",
                  whiteSpace: "nowrap",
                  fontSize: "11px",
                  lineHeight: "1",
                  zIndex: 100,
                  top: "53px", // Position exactly on the top border of card (after title)
                  padding: "4px 16px",
                  borderRadius: "9999px",
                  fontWeight: "bold"
                }}
              >
                MOST&nbsp;POPULAR
              </div>
            )}
            
            <div
              className="rounded-lg flex flex-col transition-all duration-300 relative overflow-hidden"
              style={{ 
                height: "calc(100% - 60px)", // Fill available height minus title space
                border: tier.popular ? `6px solid ${tier.gradientStart}` : `5px solid ${tier.gradientStart}`,
                background: tier.popular 
                  ? `linear-gradient(#1f2937, #1f2937) padding-box, linear-gradient(90deg, #E520C6, #F4654F) border-box`
                  : `linear-gradient(#1f2937, #1f2937) padding-box, linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd}) border-box`,
                boxShadow: tier.popular 
                  ? "0 0 30px #E520C6, 0 0 60px #F4654F, inset 0 0 20px rgba(229, 32, 198, 0.3)"
                  : `0 0 15px ${tier.gradientStart}40`,
                animation: tier.popular ? "legend-glow 4s linear infinite" : "none"
              }}
            >
              {tier.popular && (
                <>
                  
                  {/* Animated gradient border overlay */}
                  <div
                    className="absolute"
                    style={{
                      top: "-6px",
                      left: "-6px",
                      right: "-6px",
                      bottom: "-6px",
                      background: "linear-gradient(45deg, #ff6b35, #f7931e, #ffcc00, #f7931e, #ff6b35)",
                      backgroundSize: "400% 400%",
                      animation: "gradient-rotate 4s linear infinite",
                      zIndex: -1,
                      borderRadius: "inherit"
                    }}
                  />
                </>
              )}

              <div className="p-4 flex flex-col h-full justify-between">
                <div>
                  <div className="text-center mb-4">
                    <div className="flex justify-center mb-3">
                      <img
                        src={tier.icon}
                        alt={`${tier.name} package icon`}
                        className={`object-contain ${
                          tier.id === "rebel" ? "w-16 h-16" : "w-14 h-14"
                        }`}
                      />
                    </div>

                    <div className="mb-3">
                      <span className="text-2xl font-black text-metal-orange">
                        ${tier.price}
                      </span>
                      <span className="text-gray-400 font-semibold">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow px-4">
                    {(tier.features || []).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="text-metal-orange h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 font-semibold text-sm leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleTierSelect(tier)}
                  className="w-full font-bold rounded-full transition-all duration-300 text-white transform hover:scale-105 hover:shadow-2xl py-2 text-sm focus:outline-none focus:ring-0"
                  style={{
                    fontSize: "16px",
                    background: `linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd})`,
                    boxShadow: `0 4px 15px ${tier.gradientStart}40`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 8px 25px ${tier.gradientStart}80, 0 0 10px ${tier.gradientEnd}60`;
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 15px ${tier.gradientStart}40`;
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}