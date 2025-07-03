import { useState } from "react";
import { MessageCircle, X, Crown, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";

export default function ChatButton() {
  const [showNotification, setShowNotification] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { colors } = useTheme();

  // Check if user has paid subscription
  const hasPaidSubscription = user?.stripeSubscriptionId || false;

  const handleChatClick = () => {
    if (!isAuthenticated || !hasPaidSubscription) {
      setShowNotification(true);
    }
  };

  const handleSignIn = () => {
    // Trigger auth modal
    const event = new CustomEvent("openAuthModal", {
      detail: { mode: "login" },
    });
    window.dispatchEvent(event);
    setShowNotification(false);
  };

  const handleSubscribe = () => {
    document
      .getElementById("subscribe")
      ?.scrollIntoView({ behavior: "smooth" });
    setShowNotification(false);
  };

  // Only show chat button for authenticated users with active subscriptions
  if (!isAuthenticated || !hasPaidSubscription) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleChatClick}
        size="lg"
        className="fixed bottom-4 right-4 z-30 w-14 h-14 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        style={{
          background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
          boxShadow: `0 8px 32px ${colors.primary}40`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = `0 12px 40px ${colors.primary}60`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}40`;
        }}
        aria-label="Open live chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Premium Feature Notification - Top Right Corner */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <Card
            className="w-80 shadow-xl border-2 backdrop-blur-sm"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              boxShadow: `0 10px 40px ${colors.primary}30`,
            }}
          >
            <CardContent className="p-6 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotification(false)}
                className="absolute top-2 right-2 w-6 h-6 p-0 hover:bg-transparent"
                style={{ color: colors.textSecondary }}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <Crown
                    className="w-8 h-8 mr-2"
                    style={{ color: colors.primary }}
                  />
                  <h3
                    className="font-bold text-lg"
                    style={{ color: colors.primary }}
                  >
                    Premium Feature
                  </h3>
                </div>

                {!isAuthenticated ? (
                  <>
                    <p className="text-sm" style={{ color: colors.text }}>
                      Live chat is available exclusively to premium subscribers.
                      Create an account and upgrade to join the conversation!
                    </p>
                    <div className="space-y-2">
                      <p
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        ✓ Live Chat Access ✓ Song Submissions ✓ Exclusive
                        Content
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSignIn}
                          className="flex-1 border-0"
                          style={{
                            backgroundColor: colors.primary,
                            color: colors.primaryText || "white",
                          }}
                        >
                          <LogIn className="w-4 h-4 mr-1" />
                          Sign In
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSubscribe}
                          className="flex-1"
                          style={{
                            borderColor: colors.primary,
                            color: colors.primary,
                            backgroundColor: "transparent",
                          }}
                        >
                          Subscribe
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm" style={{ color: colors.text }}>
                      Live chat requires a premium subscription. Upgrade now to
                      join the metalhead community!
                    </p>
                    <div className="space-y-2">
                      <p
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        ✓ Live Chat Access ✓ Song Submissions ✓ Exclusive
                        Content
                      </p>
                      <Button
                        size="sm"
                        onClick={handleSubscribe}
                        className="w-full text-white border-0"
                        style={{ backgroundColor: colors.primary }}
                      >
                        Upgrade Now
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
