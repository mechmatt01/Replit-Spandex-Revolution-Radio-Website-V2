import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  Music,
  MessageCircle,
  Star,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const subscriptionTiers = [
  {
    id: "rebel",
    name: "Rebel",
    price: 4.99,
    popular: false,
    features: [
      "Ad-free streaming",
      "High-quality audio",
      "Basic song requests",
      "Mobile app access",
    ],
  },
  {
    id: "legend",
    name: "Legend",
    price: 9.99,
    popular: true,
    features: [
      "Everything in Rebel",
      "Live chat access",
      "Priority song requests",
      "Exclusive content",
      "Premium avatars",
      "Early show access",
    ],
  },
  {
    id: "icon",
    name: "Icon",
    price: 19.99,
    popular: false,
    features: [
      "Everything in Legend",
      "VIP chat privileges",
      "Direct DJ messaging",
      "Custom playlists",
      "Exclusive merchandise",
      "Meet & greet opportunities",
    ],
  },
];

export default function SubscribePage() {
  const [selectedTier, setSelectedTier] = useState("legend");
  const { getColors, theme } = useTheme();
  const colors = getColors();

  const handleSubscribe = (tierId: string) => {
    // Here you would integrate with Stripe or your payment processor
    console.log(`Subscribing to ${tierId} tier`);
    // For now, redirect to a placeholder
    window.location.href = `/api/subscribe/${tierId}`;
  };

  return (
    <div
      className={cn(
        "min-h-screen p-4",
        theme === "light" ? "bg-white" : "bg-black",
      )}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl font-black">
            Choose Your <span style={{ color: colors.primary }}>Metal</span>{" "}
            Experience
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the Spandex Salvation revolution and unlock exclusive features,
            premium content, and VIP access to the metal community.
          </p>
        </div>

        {/* Subscription Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {subscriptionTiers.map((tier) => (
            <Card
              key={tier.id}
              className={cn(
                "relative transition-all duration-300 hover:scale-105",
                selectedTier === tier.id && "ring-2",
                tier.popular && "border-2",
              )}
              style={{
                ringColor:
                  selectedTier === tier.id ? colors.primary : undefined,
                borderColor: tier.popular ? colors.primary : undefined,
              }}
            >
              {tier.popular && (
                <div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-bold"
                  style={{ backgroundColor: colors.primary }}
                >
                  MOST POPULAR
                </div>
              )}

              <CardHeader className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-4xl font-black">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: colors.primary }}
                      />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(tier.id)}
                  style={
                    tier.popular
                      ? { backgroundColor: colors.primary }
                      : undefined
                  }
                >
                  {tier.popular ? "Get Started" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6">
            <Music
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: colors.primary }}
            />
            <h3 className="font-bold mb-2">Premium Audio</h3>
            <p className="text-sm text-muted-foreground">
              High-quality streaming with zero ads
            </p>
          </Card>

          <Card className="text-center p-6">
            <MessageCircle
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: colors.primary }}
            />
            <h3 className="font-bold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground">
              Connect with the metal community
            </p>
          </Card>

          <Card className="text-center p-6">
            <Crown
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: colors.primary }}
            />
            <h3 className="font-bold mb-2">Exclusive Content</h3>
            <p className="text-sm text-muted-foreground">
              Access to special shows and interviews
            </p>
          </Card>

          <Card className="text-center p-6">
            <Star
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: colors.primary }}
            />
            <h3 className="font-bold mb-2">VIP Access</h3>
            <p className="text-sm text-muted-foreground">
              Priority requests and early access
            </p>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time. You'll
                continue to have access until the end of your current billing
                period.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, PayPal, and other secure
                payment methods through Stripe.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                Can I upgrade or downgrade my plan?
              </h4>
              <p className="text-sm text-muted-foreground">
                Absolutely! You can change your subscription tier at any time
                from your profile settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
