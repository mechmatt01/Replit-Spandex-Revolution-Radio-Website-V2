import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Star, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

// Import package icons
import RebelPackageIcon from "@assets/RebelPackageIcon.png";
import LegendPackageIcon from "@assets/LegendPackageIcon.png";
import IconPackageIcon from "@assets/IconPackageIcon.png";

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  priceId: string;
  icon: string;
  iconElement: React.ReactNode;
  gradientStart: string;
  gradientEnd: string;
  features: string[];
  popular?: boolean;
  description: string;
  perks: string[];
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "rebel",
    name: "REBEL",
    price: 5.99,
    priceId: "price_rebel_monthly",
    icon: RebelPackageIcon,
    iconElement: <Zap className="w-16 h-16" />,
    gradientStart: "#B56BFF",
    gradientEnd: "#FF50C3",
    description: "Start your metal journey",
    features: [
      "Ad-free streaming experience",
      "High-quality audio (320kbps)",
      "Monthly exclusive playlist",
      "Priority song requests",
    ],
    perks: ["🎸 Guitar picks monthly", "⚡ Early access to new shows"],
  },
  {
    id: "legend",
    name: "LEGEND",
    price: 12.99,
    priceId: "price_legend_monthly",
    popular: true,
    icon: LegendPackageIcon,
    iconElement: <Star className="w-16 h-16" />,
    gradientStart: "#E520C6",
    gradientEnd: "#F4654F",
    description: "Become a true metal legend",
    features: [
      "Everything in Rebel tier",
      "Exclusive live show access",
      "Artist interview archives",
      "VIP Discord community",
      "Monthly exclusive merch discount",
    ],
    perks: ["🎤 Monthly video calls with DJs", "🎁 Quarterly mystery box", "💿 Signed albums"],
  },
  {
    id: "icon",
    name: "ICON",
    price: 24.99,
    priceId: "price_icon_monthly",
    icon: IconPackageIcon,
    iconElement: <Crown className="w-16 h-16" />,
    gradientStart: "#FF50C3",
    gradientEnd: "#B66BFF",
    description: "The ultimate metal experience",
    features: [
      "Everything in Legend tier",
      "Personal DJ requests",
      "Exclusive artist meet & greets",
      "Limited edition vinyl access",
      "Co-host opportunities",
    ],
    perks: ["🎵 Name a weekly show segment", "🏆 Annual VIP concert tickets", "👕 Custom merch line"],
  },
];

