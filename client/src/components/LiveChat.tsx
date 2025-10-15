import React, { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import { Send, MessageCircle, X, Users, MicOff, LogIn } from "lucide-react";
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
import { measureAsyncOperation, measureSyncOperation } from '../lib/performance';

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
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { colors } = useTheme();

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
    // Allow chat for everyone, create mock user if not authenticated
    if (!isAuthenticated && !userProfile) {
      setUserProfile({
        userID: 'guest-' + Math.random().toString(36).substr(2, 9),
        firstName: 'Guest',
        userProfileImage: undefined,
        activeSubscription: true
      });
    }
  }, [isAuthenticated, userProfile]);

  // Separate effect for subscriptions to prevent infinite re-renders
  useEffect(() => {
    if (!userProfile) return;

    let unsubscribeMessages: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;

    try {
      // Subscribe to real-time chat messages
      unsubscribeMessages = subscribeToChatMessages((messages) => {
        setMessages(messages);
      });

      // Subscribe to online users
      unsubscribeUsers = subscribeToOnlineUsers((users: any) => {
        setOnlineUsers(users);
      });
    } catch (error) {
      console.error('Error subscribing to chat:', error);
    }

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, [userProfile?.userID]); // Only depend on userID to prevent infinite loops

  // Handle user online status when component mounts/unmounts
  useEffect(() => {
    if (!userProfile) return;

    // Set user as online when chat is opened
    const setUserOnline = async () => {
      try {
        await updateUserOnlineStatus(
          userProfile.userID,
          userProfile.firstName || 'Anonymous',
          userProfile.userProfileImage,
          true
        );
      } catch (error) {
        console.error('Error setting user online:', error);
      }
    };

    setUserOnline();

    // Set user as offline when component unmounts or user leaves
    const handleBeforeUnload = async () => {
      try {
        await setUserOffline(userProfile.userID);
      } catch (error) {
        console.error('Error setting user offline:', error);
      }
    };

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        try {
          await setUserOffline(userProfile.userID);
        } catch (error) {
          console.error('Error setting user offline:', error);
        }
      } else {
        try {
          await updateUserOnlineStatus(
            userProfile.userID,
            userProfile.firstName || 'Anonymous',
            userProfile.userProfileImage,
            true
          );
        } catch (error) {
          console.error('Error setting user online:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Set user offline when component unmounts
      handleBeforeUnload();
    };
  }, [userProfile]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for custom event to open chat from ChatButton
  useEffect(() => {
    const handleOpenLiveChat = () => {
      if (isAuthenticated) {
        handleOpenChat();
      }
    };

    window.addEventListener('openLiveChat', handleOpenLiveChat);
    
    return () => {
      window.removeEventListener('openLiveChat', handleOpenLiveChat);
    };
  }, [isAuthenticated]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userProfile) {
      console.log('Cannot send message: no message or user profile');
      return;
    }

    console.log('Sending message:', newMessage.trim(), 'for user:', userProfile.userID);
    
    // Store the message text before clearing
    const messageText = newMessage.trim();
    
    // Clear input immediately for better UX
    setNewMessage("");
    setIsLoading(true);
    
    // Add a timeout to ensure loading state is reset even if something goes wrong
    const loadingTimeout = setTimeout(() => {
      console.log('Loading timeout reached, forcing isLoading to false');
      setIsLoading(false);
    }, 10000); // 10 second timeout

    try {
      await measureAsyncOperation('live_chat_send_message', async () => {
        // Send message to Firebase
        console.log('Calling addChatMessage with:', {
          userId: userProfile.userID,
          username: userProfile.firstName || 'Anonymous',
          message: messageText,
          userProfileImage: userProfile.userProfileImage,
          isHost
        });
        
        const messageId = await addChatMessage(
          userProfile.userID,
          userProfile.firstName || 'Anonymous',
          messageText,
          userProfile.userProfileImage,
          isHost
        );
        
        console.log('Message sent successfully with ID:', messageId);
        
        // Add visual feedback - create a temporary "sending" message
        const sendingMessage: ChatMessage = {
          id: `sending-${Date.now()}`,
          userId: userProfile.userID,
          username: userProfile.firstName || 'Anonymous',
          message: messageText,
          timestamp: new Date(),
          userProfileImage: userProfile.userProfileImage,
          isHost
        };
        
        // Add sending message for visual feedback
        setMessages(prev => [...prev, sendingMessage]);
        
        // Remove sending message after a shorter delay (real message will replace it)
        setTimeout(() => {
          setMessages(prev => prev.filter(msg => msg.id !== sendingMessage.id));
        }, 1500);
        
        // Scroll to bottom with smooth animation
        setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
              top: scrollAreaRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 100);
      }, { 
        message_length: messageText.length,
        user_premium: 1
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore the message text if sending failed
      setNewMessage(messageText);
      // Show user-friendly error message
      alert('Failed to send message. Please try again.');
    } finally {
      console.log('Setting isLoading to false');
      clearTimeout(loadingTimeout);
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    // Format time in user's local timezone
    return date.toLocaleTimeString(navigator.language || 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Handle opening the chat with animation
  const handleOpenChat = () => {
    if (isAuthenticated) {
      setIsOpening(true);
      setTimeout(() => {
        setIsOpen(true);
        setIsOpening(false);
      }, 200); // Slightly longer for smoother opening
    } else {
      setShowLoginPrompt(true);
    }
  };

  // Handle closing the chat with animation
  const handleCloseChat = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  // Handle closing the login prompt with animation
  const handleCloseLoginPrompt = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowLoginPrompt(false);
      setIsClosing(false);
    }, 300);
  };

  // Add CSS for smooth animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .live-chat-card {
        transform-origin: bottom right;
        will-change: transform, opacity;
      }
      
      @keyframes chatSlideIn {
        from {
          opacity: 0;
          transform: scale(0.8) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      @keyframes chatSlideOut {
        from {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        to {
          opacity: 0;
          transform: scale(0.8) translateY(20px);
        }
      }
      
      .chat-enter {
        animation: chatSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      .chat-exit {
        animation: chatSlideOut 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // If user is not authenticated and login prompt is hidden, show a small indicator
  if (!isAuthenticated && !showLoginPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowLoginPrompt(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-full p-3 shadow-lg transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2"
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
          className={`w-80 shadow-lg backdrop-blur-sm border-0 live-chat-card transition-all duration-300 ease-out ${
            isClosing 
              ? 'opacity-0 scale-95 translate-y-2' 
              : 'opacity-100 scale-100 translate-y-0'
          }`}
          style={{
            background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
            border: `1px solid ${colors.primary}30`,
            transform: isClosing ? 'scale(0.95) translateY(8px)' : 'scale(1) translateY(0)',
            opacity: isClosing ? 0 : 1,
          }}
        >
          <CardContent className="p-4 relative">
            {/* Close Button */}
            <button
              onClick={handleCloseLoginPrompt}
              className="absolute right-2 top-2 rounded-full opacity-70 transition-all duration-200 hover:opacity-100 focus:outline-none focus:ring-0 disabled:pointer-events-none flex items-center justify-center cursor-pointer"
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
                    className="flex-1 border-0 focus:outline-none focus:ring-0"
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
                    className="flex-1 border-0 focus:outline-none focus:ring-0"
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

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Card
          className={`w-80 shadow-lg backdrop-blur-sm border-0 live-chat-card transition-all duration-300 ease-out ${
            isClosing 
              ? 'opacity-0 scale-95 translate-y-2' 
              : 'opacity-100 scale-100 translate-y-0'
          }`}
          style={{
            background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
            border: `1px solid ${colors.primary}30`,
            transform: isClosing ? 'scale(0.95) translateY(8px)' : 'scale(1) translateY(0)',
            opacity: isClosing ? 0 : 1,
          }}
        >
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <LogIn
                className="w-8 h-8 mx-auto"
                style={{ color: colors.primary }}
              />
              <h3
                className="font-bold text-lg"
                style={{ color: colors.primary }}
              >
                Login Required
              </h3>
              <p className="text-sm text-foreground">
                Please log in to access the live chat.
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
                  onClick={() => (window.location.href = "/login")}
                >
                  Login
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
      {(!isOpen || isClosing) && (
        <Button
          onClick={handleOpenChat}
          className={`fixed bottom-4 right-4 z-50 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg transition-all duration-300 ease-out ${
            isClosing 
              ? 'opacity-0 scale-75 translate-y-2' 
              : 'opacity-100 scale-100 translate-y-0'
          }`}
          style={{
            background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
            boxShadow: `0 8px 32px ${colors.primary}40`,
            transform: isClosing ? 'scale(0.75) translateY(8px)' : 'scale(1) translateY(0)',
            opacity: isClosing ? 0 : 1,
          }}
        >
          <MessageCircle className="h-6 w-6" />
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
            {onlineUsers.length}
          </Badge>
        </Button>
      )}

      {/* Chat Window */}
      {(isOpen || isOpening) && (
        <div className="fixed bottom-4 right-4 w-80 z-50" style={{ height: '500px' }}>
          <Card 
            className={`h-full shadow-2xl backdrop-blur-sm border-0 live-chat-card transition-all duration-300 ease-out ${
              isOpening 
                ? 'opacity-0 scale-95 translate-y-4' 
                : isClosing 
                  ? 'opacity-0 scale-95 translate-y-4' 
                  : 'opacity-100 scale-100 translate-y-0'
            }`}
            style={{
              background: `linear-gradient(135deg, ${colors.surface}95, ${colors.surface}85)`,
              border: `1px solid ${colors.primary}30`,
              transform: isOpening || isClosing ? 'scale(0.95) translateY(16px)' : 'scale(1) translateY(0)',
              opacity: isOpening || isClosing ? 0 : 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardHeader className="pb-3 flex-shrink-0">
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
                      className="p-1 focus:outline-none focus:ring-0"
                      style={{ color: colors.textSecondary }}
                    >
                      <MicOff className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    onClick={handleCloseChat}
                    variant="ghost"
                    size="sm"
                    className="p-1 focus:outline-none focus:ring-0"
                    style={{ color: colors.textSecondary }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4" ref={scrollAreaRef} style={{ minHeight: '300px', maxHeight: '400px' }}>
                <div className="space-y-3 py-2">
                  {messages.length === 0 ? (
                    <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                      <MessageCircle className="h-8 w-8 mx-auto mb-2" style={{ color: colors.textSecondary }} />
                      <p className="text-sm">Welcome to the live chat!</p>
                      <p className="text-xs">Be respectful and enjoy the show.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-3 chat-message ${
                        msg.id.startsWith('sending-') ? 'sending' : 
                        msg.id.startsWith('temp-') ? 'swooshing' : ''
                      }`}>
                        <Avatar className="avatar flex-shrink-0">
                          <AvatarImage src={msg.userProfileImage} />
                          <AvatarFallback 
                            className="avatar-fallback"
                            style={{ backgroundColor: colors.primary, color: colors.primaryText || 'white' }}
                          >
                            {msg.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs mb-2">
                            <span
                              className="font-medium truncate"
                              style={{ color: colors.text }}
                            >
                              {msg.username}
                              {msg.isHost && (
                                <span 
                                  className="ml-1 text-xs px-2 py-0.5 rounded-full"
                                  style={{ 
                                    backgroundColor: colors.primary,
                                    color: colors.primaryText || 'white'
                                  }}
                                >
                                  HOST
                                </span>
                              )}
                            </span>
                            <span style={{ color: colors.textSecondary }}>
                              {msg.id.startsWith('sending-') ? 'Sending...' : formatTime(msg.timestamp)}
                            </span>
                          </div>
                          <div 
                            className={`message-bubble ${
                              msg.id.startsWith('sending-') ? 'sending-message' :
                              msg.isHost 
                                ? 'host-message' 
                                : msg.userId.startsWith('guest-') 
                                  ? 'guest-message' 
                                  : 'user-message'
                            }`}
                          >
                            {msg.message}
                            {msg.id.startsWith('sending-') && (
                              <span className="ml-2 opacity-60">
                                <div className="inline-block w-1 h-1 bg-current rounded-full animate-pulse"></div>
                                <div className="inline-block w-1 h-1 bg-current rounded-full animate-pulse ml-1" style={{ animationDelay: '0.2s' }}></div>
                                <div className="inline-block w-1 h-1 bg-current rounded-full animate-pulse ml-1" style={{ animationDelay: '0.4s' }}></div>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Message Input - Fixed at bottom */}
              <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: colors.primary + '20' }}>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!isLoading && newMessage.trim()) {
                          handleSendMessage();
                        }
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    className="send-button focus:outline-none focus:ring-0"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.primaryText || "white",
                      transform: isLoading ? 'scale(0.95)' : 'scale(1)',
                      opacity: isLoading ? 0.8 : 1
                    }}
                    disabled={!newMessage.trim() || isLoading}
                    onClick={() => {
                      console.log('Send button clicked, isLoading:', isLoading, 'newMessage:', newMessage);
                      if (!isLoading && newMessage.trim()) {
                        handleSendMessage();
                      }
                    }}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
