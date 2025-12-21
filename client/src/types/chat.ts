export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  isHost: boolean;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  userProfile?: {
    avatar?: string;
    isPremium?: boolean;
    isAdmin?: boolean;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  onlineUsers: User[];
  isLoading: boolean;
  error: string | null;
}
