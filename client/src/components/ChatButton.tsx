import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import LiveChat from "@/components/LiveChat";

export default function ChatButton() {
  const [showPremiumNotification, setShowPremiumNotification] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { getColors } = useTheme();
  const colors = getColors();

  // Check if user has paid subscription
  const hasPaidSubscription = user?.stripeSubscriptionId || false;

  const handleChatClick = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = "/#/login";
      return;
    }

    if (!hasPaidSubscription) {
      // Show premium notification for authenticated users without subscription
      setShowPremiumNotification(true);
      return;
    }

    // Open actual chat for premium users
    // This would open the real chat functionality
    console.log("Opening live chat for premium user");
  };

  return (
    <>
      <Button
        onClick={handleChatClick}
        className="fixed bottom-20 right-4 z-40 rounded-full p-4 shadow-lg text-white"
        style={{ backgroundColor: colors.primary }}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Premium Feature Notification */}
      {showPremiumNotification && (
        <LiveChat
          isEnabled={true}
          onToggle={() => setShowPremiumNotification(false)}
          premiumFeatureType="chat"
        />
      )}
    </>
  );
}