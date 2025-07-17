import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, VolumeX, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/contexts/ThemeContext";
import type { InsertSubscription } from "@shared/schema";

const subscriptionTiers = [
  {
    name: "REBEL",
    price: "$5.99",
    color: "primary",
    popular: false,
    features: [
      "Ad-free streaming experience",
      "High-quality audio (320kbps)",
      "Monthly exclusive playlist",
      "Priority song requests",
    ],
  },
  {
    name: "LEGEND",
    price: "$12.99",
    color: "metal-gold",
    popular: true,
    features: [
      "Everything in Rebel tier",
      "Exclusive live show access",
      "Artist interview archives",
      "VIP Discord community",
      "Monthly exclusive merch discount",
    ],
  },
  {
    name: "ICON",
    price: "$24.99",
    color: "metal-red",
    popular: false,
    features: [
      "Everything in Legend tier",
      "One-on-one artist video calls",
      "Exclusive concert tickets",
      "Limited edition vinyl records",
      "Personal song dedications",
    ],
  },
];

export default function Subscription() {
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { colors } = useTheme();

  const subscribeMutation = useMutation({
    mutationFn: async (data: InsertSubscription) => {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Successful!",
        description: "Welcome to the Spandex Salvation family! 🤘",
      });
      setEmail("");
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Subscription Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (plan: string) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handleConfirmSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !email) return;

    subscribeMutation.mutate({
      email,
      plan: selectedPlan.toLowerCase(),
    });
  };

  return (
    <section id="subscribe" className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 text-black dark:text-white">
            JOIN THE HAIRSPRAY REBELLION
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Support the station and unlock exclusive content.
          </p>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col gap-8 max-w-sm mx-auto">
          {subscriptionTiers.map((tier, index) => (
            <div key={`mobile-${tier.name}`}>
              <h3
                className={`font-black text-white mb-4 text-center ${
                  tier.color === "metal-gold"
                    ? "text-metal-gold"
                    : tier.color === "metal-red"
                      ? "text-metal-red"
                      : "text-white"
                }`}
                style={{ fontSize: "1.25rem" }}
              >
                {tier.name}
              </h3>

              <div
                className="rounded-lg flex flex-col transition-all duration-300 relative"
                style={{ 
                  minHeight: "540px",
                  border: tier.popular ? "3px solid #B56BFF" : "2px solid #374151",
                  background: "rgba(31, 41, 55, 0.95)",
                  boxShadow: tier.popular 
                    ? "0 0 20px #B56BFF, inset 0 0 20px rgba(181, 107, 255, 0.2)"
                    : "none",
                  animation: tier.popular ? "legend-glow 4s linear infinite" : "none"
                }}
              >
                {tier.popular && (
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                    style={{
                      top: "-12px", // Centered over top border
                      background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                      color: "black",
                      whiteSpace: "nowrap",
                      fontSize: "11px",
                      lineHeight: "1",
                      zIndex: 10
                    }}
                  >
                    MOST&nbsp;POPULAR
                  </div>
                )}

                <div className="p-8 flex flex-col h-full justify-between">
                  <div className="text-center mb-6">
                    <div
                      className={`text-3xl font-bold mb-1 ${
                        tier.color === "metal-gold"
                          ? "text-metal-gold"
                          : tier.color === "metal-red"
                            ? "text-metal-red"
                            : "text-primary"
                      }`}
                    >
                      {tier.price}
                    </div>
                    <div className="text-gray-400 text-sm">per month</div>
                  </div>

                  <ul className={`space-y-3 ${tier.popular ? "mb-6" : "mb-8"} flex-grow`}>
                    {tier.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center justify-center text-gray-300"
                      >
                        <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                        <span className="text-sm text-center">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(tier.name)}
                    className="w-full py-3 text-lg font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${
                        tier.color === "metal-gold"
                          ? "#f7931e, #ffcc00"
                          : tier.color === "metal-red"
                            ? "#dc2626, #ef4444"
                            : "#ff6b35, #f7931e"
                      })`,
                      color: "white",
                      border: "none",
                    }}
                  >
                    CHOOSE {tier.name}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Layout with Overlapping */}
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
              key={`desktop-${tier.name}`}
              className="absolute transition-all duration-300"
              style={{
                width: "320px",
                left: index === 0 
                  ? "calc(50% - 325px)" // Rebel: moved further left, only 5px overlap
                  : index === 1 
                  ? "calc(50% - 160px)" // Legend: center
                  : "calc(50% + 5px)", // Icon: moved further right, only 5px overlap
                top: index === 1 ? "20px" : "40px", // Legend higher than others
                zIndex: index === 1 ? 50 : 10
              }}
            >
              <h3
                className={`font-black text-white mb-4 text-center ${
                  tier.color === "metal-gold"
                    ? "text-metal-gold"
                    : tier.color === "metal-red"
                      ? "text-metal-red"
                      : "text-white"
                }`}
                style={{ fontSize: "1.25rem" }}
              >
                {tier.name}
              </h3>

              <div
                className="rounded-lg flex flex-col transition-all duration-300 relative overflow-hidden"
                style={{ 
                  minHeight: "540px",
                  border: tier.popular ? "3px solid #B56BFF" : "2px solid #374151",
                  background: "rgba(31, 41, 55, 0.95)",
                  boxShadow: tier.popular 
                    ? "0 0 20px #B56BFF, inset 0 0 20px rgba(181, 107, 255, 0.2)"
                    : "none",
                  animation: tier.popular ? "legend-glow 4s linear infinite" : "none"
                }}
              >
                {tier.popular && (
                  <>
                    <div
                      className="absolute left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                      style={{
                        top: "-12px", // Centered over top border
                        background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                        color: "black",
                        whiteSpace: "nowrap",
                        fontSize: "11px",
                        lineHeight: "1",
                        zIndex: 10
                      }}
                    >
                      MOST&nbsp;POPULAR
                    </div>
                    
                    {/* Animated gradient border overlay */}
                    <div
                      className="absolute"
                      style={{
                        top: "-3px",
                        left: "-3px",
                        right: "-3px",
                        bottom: "-3px",
                        background: "linear-gradient(45deg, #B56BFF, #FF50C3, #FFD700, #FF6B35, #B56BFF)",
                        backgroundSize: "400% 400%",
                        animation: "gradient-rotate 4s linear infinite",
                        zIndex: -1,
                        borderRadius: "inherit"
                      }}
                    />
                  </>
                )}

                <div className="p-8 flex flex-col h-full justify-between">
                  <div className="text-center mb-6">
                    <div
                      className={`text-3xl font-bold mb-1 ${
                        tier.color === "metal-gold"
                          ? "text-metal-gold"
                          : tier.color === "metal-red"
                            ? "text-metal-red"
                            : "text-primary"
                      }`}
                    >
                      {tier.price}
                    </div>
                    <div className="text-gray-400 text-sm">per month</div>
                  </div>

                  <ul className={`space-y-3 ${tier.popular ? "mb-6" : "mb-8"} flex-grow`}>
                    {tier.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start text-gray-300"
                      >
                        <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(tier.name)}
                    className="w-full py-3 text-lg font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${
                        tier.color === "metal-gold"
                          ? "#f7931e, #ffcc00"
                          : tier.color === "metal-red"
                            ? "#dc2626, #ef4444"
                            : "#ff6b35, #f7931e"
                      })`,
                      color: "white",
                      border: "none",
                    }}
                  >
                    CHOOSE {tier.name}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-16"></div>

        {/* Subscription Benefits */}
        <div className="text-center">
          <h3 className="font-bold text-2xl mb-8 text-white">Why Subscribe?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <VolumeX className="text-primary h-8 w-8" />
              </div>
              <h4 className="font-semibold text-lg mb-2">
                Premium Audio Quality
              </h4>
              <p className="text-gray-400 text-center">
                Experience crystal-clear metal with our high-bitrate streaming.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-metal-gold/20 rounded-full flex items-center justify-center mb-4">
                <Users className="text-metal-gold h-8 w-8" />
              </div>
              <h4 className="font-semibold text-lg mb-2">
                Exclusive Community
              </h4>
              <p className="text-gray-400 text-center">
                Connect with fellow metalheads in our VIP community spaces.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-metal-red/20 rounded-full flex items-center justify-center mb-4">
                <Star className="text-metal-red h-8 w-8" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Exclusive Content</h4>
              <p className="text-gray-400 text-center">
                Access rare tracks, interviews, and behind-the-scenes content.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white">
              Subscribe to {selectedPlan} Plan
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConfirmSubscription} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-background border-border text-white"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={subscribeMutation.isPending}
            >
              {subscribeMutation.isPending ? "Processing..." : "Subscribe Now"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}