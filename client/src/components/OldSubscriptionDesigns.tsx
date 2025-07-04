import { useState } from "react";
import { Check, ChevronRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import AuthModal from "@/components/AuthModal";
import { useLocation } from "wouter";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Import package icons
import RebelPackageIcon from "@assets/RebelPackageIcon.png";
import LegendPackageIcon from "@assets/LegendPackageIcon.png";
import IconPackageIcon from "@assets/IconPackageIcon.png";

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  priceId: string;
  features: string[];
  popular?: boolean;
  icon: string;
  gradientStart: string;
  gradientEnd: string;
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "rebel",
    name: "REBEL",
    price: 5.99,
    priceId: "price_rebel_monthly",
    features: [
      "Ad-free streaming experience",
      "High-quality audio (320kbps)",
      "Monthly exclusive playlist",
      "Priority song requests",
    ],
    icon: RebelPackageIcon,
    gradientStart: "#B56BFF",
    gradientEnd: "#FF50C3",
  },
  {
    id: "legend",
    name: "LEGEND",
    price: 12.99,
    priceId: "price_legend_monthly",
    features: [
      "Everything in Rebel tier",
      "Exclusive live show access",
      "Artist interview archives",
      "VIP Discord community",
      "Monthly exclusive merch discount",
    ],
    popular: true,
    icon: LegendPackageIcon,
    gradientStart: "#E520C6",
    gradientEnd: "#F4654F",
  },
  {
    id: "icon",
    name: "ICON",
    price: 24.99,
    priceId: "price_icon_monthly",
    features: [
      "Everything in Legend tier",
      "Personal DJ requests",
      "Exclusive artist meet & greets",
      "Limited edition vinyl access",
      "Co-host opportunities",
    ],
    icon: IconPackageIcon,
    gradientStart: "#FF50C3",
    gradientEnd: "#B66BFF",
  },
];

interface PaymentFormProps {
  selectedTier: SubscriptionTier;
  onSuccess: () => void;
}