export default function SubscriptionCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0); // Start with Rebel (first)
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const { getColors } = useTheme();
  const colors = getColors();

  const handlePrevious = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setSlideDirection('right');
      setCurrentIndex((prev) => (prev - 1 + subscriptionTiers.length) % subscriptionTiers.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setSlideDirection('left');
      setCurrentIndex((prev) => (prev + 1) % subscriptionTiers.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleSelectTier = (index: number) => {
    if (!isAnimating && index !== currentIndex) {
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const currentTier = subscriptionTiers[currentIndex];

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      {/* 3D Carousel Container - Full viewport height usage */}
      <div className="relative h-[calc(100vh-80px)] min-h-[800px] perspective-1000">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 transition-all duration-300 opacity-50 hover:opacity-100"
          disabled={isAnimating}
        >
          <ChevronLeft className="w-8 h-8 text-white hover:scale-110 transition-transform drop-shadow-lg" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 transition-all duration-300 opacity-50 hover:opacity-100"
          disabled={isAnimating}
        >
          <ChevronRight className="w-8 h-8 text-white hover:scale-110 transition-transform drop-shadow-lg" />
        </button>

        {/* Main Card Display */}
        <div className="flex items-center justify-center h-full overflow-hidden">
          <div
            className={`relative w-full max-w-md transform transition-all duration-500 preserve-3d ${isAnimating ? `slide-enter-${slideDirection}` : ''}`}
            style={{
              transform: isAnimating ? "rotateY(15deg)" : "rotateY(0deg)",
            }}
          >
            {/* Glow Effect - properly contained */}
            <div className="absolute inset-4 rounded-3xl overflow-hidden">
              <div
                className="absolute inset-0 blur-2xl opacity-40"
                style={{
                  background: `linear-gradient(135deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
                }}
              />
            </div>

            {/* Main Card */}
            <div
              className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-6 transform transition-all duration-500 hover:scale-105 overflow-hidden flex flex-col"
              style={{
                border: currentTier.popular ? "8px solid transparent" : "5px solid transparent",
                borderRadius: "24px",
                background: currentTier.popular 
                  ? `linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(90deg, ${currentTier.gradientStart} 0%, ${currentTier.gradientEnd} 25%, ${currentTier.gradientStart} 50%, ${currentTier.gradientEnd} 75%, ${currentTier.gradientStart} 100%) border-box`
                  : `linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(90deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd}) border-box`,
                backgroundSize: currentTier.popular ? "300% 300%" : "100% 100%",
                animation: currentTier.popular ? "gradientFlow 3s linear infinite" : "none",
                boxShadow: currentTier.popular 
                  ? `0 0 40px ${currentTier.gradientStart}60, 0 0 80px ${currentTier.gradientEnd}40`
                  : `0 20px 40px ${currentTier.gradientStart}40`,
                height: "calc(95vh - 100px)", // Use almost full viewport height with flex layout
              }}
              onMouseEnter={() => setHoveredTier(currentTier.id)}
              onMouseLeave={() => setHoveredTier(null)}
            >


              {/* Package Icon with Animation */}
              <div className="flex justify-center mb-4">
                <div
                  className="relative p-3 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${currentTier.gradientStart}20, ${currentTier.gradientEnd}20)`,
                  }}
                >
                  <img
                    src={currentTier.icon}
                    alt={`${currentTier.name} icon`}
                    className="w-20 h-20 object-contain animate-float"
                  />
                </div>
              </div>

              {/* Title and Description */}
              <div className="text-center mb-4">
                <h3 className="text-3xl font-black mb-2">
                  <span
                    style={{
                      background: `linear-gradient(90deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      display: "inline-block",
                    }}
                  >
                    {currentTier.name}
                  </span>
                </h3>
                <p className="text-gray-400 text-base">{currentTier.description}</p>
                
                {/* MOST POPULAR badge for Legend package */}
                {currentTier.popular && (
                  <div className="mt-4">
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
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-black text-white">${currentTier.price}</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
              </div>

              {/* Features - centered with checkmark compensation */}
              <div className="flex-1 mb-4">
                <div className="max-w-xs mx-auto">
                  {currentTier.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 mb-3 transform transition-all duration-300"
                      style={{
                        transform: hoveredTier === currentTier.id ? "translateX(10px)" : "translateX(0)",
                        transitionDelay: `${index * 50}ms`,
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: `linear-gradient(135deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
                        }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-300 text-sm font-medium text-left flex-1">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Perks - centered */}
              <div className="mb-4">
                <div className="bg-white/5 rounded-lg p-3 max-w-xs mx-auto">
                  <h4 className="text-xs font-bold text-gray-400 mb-2 text-center">EXCLUSIVE PERKS</h4>
                  <div className="space-y-1">
                    {currentTier.perks.map((perk, index) => (
                      <div key={index} className="text-xs text-gray-300 text-center">
                        {perk}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-auto">
                <Button
                  className="w-full py-4 text-base font-bold rounded-xl transform transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
                    boxShadow: `0 10px 30px ${currentTier.gradientStart}50`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 15px 40px ${currentTier.gradientStart}70`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 10px 30px ${currentTier.gradientStart}50`;
                  }}
                >
                  Get {currentTier.name} Now
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Swipe Hint / Desktop Click Hint */}
      <div className="text-center text-gray-500 text-sm mt-8">
        <span className="md:hidden">← Swipe to explore plans →</span>
        <span className="hidden md:inline">← Click to explore plans →</span>
      </div>

      {/* Tier Indicators with Package Icons */}
      <div className="flex justify-center items-center space-x-6 mt-6">
        {subscriptionTiers.map((tier, index) => (
          <button
            key={tier.id}
            onClick={() => handleSelectTier(index)}
            className={cn(
              "relative transition-all duration-500 ease-in-out p-3 rounded-full",
              index === currentIndex
                ? "scale-110"
                : "opacity-40 hover:opacity-60 scale-90"
            )}
          >
            {/* Smooth background glow */}
            <div
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-500",
                index === currentIndex ? "opacity-100" : "opacity-0"
              )}
              style={{
                background: `radial-gradient(circle, ${tier.gradientStart}20, transparent 70%)`,
                filter: "blur(12px)",
              }}
            />
            
            {/* Icon container */}
            <div
              className={cn(
                "relative rounded-full transition-all duration-500",
                index === currentIndex ? "bg-black/20" : "bg-transparent"
              )}
              style={{
                padding: "0.5rem",
              }}
            >
              <img
                src={tier.icon}
                alt={`${tier.name} icon`}
                className={cn(
                  "object-contain transition-all duration-500",
                  index === currentIndex ? "w-8 h-8" : "w-6 h-6"
                )}
                style={{
                  filter: index === currentIndex 
                    ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))" 
                    : "grayscale(100%) opacity(0.7)",
                }}
              />
            </div>
            
            {/* Active indicator ring */}
            {index === currentIndex && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${tier.gradientStart}60, ${tier.gradientEnd}60)`,
                  padding: "2px",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />
            )}
          </button>
        ))}
      </div>


      {/* Add gradient animation and text styles */}
      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}