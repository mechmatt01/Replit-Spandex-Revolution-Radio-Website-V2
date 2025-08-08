import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

interface ChatButtonProps {
  onChatClick: () => void;
  onlineCount?: number;
}

export default function ChatButton({ onChatClick, onlineCount = 0 }: ChatButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const { getColors } = useTheme();
  const colors = getColors();

  // Check if user has premium subscription
  const hasPremiumSubscription = (user as any)?.activeSubscription || false;

  // Only show chat button for authenticated users with active subscriptions
  if (!isAuthenticated || !hasPremiumSubscription) {
    return null;
  }

  return (
    <Button
      onClick={onChatClick}
      size="sm"
      variant="ghost"
      className="relative flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 hover:scale-105"
      style={{
        color: colors.text,
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary + '20';
        e.currentTarget.style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = colors.text;
      }}
      aria-label="Open live chat"
    >
      <MessageCircle size={16} style={{ color: colors.primary }} />
      <span className="font-semibold text-sm">CHAT</span>
      {onlineCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5"
          style={{ fontSize: '10px' }}
        >
          {onlineCount}
        </Badge>
      )}
    </Button>
  );
}