function PaymentForm({ selectedTier, onSuccess }: PaymentFormProps) {
  const [, navigate] = useLocation();
  const { getColors } = useTheme();
  const colors = getColors();

  const handlePaymentSuccess = () => {
    onSuccess();
    navigate("/profile");
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">
          Complete Your {selectedTier.name} Subscription
        </h3>
        <p className="text-muted-foreground">
          ${selectedTier.price}/month • Cancel anytime
        </p>
      </div>

      <Card className="border-2" style={{ borderColor: colors.primary }}>
        <CardContent className="p-6 space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">What you'll get:</h4>
            <ul className="space-y-2">
              {selectedTier.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4" style={{ color: colors.primary }} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full"
              style={{ backgroundColor: colors.primary }}
              onClick={handlePaymentSuccess}
            >
              Subscribe to {selectedTier.name} - ${selectedTier.price}/mo
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By subscribing, you agree to our terms of service and privacy policy.
              Subscription will auto-renew monthly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OldStripePaymentProcessor() {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { getColors } = useTheme();
  const colors = getColors();

  const handleTierSelect = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setShowAuthModal(true);
  };

  return (
    <div className="w-full">
      {/* Mobile Layout - Only visible on small screens */}
      <div className="md:hidden w-full">
        <div className="flex flex-col gap-8 max-w-sm mx-auto">
        {subscriptionTiers.map((tier) => (
        <div key={`mobile-${tier.id}`} className="relative">
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
              minHeight: "540px", // Same height for all tiers
              border: `${tier.name === "LEGEND" ? "6px" : "5px"} solid transparent`, // Increased border for Legend
              background: `linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd}) border-box`,
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

            <div className="p-6 flex flex-col h-full justify-between">
              <div>
                <div className="text-center mb-6">
                  {/* Package Icon */}
                  <div className="flex justify-center mb-4">
                    <img
                      src={tier.icon}
                      alt={`${tier.name} package icon`}
                      className={`object-contain ${
                        tier.id === "rebel" ? "w-20 h-20" : "w-16 h-16"
                      }`}
                    />
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-black text-metal-orange">
                      ${tier.price}
                    </span>
                    <span className="text-gray-400 font-semibold">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-12 flex-grow">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start justify-center">
                      <Check className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-metal-orange" />
                      <span className="text-gray-300 font-medium text-center">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleTierSelect(tier)}
                className="w-full font-bold text-lg py-6 rounded-xl transition-all duration-300 relative overflow-hidden group border-0"
                style={{
                  background: `linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd})`,
                  color: "white",
                  boxShadow: `0 4px 20px ${tier.gradientStart}50`,
                }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  Get {tier.name}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, ${tier.gradientEnd}, ${tier.gradientStart})`,
                  }}
                />
              </Button>
            </div>
          </div>
        </div>
        ))}
        </div>
      </div>

      {/* Desktop Layout - Only visible on medium screens and up */}
      <div 
        className="hidden md:block relative mx-auto"
        style={{ 
          width: "100%", 
          maxWidth: "1000px", 
          height: "600px" 
        }}
      >
        {subscriptionTiers.map((tier, index) => (
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
              top: index === 1 ? "40px" : "40px", // All packages at same height
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
                height: "540px", // All packages same height
                border: tier.popular ? "6px solid transparent" : "5px solid transparent",
                background: tier.popular 
                  ? `linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(90deg, #E520C6, #F4654F) border-box`
                  : `linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd}) border-box`,
                boxShadow: tier.popular 
                  ? "0 0 30px #E520C6, 0 0 60px #F4654F, inset 0 0 20px rgba(229, 32, 198, 0.3)"
                  : `0 0 15px ${tier.gradientStart}40`,
                animation: tier.popular ? "legend-glow 4s linear infinite" : "none"
              }}
            >
              <div className="p-8 flex flex-col h-full justify-between">
                <div>
                  <div className="text-center mb-8">
                    {/* Package Icon */}
                    <div className="flex justify-center mb-6">
                      <img
                        src={tier.icon}
                        alt={`${tier.name} package icon`}
                        className={`object-contain ${
                          tier.id === "rebel" ? "w-24 h-24" : "w-20 h-20"
                        }`}
                      />
                    </div>

                    <div className="mb-4">
                      <span 
                        className="text-4xl font-black"
                        style={{
                          background: `linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd})`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        ${tier.price}
                      </span>
                      <span className="text-gray-400 font-semibold ml-1">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8 flex-grow">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check 
                          className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5"
                          style={{ color: tier.gradientStart }}
                        />
                        <span className="text-gray-300 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleTierSelect(tier)}
                  className="w-full font-bold text-lg py-6 rounded-xl transition-all duration-300 relative overflow-hidden group border-0"
                  style={{
                    background: `linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd})`,
                    color: "white",
                    boxShadow: `0 6px 30px ${tier.gradientStart}50`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 10px 40px ${tier.gradientStart}70`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 6px 30px ${tier.gradientStart}50`;
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Get {tier.name}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(90deg, ${tier.gradientEnd}, ${tier.gradientStart})`,
                    }}
                  />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setSelectedTier(null);
        }}
        onSuccess={() => {
          setShowAuthModal(false);
          // After successful auth, show payment form
        }}
      />

      {/* Payment Modal */}
      {selectedTier && !showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-background rounded-lg max-w-md w-full p-6">
            <Elements stripe={stripePromise}>
              <PaymentForm
                selectedTier={selectedTier}
                onSuccess={() => setSelectedTier(null)}
              />
            </Elements>
          </div>
        </div>
      )}

      {/* Animated gradient border styles */}
      <style jsx>{`
        @keyframes legend-glow {
          0% {
            opacity: 0.6;
            filter: blur(20px);
          }
          50% {
            opacity: 1;
            filter: blur(30px);
          }
          100% {
            opacity: 0.6;
            filter: blur(20px);
          }
        }
      `}</style>
    </div>
  );
}