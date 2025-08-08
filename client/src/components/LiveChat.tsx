import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Send, MessageCircle, X, Users, Mic, MicOff, Crown, LogIn } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/use-toast";
import { 
  addChatMessage, 
  subscribeToChatMessages, 
  updateUserOnlineStatus, 
  subscribeToOnlineUsers,
  setUserOffline,
  type ChatMessage,
  type ChatUser
} from "../lib/chat";

interface LiveChatProps {
  isEnabled: boolean;
  onToggle: () => void;
  isHost?: boolean;
}

export default function LiveChat({
  isEnabled,
  onToggle,
  isHost = false,
}: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const { getColors } = useTheme();
  const { toast } = useToast();
  const colors = getColors();

  // Check if user has premium subscription
  const hasPremiumSubscription = (user as any)?.activeSubscription || false;

  // Subscribe to real-time messages and online users
  useEffect(() => {
    if (!isAuthenticated || !hasPremiumSubscription) return;

    let unsubscribeMessages: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;

    const setupSubscriptions = async () => {
      try {
        // Subscribe to chat messages
        unsubscribeMessages = subscribeToChatMessages((newMessages) => {
          setMessages(newMessages);
        });

        // Subscribe to online users
        unsubscribeUsers = subscribeToOnlineUsers((users) => {
          setOnlineUsers(users);
        });

        // Update user's online status
        if (user) {
          await updateUserOnlineStatus(
            (user as any).userID,
            (user as any).firstName || "Anonymous",
            (user as any).userProfileImage
          );
        }
      } catch (error) {
        console.error('Error setting up chat subscriptions:', error);
        toast({
          title: "Chat Error",
          description: "Failed to connect to live chat. Please try again.",
          variant: "destructive",
        });
      }
    };

    setupSubscriptions();

    // Cleanup on unmount
    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeUsers) unsubscribeUsers();
      
      // Set user offline when component unmounts
      if (user) {
        setUserOffline((user as any).userID).catch(console.error);
      }
    };
  }, [isAuthenticated, hasPremiumSubscription, user, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isAuthenticated || !hasPremiumSubscription || isLoading) return;

    setIsLoading(true);
    try {
      await addChatMessage(
        (user as any).userID,
        (user as any).firstName || "Anonymous",
        message.trim(),
        (user as any).userProfileImage,
        isHost
      );
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Message Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    }
  };

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
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
                Live Chat
              </h3>
              <p className="text-sm text-foreground">
                Sign in to join the live chat with other metalheads!
              </p>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  ✓ Real-time messaging ✓ Premium community ✓ Song requests
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.primaryText || "white",
                    }}
                    onClick={() => {
                      const event = new CustomEvent("openAuthModal", {
                        detail: { mode: "login" },
                      });
                      window.dispatchEvent(event);
                    }}
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    Sign In
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

  // If user doesn't have premium subscription, show upgrade prompt
  if (!hasPremiumSubscription) {
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
              <Crown
                className="w-8 h-8 mx-auto"
                style={{ color: colors.primary }}
              />
              <h3
                className="font-bold text-lg"
                style={{ color: colors.primary }}
              >
                Premium Feature
              </h3>
              <p className="text-sm text-foreground">
                Live chat is available exclusively to premium subscribers.
              </p>
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
          style={{
            background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
            boxShadow: `0 8px 32px ${colors.primary}40`,
          }}
        >
          <MessageCircle className="h-6 w-6" />
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
            {onlineUsers.length}
          </Badge>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 z-50">
          <Card 
            className="h-full shadow-2xl backdrop-blur-sm"
            style={{
              background: `linear-gradient(135deg, ${colors.surface}95, ${colors.surface}85)`,
              borderColor: colors.primary + '30',
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold" style={{ color: colors.text }}>
                    Live Chat
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: colors.primary + '20',
                      color: colors.primary,
                    }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: colors.primary }}
                    ></div>
                    LIVE
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs" style={{ color: colors.textSecondary }}>
                    <Users className="h-3 w-3" />
                    {onlineUsers.length}
                  </div>
                  {isHost && (
                    <Button
                      onClick={onToggle}
                      variant="ghost"
                      size="sm"
                      className="p-1"
                      style={{ color: colors.textSecondary }}
                    >
                      <MicOff className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    style={{ color: colors.textSecondary }}
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
                  {messages.length === 0 ? (
                    <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                      <MessageCircle className="h-8 w-8 mx-auto mb-2" style={{ color: colors.textSecondary }} />
                      <p className="text-sm">Welcome to the live chat!</p>
                      <p className="text-xs">Be respectful and enjoy the show.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="flex gap-2">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={msg.userProfileImage} />
                          <AvatarFallback 
                            className="text-xs"
                            style={{ backgroundColor: colors.primary, color: colors.primaryText || 'white' }}
                          >
                            {msg.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs mb-1">
                            <span
                              className="font-medium truncate"
                              style={{ color: msg.isHost ? colors.primary : colors.text }}
                            >
                              {msg.username}
                              {msg.isHost && (
                                <Badge 
                                  className="ml-1 text-xs px-1"
                                  style={{ backgroundColor: colors.primary + '20', color: colors.primary }}
                                >
                                  HOST
                                </Badge>
                              )}
                            </span>
                            <span style={{ color: colors.textSecondary }}>
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                          <p 
                            className="text-sm rounded px-3 py-2"
                            style={{ 
                              backgroundColor: colors.primary + '10',
                              color: colors.text,
                              border: `1px solid ${colors.primary}20`
                            }}
                          >
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t" style={{ borderColor: colors.primary + '20' }}>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 text-sm"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.primary + '30',
                      color: colors.text,
                    }}
                    maxLength={200}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="px-3"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.primaryText || "white",
                    }}
                    disabled={!message.trim() || isLoading}
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
