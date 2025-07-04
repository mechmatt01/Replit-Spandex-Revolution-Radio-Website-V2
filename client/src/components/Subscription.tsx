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

        {/* Subscription Packages with Custom Positioning */}
        <div className="subscription-container">
          {subscriptionTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`${
                index === 0 
                  ? "package-rebel" 
                  : index === 1 
                  ? "package-legend" 
                  : "package-icon"
              }`}
            >
              {/* Package Title */}
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

              {/* Package Card */}
              <div
                className={`bg-transparent transition-all duration-300 rounded-lg flex flex-col ${
                  tier.popular ? "legend-glow-border" : ""
                }`}
                style={{ 
                  minHeight: "540px",
                  border: tier.popular ? "2px solid transparent" : "2px solid #374151",
                  background: tier.popular 
                    ? "linear-gradient(#1f2937, #1f2937) padding-box, linear-gradient(90deg, #B56BFF, #FF50C3) border-box"
                    : "rgba(31, 41, 55, 0.8)",
                  boxShadow: tier.popular 
                    ? "rgba(181, 107, 255, 0.125) 0px 8px 32px 0px, rgba(255, 80, 195, 0.125) 0px 16px 64px 0px"
                    : "none"
                }}
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

                  <ul className={`space-y-3 ${tier.popular ? "mb-6" : "mb-8"} flex-grow`}>
                    {tier.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start text-gray-300"
                      >
                        <Check className="w-5 h-5 text-metal-orange mr-3 mt-0.5 flex-shrink-0" />
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
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-dark-bg border-dark-border text-white"
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