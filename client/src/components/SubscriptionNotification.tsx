import React from 'react';
import { useState, useEffect } from "react";
import { Crown, X, Star, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { User as UserType } from "@shared/schema";

interface SubscriptionNotificationProps {
  featureType?: "live_chat" | "submissions" | "premium_avatar" | "profile_badge" | "general";
  onClose?: () => void;
  onSubscribe?: () => void;
}

const featureInfo = {
  live_chat: {
    title: "Unlock Live Chat",
    description: "Connect with fellow metalheads in real-time!",
    icon: MessageCircle,
    benefits: [
      "Real-time chat with other listeners",
      "Direct communication with DJs",
      "Exclusive chat rooms",
      "Priority message delivery"
    ]
  },
  submissions: {
    title: "Submit Song Requests",
    description: "Have your favorite tracks played on air!",
    icon: Star,
    benefits: [
      "Submit unlimited song requests",
      "Priority request processing",
      "Track request history",
      "Exclusive request features"
    ]
  },
  premium_avatar: {
    title: "Premium Avatars",
    description: "Choose from exclusive rock music avatars!",
    icon: Crown,
    benefits: [
      "15+ exclusive rock avatars",
      "Metal-themed character designs",
      "Premium avatar selection",
      "Unique profile customization"
    ]
  },
  profile_badge: {
    title: "Verified Badge",
    description: "Show off your verified status!",
    icon: Crown,
    benefits: [
      "Verified profile badge",
      "Enhanced profile visibility",
      "Trust indicator for community",
      "Premium profile features"
    ]
  },
  general: {
    title: "Join the Hairspray Rebellion",
    description: "Unlock premium features and exclusive content!",
    icon: Crown,
    benefits: [
      "Ad-free streaming experience",
      "High-quality audio (320kbps)",
      "Exclusive content access",
      "Priority support"
    ]
  }
};

export default function SubscriptionNotification({ 
  featureType = "general", 
  onClose, 
  onSubscribe 
}: SubscriptionNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownForSession, setHasShownForSession] = useState(false);
  const auth = useAuth();
  const user: UserType | null = auth.user as UserType | null;
  const { getColors } = useTheme();
  const colors = getColors();

  const info = featureInfo[featureType];
  const IconComponent = info.icon;

  // Check if user should see this notification
  const shouldShowNotification = () => {
    // Don't show if user is not authenticated
    if (!user) return false;
    
    // Don't show if user already has active subscription
    if (user?.subscriptionStatus === "active") return false;
    
    // Don't show if already shown for this session
    if (hasShownForSession) return false;
    
    // Don't show if user has seen this notification before (stored in localStorage)
    const notificationKey = `subscription_notification_${featureType}`;
    const hasSeenBefore = localStorage.getItem(notificationKey);
    if (hasSeenBefore) return false;
    
    return true;
  };

  useEffect(() => {
    // Show notification after a short delay if conditions are met
    const timer = setTimeout(() => {
      if (shouldShowNotification()) {
        setIsVisible(true);
        setHasShownForSession(true);
        
        // Mark as seen in localStorage
        const notificationKey = `subscription_notification_${featureType}`;
        localStorage.setItem(notificationKey, 'true');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, featureType]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleSubscribe = () => {
    setIsVisible(false);
    onSubscribe?.();
    // Scroll to subscription section
    document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignIn = () => {
    // Trigger auth modal
    const event = new CustomEvent('openAuthModal', { detail: { mode: 'login' } });
    window.dispatchEvent(event);
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card 
        className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300"
        style={{ 
          backgroundColor: colors.card,
          borderColor: colors.primary + '40'
        }}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <IconComponent size={20} style={{ color: 'white' }} />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: colors.text }}>
                  {info.title}
                </h3>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  {info.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1"
              style={{ color: colors.textMuted }}
            >
              <X size={16} />
            </Button>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3" style={{ color: colors.text }}>
              What you'll get:
            </h4>
            <div className="space-y-2">
              {info.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span className="text-sm" style={{ color: colors.textMuted }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Tiers Preview */}
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
            <h4 className="font-semibold mb-3" style={{ color: colors.text }}>
              Choose your plan:
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#CD7F32' }} />
                  <span className="text-sm font-medium" style={{ color: colors.text }}>Rebel</span>
                </div>
                <span className="text-sm font-bold" style={{ color: colors.primary }}>$5.99/month</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#C0C0C0' }} />
                  <span className="text-sm font-medium" style={{ color: colors.text }}>Legend</span>
                </div>
                <span className="text-sm font-bold" style={{ color: colors.primary }}>$12.99/month</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFD700' }} />
                  <span className="text-sm font-medium" style={{ color: colors.text }}>Icon</span>
                </div>
                <span className="text-sm font-bold" style={{ color: colors.primary }}>$24.99/month</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!user ? (
              <Button
                onClick={handleSignIn}
                className="flex-1"
                style={{
                  backgroundColor: colors.primary,
                  color: 'white'
                }}
              >
                Sign In First
              </Button>
            ) : (
              <Button
                onClick={handleSubscribe}
                className="flex-1"
                style={{
                  backgroundColor: colors.primary,
                  color: 'white'
                }}
              >
                View Plans
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleClose}
              style={{
                borderColor: colors.primary,
                color: colors.primary
              }}
            >
              Maybe Later
            </Button>
          </div>

          {/* Footer */}
          <p className="text-xs text-center mt-4" style={{ color: colors.textMuted }}>
            Cancel anytime. No commitment required.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 