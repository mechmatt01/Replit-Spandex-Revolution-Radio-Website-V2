import React, { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import { Send, MessageCircle, X, Users, MicOff, Crown, LogIn } from "lucide-react";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { ChatMessage, User as ChatUser } from "../types/chat";
import { 
  addChatMessage, 
  subscribeToChatMessages, 
  updateUserOnlineStatus, 
  subscribeToOnlineUsers,
  setUserOffline,
} from "../lib/chat";

interface LiveChatProps {
  isEnabled: boolean;
  onToggle: () => void;
  isHost?: boolean;
}

interface UserProfile {
  userID: string;
  firstName?: string;
  userProfileImage?: string;
  activeSubscription?: boolean;
}

export default function LiveChat({
  isEnabled,
  onToggle,
  isHost = false,
}: LiveChatProps) {
  const { user, isAuthenticated } = useFirebaseAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { colors } = useTheme();

  // Check if user has premium subscription
  const hasPremiumSubscription = userProfile?.activeSubscription || false;

  // Mock data for demonstration
  useEffect(() => {
    if (isAuthenticated && hasPremiumSubscription) {
      // Mock online users
      setOnlineUsers([
        { id: '1', username: 'MetalHead', isOnline: true, isHost: false },
        { id: '2', username: 'RockStar', isOnline: true, isHost: true },
        { id: '3', username: 'PunkRock', isOnline: true, isHost: false },
      ]);

      // Mock messages
      setMessages([
        {
          id: '1',
          userId: '2',
          username: 'RockStar',
          message: 'Welcome to the live chat!',
          timestamp: new Date(Date.now() - 60000),
          userProfile: { isAdmin: true }
        },
        {
          id: '2',
          userId: '1',
          username: 'MetalHead',
          message: 'Thanks! This is awesome!',
          timestamp: new Date(Date.now() - 30000),
          userProfile: { isPremium: true }
        },
        {
          id: '3',
          userId: '3',
          username: 'PunkRock',
          message: 'Great music playing right now!',
          timestamp: new Date(Date.now() - 15000),
          userProfile: {}
        }
      ]);
    }
  }, [isAuthenticated, hasPremiumSubscription]);

  // Fetch user profile when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    // Mock user profile - in real app, fetch from backend
    setUserProfile({
      userID: user.uid,
      firstName: user.displayName?.split(' ')[0] || 'User',
      userProfileImage: user.photoURL || undefined,
      activeSubscription: true // Mock for now
    });
  }, [isAuthenticated, user]);

  // Subscribe to real-time messages and online users
  useEffect(() => {
    if (!isAuthenticated || !hasPremiumSubscription) return;

    // Mock real-time updates
    const interval = setInterval(() => {
      // Simulate new messages
      if (Math.random() > 0.7) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          userId: '2',
          username: 'RockStar',
          message: 'Keep the music playing! 🤘',
          timestamp: new Date(),
          userProfile: { isAdmin: true }
        };
        setMessages(prev => [...prev, newMessage]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, hasPremiumSubscription]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userProfile) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: userProfile.userID,
      username: userProfile.firstName || 'Anonymous',
      message: newMessage.trim(),
      timestamp: new Date(),
      userProfile: {
        avatar: userProfile.userProfileImage,
        isPremium: hasPremiumSubscription,
        isAdmin: false // We'll need to add this property to the User interface if needed
      }
    };

    try {
      // In a real app, this would send to your backend
      setMessages(prev => [...prev, message]);
      setNewMessage("");
      
      // Scroll to bottom
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // If user is not authenticated and login prompt is hidden, show a small indicator
  if (!isAuthenticated && !showLoginPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowLoginPrompt(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-full p-3 shadow-lg"
          style={{
            background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
            boxShadow: `0 4px 16px ${colors.primary}40`,
          }}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // If user is not authenticated, show login prompt
  if (!isAuthenticated && showLoginPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Card
          className="w-80 shadow-lg backdrop-blur-sm border-0 live-chat-card"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
            border: `1px solid ${colors.primary}30`,
          }}
        >
          <CardContent className="p-4 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute right-2 top-2 rounded-full opacity-70 transition-all duration-200 hover:opacity-100 focus:outline-none disabled:pointer-events-none flex items-center justify-center cursor-pointer"
              style={{
                color: colors.text,
                backgroundColor: "transparent",
                border: "none",
                width: "24px",
                height: "24px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text;
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            
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
                    className="flex-1 border-0"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.primaryText || "white",
                      border: `1px solid ${colors.primary}30`,
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
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      const event = new CustomEvent("openAuthModal", {
                        detail: { mode: "register" },
                      });
                      window.dispatchEvent(event);
                    }}
                    className="flex-1 border-0"
                    style={{
                      borderColor: colors.primary + "40",
                      color: colors.primary,
                      backgroundColor: "transparent",
                      border: `1px solid ${colors.primary}30`,
                    }}
                  >
                    Sign Up
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
      <div className="fixed bottom-4 right-4 z-40">
        <Card
          className="w-80 shadow-lg backdrop-blur-sm border-0 live-chat-card"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
            border: `1px solid ${colors.primary}30`,
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
                    className="flex-1 border-0"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.primaryText || "white",
                      border: `1px solid ${colors.primary}30`,
                    }}
                    onClick={() => (window.location.href = "/subscribe")}
                  >
                    Upgrade Now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onToggle}
                    className="flex-1"
                    style={{
                      borderColor: colors.primary + "40",
                      color: colors.primary,
                      backgroundColor: "transparent",
                    }}
                  >
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
          onClick={() => {
            if (isAuthenticated) {
              setIsOpen(true);
            } else {
              setShowLoginPrompt(true);
            }
          }}
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
        <div className="fixed bottom-4 right-4 w-80 h-96 z-50">
          <Card 
            className="h-full shadow-2xl backdrop-blur-sm border-0 live-chat-card"
            style={{
              background: `linear-gradient(135deg, ${colors.surface}95, ${colors.surface}85)`,
              border: `1px solid ${colors.primary}30`,
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
                          <AvatarImage src={msg.userProfile.avatar} />
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
                                                             style={{ color: colors.text }}
                            >
                              {msg.username}
                              {/* Host badge removed - not supported in current schema */}
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
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
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
                    disabled={!newMessage.trim() || isLoading}
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
