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
    color: "metal-orange",
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
      "Personal DJ requests",
      "Exclusive artist meet & greets",
      "Limited edition vinyl access",
      "Co-host opportunities",
    ],
  },
];

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { getColors } = useTheme();
  const colors = getColors();

  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (data: InsertSubscription) => {
      const response = await apiRequest("POST", "/api/subscriptions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Successful!",
        description:
          "Welcome to the Hairspray Rebellion! Check your email for details.",
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
    <section id="subscribe" className="py-20 bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 text-black dark:text-white">
            JOIN THE HAIRSPRAY REBELLION
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Unlock exclusive content, early access to shows, and premium perks
            with our subscription tiers.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:justify-center md:items-stretch max-w-6xl mx-auto mb-16 gap-8 md:gap-0 md:relative">
          {subscriptionTiers.map((tier, index) => (
            <div 
              key={tier.name} 
              className={`relative transition-all duration-300 ${
                index === 0 ? 'md:z-10 md:-mr-4' : // Rebel: overlaps right edge
                index === 1 ? 'md:z-20' : // Legend: on top
                'md:z-10 md:-ml-4' // Icon: overlaps left edge
              }`}
              style={{
                width: '100%',
                maxWidth: '320px',
                flex: '0 0 auto'
              }}
            >
              {/* Title Above Box */}
              <h3
                className={`font-bold text-xl mb-4 text-center ${
                  tier.color === "metal-gold"
                    ? "text-metal-gold"
                    : tier.color === "metal-red"
                      ? "text-metal-red"
                      : "text-white"
                }`}
              >
                {tier.name}
              </h3>
              
              <div
                className={`bg-dark-bg border border-dark-border relative flex flex-col rounded-lg ${
                  tier.popular
                    ? "border-2 border-metal-gold transform scale-105"
                    : ""
                }`}
                style={{ minHeight: tier.popular ? "520px" : "560px" }}
              >
                {tier.popular && (
                  <div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                      color: "black",
                      whiteSpace: "nowrap",
                      fontSize: "11px",
                      lineHeight: "1",
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
                            : "text-metal-orange"
                      }`}
                    >
                      {tier.price}
                    </div>
                    <div className="text-gray-400 text-sm">per month</div>
                  </div>

                  <ul className={`space-y-3 ${tier.popular ? 'mb-6' : 'mb-8'} flex-grow`}>
                    {tier.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center text-gray-300"
                      >
                        <Check
                          className={`mr-3 h-4 w-4 ${
                            tier.color === "metal-gold"
                              ? "text-metal-gold"
                              : tier.color === "metal-red"
                                ? "text-metal-red"
                                : "text-metal-orange"
                          }`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(tier.name)}
                    className="w-full px-6 py-3 rounded-full font-bold transition-all duration-300"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.primaryText || "black",
                      border: "none",
                      cursor: "pointer",
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
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Benefits */}
        <div className="text-center">
          <h3 className="font-bold text-2xl mb-8 text-white">Why Subscribe?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-metal-orange/20 rounded-full flex items-center justify-center mb-4">
                <VolumeX className="text-metal-orange h-8 w-8" />
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
        <DialogContent className="bg-dark-surface border-dark-border">
          <DialogHeader>
            <DialogTitle className="text-white">
              Subscribe to {selectedPlan} Plan
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConfirmSubscription} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-dark-bg border-dark-border text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="w-full bg-metal-orange hover:bg-orange-600 text-white"
            >
              {subscribeMutation.isPending
                ? "Processing..."
                : "Confirm Subscription"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
