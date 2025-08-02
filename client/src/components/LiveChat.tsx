import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Send, MessageCircle, X, Users, Mic, MicOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/use-toast";
import type { User } from "@shared/schema";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  isHost?: boolean;
}

interface LiveChatProps {
  isEnabled: boolean;
  onToggle: () => void;
  isHost?: boolean;
  premiumFeatureType?:
    | "chat"
    | "submission"
    | "avatar"
    | "premium_avatar"
    | "profile_badge";
}

export default function LiveChat({
  isEnabled,
  onToggle,
  isHost = false,
  premiumFeatureType = "chat",
}: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const { getColors } = useTheme();
  const { toast } = useToast();
  const colors = getColors();

  // Check if user has paid subscription (assuming stripeSubscriptionId indicates paid status)
  const hasPaidSubscription = (user as any)?.stripeSubscriptionId || false;

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isAuthenticated || !hasPaidSubscription) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: (user as any)?.firstName || "Anonymous",
      message: message.trim(),
      timestamp: new Date(),
      isHost: isHost,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // If user is not authenticated, don't show the chat at all
  if (!isAuthenticated) {
    return null;
  }

  // Get contextual message based on feature type
  const getFeatureMessage = () => {
    switch (premiumFeatureType) {
      case "chat":
        return "Premium Subscription is required to access the live chat features";
      case "submission":
        return "Premium Subscription is required to submit live song requests to the Spandex Salvation Radio";
      case "avatar":
        return "A Premium Subscription is required to enable the checkmark for your profile";
      case "premium_avatar":
        return "A Premium Subscription is required to use the rock music avatars";
      case "profile_badge":
        return "A Premium Subscription is required to display the premium badge on your profile";
      default:
        return "Premium Subscription is required to access this feature";
    }
  };

  // Only show subscription prompt when user explicitly tries to access premium features AND is authenticated
  if (!hasPaidSubscription && isEnabled && isAuthenticated) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Card
          className="w-80 shadow-lg backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
          }}
        >
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <MessageCircle
                className="w-8 h-8 mx-auto"
                style={{ color: colors.primary }}
              />
              <h3
                className="font-bold text-lg"
                style={{ color: colors.primary }}
              >
                Premium Feature
              </h3>
              <p className="text-sm text-foreground">{getFeatureMessage()}</p>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  ✓ Live Chat Access ✓ Song Submissions ✓ Exclusive Content
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.primaryText || "white",
                    }}
                    onClick={() => (window.location.href = "/subscribe")}
                  >
                    Upgrade Now
                  </Button>
                  <Button size="sm" variant="outline" onClick={onToggle}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't show chat if not enabled by host
  if (!isEnabled) {
    return null;
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
            {onlineCount}
          </Badge>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 z-50">
          <Card className="h-full bg-dark-surface shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold text-white">
                    Live Chat
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-400 text-xs"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                    LIVE
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Users className="h-3 w-3" />
                    {onlineCount}
                  </div>
                  {isHost && (
                    <Button
                      onClick={onToggle}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-primary p-1"
                    >
                      <MicOff className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-400 p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-full">
              {/* Messages Area */}
              <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
                <div className="space-y-3 py-2">
                  {(messages || []).length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                      <p>Welcome to the live chat!</p>
                      <p className="text-xs">
                        Be respectful and enjoy the show.
                      </p>
                    </div>
                  ) : (
                    (messages || []).map((msg) => (
                      <div key={msg.id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`font-medium ${msg.isHost ? "text-primary" : "text-gray-300"}`}
                          >
                            {msg.username}
                            {msg.isHost && (
                              <Badge className="ml-1 bg-primary/20 text-primary text-xs px-1">
                                HOST
                              </Badge>
                            )}
                          </span>
                          <span className="text-gray-500">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-200 bg-gray-800/30 rounded px-2 py-1">
                          {msg.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 text-sm"
                    maxLength={200}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-primary hover:bg-primary/90 px-3"
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
