import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Star, Zap, Crown } from "lucide-react";

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
      "Monthly signed merchandise",
    ],
    perks: ["👑 VIP concert tickets", "🎭 Backstage access", "🎯 Personal curator"],
  },
];

export default function SubscriptionCarousel() {
  const [currentIndex, setCurrentIndex] = useState(1); // Start with Legend (middle)
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const handlePrevious = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev - 1 + subscriptionTiers.length) % subscriptionTiers.length);
      setTimeout(() => setIsAnimating(false), 700);
    }
  };

  const handleNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev + 1) % subscriptionTiers.length);
      setTimeout(() => setIsAnimating(false), 700);
    }
  };

  const handleSelectTier = (index: number) => {
    if (!isAnimating && index !== currentIndex) {
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 700);
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      {/* 3D Carousel Container - Responsive height */}
      <div className="relative h-[calc(100vh-200px)] min-h-[500px] max-h-[650px] overflow-hidden">
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

        {/* Sliding Carousel */}
        <div className="relative w-full h-full">
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              width: `${subscriptionTiers.length * 100}%`,
            }}
          >
            {subscriptionTiers.map((tier, index) => (
              <div
                key={tier.id}
                className="flex-shrink-0 h-full flex items-center justify-center"
                style={{ width: `${100 / subscriptionTiers.length}%` }}
              >
                <div
                  className="relative w-full h-full max-w-[500px] mx-auto"
                  style={{ maxHeight: "580px" }}
                >
                  {/* Glow Effect - Fixed to match border radius */}
                  <div
                    className="absolute inset-2 rounded-3xl blur-3xl opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${tier.gradientStart}, ${tier.gradientEnd})`,
                    }}
                  />

                  {/* Main Card */}
                  <div
                    className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 transform transition-all duration-500 hover:scale-105 h-full flex flex-col"
                    style={{
                      border: tier.popular ? "8px solid transparent" : "5px solid transparent",
                      borderRadius: "24px",
                      background: tier.popular 
                        ? `linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(90deg, ${tier.gradientStart} 0%, ${tier.gradientEnd} 25%, ${tier.gradientStart} 50%, ${tier.gradientEnd} 75%, ${tier.gradientStart} 100%) border-box`
                        : `linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd}) border-box`,
                      backgroundSize: tier.popular ? "300% 300%" : "100% 100%",
                      animation: tier.popular ? "gradientFlow 3s linear infinite" : "none",
                      boxShadow: tier.popular 
                        ? `0 0 40px ${tier.gradientStart}60, 0 0 80px ${tier.gradientEnd}40, inset 0 0 30px ${tier.gradientStart}20`
                        : `0 20px 40px ${tier.gradientStart}40, inset 0 0 30px ${tier.gradientStart}20`,
                    }}
                    onMouseEnter={() => setHoveredTier(tier.id)}
                    onMouseLeave={() => setHoveredTier(null)}
                  >
                    {/* Top Section */}
                    <div className="flex-1 flex flex-col items-center text-center">
                      {/* Icon */}
                      <div className="mb-6">
                        <div
                          className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${tier.gradientStart}, ${tier.gradientEnd})`,
                            transform: hoveredTier === tier.id ? "scale(1.1)" : "scale(1)",
                          }}
                        >
                          <img
                            src={tier.icon}
                            alt={`${tier.name} icon`}
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                      </div>

                      {/* Title and Description */}
                      <div className="text-center mb-6">
                        <h3 className="text-4xl font-black mb-2">
                          <span
                            className="gradient-text-display"
                            style={{
                              background: `linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd})`,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                              color: "transparent",
                            }}
                          >
                            {tier.name}
                          </span>
                        </h3>
                        <p className="text-gray-400 text-lg">{tier.description}</p>
                        
                        {/* MOST POPULAR badge for Legend package */}
                        {tier.popular && (
                          <div className="mt-4">
                            <span
                              className="px-4 py-1 rounded-full text-xs font-bold"
                              style={{
                                background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                                color: "black",
                                whiteSpace: "nowrap",
                              }}
                            >
                              MOST POPULAR
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="text-center">
                          <span className="text-5xl font-black text-white">
                            ${tier.price}
                          </span>
                          <span className="text-gray-400 text-lg ml-2">/month</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex-1 mb-6 w-full flex justify-center">
                        <ul className="space-y-3 max-w-xs">
                          {tier.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-center text-gray-300 text-sm text-center"
                            >
                              <span
                                className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                                style={{
                                  background: `linear-gradient(135deg, ${tier.gradientStart}, ${tier.gradientEnd})`,
                                }}
                              />
                              <span className="flex-1">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Perks */}
                      <div className="mb-6 w-full text-center">
                        <h4 className="text-white font-bold mb-3 text-sm">Special Perks:</h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {tier.perks.map((perk, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300"
                            >
                              {perk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section - CTA Button */}
                    <div className="mt-auto">
                      <button
                        className="w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${tier.gradientStart}, ${tier.gradientEnd})`,
                          boxShadow: `0 8px 32px ${tier.gradientStart}40`,
                        }}
                      >
                        Choose {tier.name}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instruction Text */}
      <div className="text-center text-gray-400 mt-4 mb-6">
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
    </div>
  );
}