import { useState, useEffect } from "react";
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
  const [currentIndex, setCurrentIndex] = useState(1); // Start with Legend (middle)
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const { getColors } = useTheme();
  const colors = getColors();

  const handlePrevious = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev - 1 + subscriptionTiers.length) % subscriptionTiers.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
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

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hoveredTier) {
        handleNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [hoveredTier]);

  const currentTier = subscriptionTiers[currentIndex];

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      {/* 3D Carousel Container */}
      <div className="relative h-[700px] perspective-1000">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/20 hover:bg-white/10 transition-all duration-300 group"
          disabled={isAnimating}
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/20 hover:bg-white/10 transition-all duration-300 group"
          disabled={isAnimating}
        >
          <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Main Card Display */}
        <div className="flex items-center justify-center h-full">
          <div
            className="relative w-full max-w-md transform transition-all duration-500 preserve-3d"
            style={{
              transform: isAnimating ? "rotateY(15deg)" : "rotateY(0deg)",
            }}
          >
            {/* Glow Effect */}
            <div
              className="absolute inset-0 rounded-2xl blur-3xl opacity-50"
              style={{
                background: `linear-gradient(135deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
              }}
            />

            {/* Main Card */}
            <div
              className="relative bg-black/80 backdrop-blur-xl rounded-2xl p-8 border-2 transform transition-all duration-500 hover:scale-105"
              style={{
                borderImage: `linear-gradient(135deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd}) 1`,
                boxShadow: `0 20px 40px ${currentTier.gradientStart}40, inset 0 0 30px ${currentTier.gradientStart}20`,
              }}
              onMouseEnter={() => setHoveredTier(currentTier.id)}
              onMouseLeave={() => setHoveredTier(null)}
            >
              {/* Popular Badge */}
              {currentTier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 blur-md animate-pulse" />
                    <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full font-black text-sm">
                      🔥 MOST POPULAR 🔥
                    </div>
                  </div>
                </div>
              )}

              {/* Package Icon with Animation */}
              <div className="flex justify-center mb-6">
                <div
                  className="relative p-4 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${currentTier.gradientStart}20, ${currentTier.gradientEnd}20)`,
                  }}
                >
                  <img
                    src={currentTier.icon}
                    alt={`${currentTier.name} icon`}
                    className="w-24 h-24 object-contain animate-float"
                  />
                </div>
              </div>

              {/* Title and Description */}
              <div className="text-center mb-6">
                <h3
                  className="text-4xl font-black mb-2 bg-gradient-to-r text-transparent bg-clip-text"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
                  }}
                >
                  {currentTier.name}
                </h3>
                <p className="text-gray-400 text-lg">{currentTier.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center">
                  <span className="text-5xl font-black text-white">${currentTier.price}</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {currentTier.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 transform transition-all duration-300"
                    style={{
                      transform: hoveredTier === currentTier.id ? "translateX(10px)" : "translateX(0)",
                      transitionDelay: `${index * 50}ms`,
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
                      }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Special Perks */}
              <div className="bg-white/5 rounded-lg p-4 mb-8">
                <h4 className="text-sm font-bold text-gray-400 mb-2">EXCLUSIVE PERKS</h4>
                <div className="space-y-2">
                  {currentTier.perks.map((perk, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      {perk}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <Button
                className="w-full py-6 text-lg font-bold rounded-xl transform transition-all duration-300 hover:scale-105"
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

        {/* Tier Indicators */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-4">
          {subscriptionTiers.map((tier, index) => (
            <button
              key={tier.id}
              onClick={() => handleSelectTier(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-12 bg-gradient-to-r from-white to-gray-300"
                  : "bg-gray-600 hover:bg-gray-500"
              )}
              style={{
                background:
                  index === currentIndex
                    ? `linear-gradient(135deg, ${tier.gradientStart}, ${tier.gradientEnd})`
                    : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="md:hidden text-center text-gray-500 text-sm mt-4">
        ← Swipe to explore plans →
      </div>

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}