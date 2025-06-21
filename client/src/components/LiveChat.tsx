import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, X, Users, Mic, MicOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
}

export default function LiveChat({ isEnabled, onToggle, isHost = false }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Check if user has paid subscription (assuming stripeSubscriptionId indicates paid status)
  const hasPaidSubscription = user?.stripeSubscriptionId || false;

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
      username: user?.firstName || "Anonymous",
      message: message.trim(),
      timestamp: new Date(),
      isHost: isHost
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Don't show anything if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show subscription prompt if user doesn't have paid subscription
  if (!hasPaidSubscription) {
    return (
      <div className="fixed bottom-36 right-4 z-50">
        <Card className="bg-orange-500/10 border-orange-500/20 max-w-xs">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="text-orange-400 text-sm font-semibold mb-2">Premium Feature</p>
            <p className="text-gray-300 text-xs mb-3">
              Live chat is available with paid subscriptions. Upgrade to join the conversation!
            </p>
            <Button 
              onClick={() => document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' })}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1"
            >
              Upgrade Now
            </Button>
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
          className="fixed bottom-36 right-4 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
            {onlineCount}
          </Badge>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-32 right-4 w-80 h-96 z-50">
          <Card className="h-full bg-dark-surface border-dark-border shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold text-white">Live Chat</CardTitle>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400 text-xs">
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
                      className="text-gray-400 hover:text-orange-400 p-1"
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
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                      <p>Welcome to the live chat!</p>
                      <p className="text-xs">Be respectful and enjoy the show.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`font-medium ${msg.isHost ? 'text-orange-400' : 'text-gray-300'}`}>
                            {msg.username}
                            {msg.isHost && <Badge className="ml-1 bg-orange-500/20 text-orange-400 text-xs px-1">HOST</Badge>}
                          </span>
                          <span className="text-gray-500">{formatTime(msg.timestamp)}</span>
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
                    className="bg-orange-500 hover:bg-orange-600 px-3"
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