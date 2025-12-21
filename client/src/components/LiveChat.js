import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import { Send, MessageCircle, X, Users, MicOff, Crown, LogIn } from "lucide-react";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { 
  addChatMessage, 
  subscribeToChatMessages, 
  updateUserOnlineStatus, 
  subscribeToOnlineUsers,
  setUserOffline,
} from "../lib/chat";
import { measureAsyncOperation } from '../lib/performance';

export default function LiveChat({ isEnabled, onToggle, isHost = false, }) {
    const { user, isAuthenticated } = useFirebaseAuth();
    const [userProfile, setUserProfile] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [isOpening, setIsOpening] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef(null);
    const { colors } = useTheme();

    // Check if user has premium subscription
    const hasPremiumSubscription = userProfile?.activeSubscription || false;

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

        let unsubscribeMessages;
        let unsubscribeUsers;

        try {
            // Subscribe to real-time chat messages
            unsubscribeMessages = subscribeToChatMessages((messages) => {
                setMessages(messages);
            });

            // Subscribe to online users
            unsubscribeUsers = subscribeToOnlineUsers((users) => {
                setOnlineUsers(users);
            });
        } catch (error) {
            console.error('Error subscribing to chat:', error);
        }

        return () => {
            if (unsubscribeMessages) unsubscribeMessages();
            if (unsubscribeUsers) unsubscribeUsers();
        };
    }, [isAuthenticated, hasPremiumSubscription]);

    // Handle user online status when component mounts/unmounts
    useEffect(() => {
        if (!isAuthenticated || !userProfile) return;

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
    }, [isAuthenticated, userProfile]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !userProfile) return;

        setIsLoading(true);

        try {
            await measureAsyncOperation('live_chat_send_message', async () => {
                // Send message to Firebase
                await addChatMessage(
                    userProfile.userID,
                    userProfile.firstName || 'Anonymous',
                    newMessage.trim(),
                    userProfile.userProfileImage,
                    isHost
                );
                
                setNewMessage("");
                
                // Scroll to bottom
                setTimeout(() => {
                    if (scrollAreaRef.current) {
                        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
                    }
                }, 100);
            }, {
                message_length: newMessage.trim().length,
                user_premium: hasPremiumSubscription ? 1 : 0
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date) => {
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
        return (_jsx("div", { className: "fixed bottom-4 right-4 z-50", children: _jsx(Button, { onClick: () => setShowLoginPrompt(true), className: "bg-primary hover:bg-primary/90 text-white rounded-full p-3 shadow-lg transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2", style: {
                background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 4px 16px ${colors.primary}40`,
            }, children: _jsx(MessageCircle, { className: "h-5 w-5" }) }) }));
    }

    // If user is not authenticated, show login prompt
    if (!isAuthenticated && showLoginPrompt) {
        return (_jsx("div", { className: "fixed bottom-4 right-4 z-40", children: _jsxs(Card, { className: `w-80 shadow-lg backdrop-blur-sm border-0 live-chat-card transition-all duration-300 ease-out ${isClosing ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`, style: {
                background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
                border: `1px solid ${colors.primary}30`,
                transform: isClosing ? 'scale(0.95) translateY(8px)' : 'scale(1) translateY(0)',
                opacity: isClosing ? 0 : 1,
            }, children: [_jsxs(CardContent, { className: "p-4 relative", children: [_jsx("button", { onClick: handleCloseLoginPrompt, className: "absolute right-2 top-2 rounded-full opacity-70 transition-all duration-200 hover:opacity-100 focus:outline-none focus:ring-0 disabled:pointer-events-none flex items-center justify-center cursor-pointer", style: {
                                color: colors.text,
                                backgroundColor: "transparent",
                                border: "none",
                                width: "24px",
                                height: "24px",
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.color = colors.primary;
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.color = colors.text;
                            }, children: [_jsx(X, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Close" })] }), _jsxs("div", { className: "text-center space-y-3", children: [_jsx(MessageCircle, { className: "w-8 h-8 mx-auto", style: { color: colors.primary } }), _jsx("h3", { className: "font-bold text-lg", style: { color: colors.primary }, children: "Live Chat" }), _jsx("p", { className: "text-sm text-foreground", children: "Sign in to join the live chat with other metalheads!" }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "✓ Real-time messaging ✓ Premium community ✓ Song requests" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", className: "flex-1 border-0 focus:outline-none focus:ring-0", style: {
                                                backgroundColor: colors.primary,
                                                color: colors.primaryText || "white",
                                                border: `1px solid ${colors.primary}30`,
                                            }, onClick: () => {
                                                const event = new CustomEvent("openAuthModal", {
                                                    detail: { mode: "login" },
                                                });
                                                window.dispatchEvent(event);
                                            }, children: [_jsx(LogIn, { className: "w-4 h-4 mr-1" }), "Sign In"] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                                                const event = new CustomEvent("openAuthModal", {
                                                    detail: { mode: "register" },
                                                });
                                                window.dispatchEvent(event);
                                            }, className: "flex-1 border-0 focus:outline-none focus:ring-0", style: {
                                                borderColor: colors.primary + "40",
                                                color: colors.primary,
                                                backgroundColor: "transparent",
                                                border: `1px solid ${colors.primary}30`,
                                            }, children: "Sign Up" })] })] })] })] })] })] }));

    }

    // If user doesn't have premium subscription, show upgrade prompt
    if (!hasPremiumSubscription) {
        return (_jsx("div", { className: "fixed bottom-4 right-4 z-40", children: _jsxs(Card, { className: `w-80 shadow-lg backdrop-blur-sm border-0 live-chat-card transition-all duration-300 ease-out ${isClosing ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`, style: {
                background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
                border: `1px solid ${colors.primary}30`,
                transform: isClosing ? 'scale(0.95) translateY(8px)' : 'scale(1) translateY(0)',
                opacity: isClosing ? 0 : 1,
            }, children: [_jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "text-center space-y-3", children: [_jsx(Crown, { className: "w-8 h-8 mx-auto", style: { color: colors.primary } }), _jsx("h3", { className: "font-bold text-lg", style: { color: colors.primary }, children: "Premium Feature" }), _jsx("p", { className: "text-sm text-foreground", children: "Live chat is available exclusively to premium subscribers." }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "✓ Live Chat Access ✓ Song Submissions ✓ Exclusive Content" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", className: "flex-1 border-0", style: {
                                                backgroundColor: colors.primary,
                                                color: colors.primaryText || "white",
                                                border: `1px solid ${colors.primary}30`,
                                            }, onClick: () => (window.location.href = "/subscribe"), children: "Upgrade Now" }), _jsx(Button, { size: "sm", variant: "outline", onClick: onToggle, className: "flex-1", style: {
                                                borderColor: colors.primary + "40",
                                                color: colors.primary,
                                                backgroundColor: "transparent",
                                            }, children: "Close" })] })] })] })] })] })] }));

    }

    // Don't show chat if not enabled by host
    if (!isEnabled) {
        return null;
    }

    return (_jsxs(_Fragment, { children: [/* Chat Toggle Button */ (!isOpen || isClosing) && (_jsx(Button, { onClick: handleOpenChat, className: `fixed bottom-4 right-4 z-50 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg transition-all duration-300 ease-out ${isClosing ? 'opacity-0 scale-75 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`, style: {
                background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 8px 32px ${colors.primary}40`,
                transform: isClosing ? 'scale(0.75) translateY(8px)' : 'scale(1) translateY(0)',
                opacity: isClosing ? 0 : 1,
            }, children: [_jsx(MessageCircle, { className: "h-6 w-6" }), _jsx(Badge, { className: "absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5", children: onlineUsers.length })] })), /* Chat Window */ (isOpen || isOpening) && (_jsxs("div", { className: "fixed bottom-4 right-4 w-80 h-96 z-50", children: _jsxs(Card, { className: `h-full shadow-2xl backdrop-blur-sm border-0 live-chat-card transition-all duration-300 ease-out ${isOpening ? 'opacity-0 scale-95 translate-y-4' : isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`, style: {
                background: `linear-gradient(135deg, ${colors.surface}95, ${colors.surface}85)`,
                border: `1px solid ${colors.primary}30`,
                transform: isOpening || isClosing ? 'scale(0.95) translateY(16px)' : 'scale(1) translateY(0)',
                opacity: isOpening || isClosing ? 0 : 1,
            }, children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CardTitle, { className: "text-sm font-semibold", style: { color: colors.text }, children: "Live Chat" }), _jsxs(Badge, { variant: "secondary", className: "text-xs", style: {
                                    backgroundColor: colors.primary + '20',
                                    color: colors.primary,
                                }, children: [_jsx("div", { className: "w-2 h-2 rounded-full mr-1", style: { backgroundColor: colors.primary } }), "LIVE"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex items-center gap-1 text-xs", style: { color: colors.textSecondary }, children: [_jsx(Users, { className: "h-3 w-3" }), onlineUsers.length] }), isHost && (_jsx(Button, { onClick: onToggle, variant: "ghost", size: "sm", className: "p-1 focus:outline-none focus:ring-0", style: { color: colors.textSecondary }, children: _jsx(MicOff, { className: "h-4 w-4" }) })), _jsx(Button, { onClick: handleCloseChat, variant: "ghost", size: "sm", className: "p-1 focus:outline-none focus:ring-0", style: { color: colors.textSecondary }, children: _jsx(X, { className: "h-4 w-4" }) })] })] })] }), _jsxs(CardContent, { className: "p-0 flex flex-col h-full", children: [/* Messages Area */ _jsx(ScrollArea, { className: "flex-1 px-4", ref: scrollAreaRef, children: _jsx("div", { className: "space-y-3 py-2", children: messages.length === 0 ? (_jsxs("div", { className: "text-center py-8", style: { color: colors.textSecondary }, children: [_jsx(MessageCircle, { className: "h-8 w-8 mx-auto mb-2", style: { color: colors.textSecondary } }), _jsx("p", { className: "text-sm", children: "Welcome to the live chat!" }), _jsx("p", { className: "text-xs", children: "Be respectful and enjoy the show." })] })) : (messages.map((msg) => (_jsxs("div", { key: msg.id, className: "flex gap-2", children: [_jsxs(Avatar, { className: "w-8 h-8 flex-shrink-0", children: [_jsx(AvatarImage, { src: msg.userProfileImage }), _jsx(AvatarFallback, { className: "text-xs", style: { backgroundColor: colors.primary, color: colors.primaryText || 'white' }, children: msg.username.charAt(0).toUpperCase() })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs mb-1", children: [_jsx("span", { className: "font-medium truncate", style: { color: colors.text }, children: msg.username }), _jsx("span", { style: { color: colors.textSecondary }, children: formatTime(msg.timestamp) })] }), _jsx("p", { className: "text-sm rounded px-3 py-2", style: {
                                                backgroundColor: colors.primary + '10',
                                                color: colors.text,
                                                border: `1px solid ${colors.primary}20`
                                            }, children: msg.message })] })] }, msg.id)))) }) }), /* Message Input */ _jsxs("div", { className: "p-4 border-t", style: { borderColor: colors.primary + '20' }, children: [_jsxs("form", { onSubmit: (e) => { e.preventDefault(); handleSendMessage(); }, className: "flex gap-2", children: [_jsx(Input, { value: newMessage, onChange: (e) => setNewMessage(e.target.value), placeholder: "Type your message...", className: "flex-1 text-sm", style: {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.primary + '30',
                                    color: colors.text,
                                }, maxLength: 200, disabled: isLoading }), _jsx(Button, { type: "submit", size: "sm", className: "px-3 focus:outline-none focus:ring-0", style: {
                                    backgroundColor: colors.primary,
                                    color: colors.primaryText || "white",
                                }, disabled: !newMessage.trim() || isLoading, children: _jsx(Send, { className: "h-4 w-4" }) })] })] })] })] })] })] })] })] }));

}
