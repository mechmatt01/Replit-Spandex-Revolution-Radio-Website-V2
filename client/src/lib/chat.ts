import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  userProfileImage?: string;
  isHost?: boolean;
}

export interface ChatUser {
  userId: string;
  username: string;
  userProfileImage?: string;
  isOnline: boolean;
  lastSeen: Date;
}

// Add a new message to the chat
export const addChatMessage = async (
  userId: string,
  username: string,
  message: string,
  userProfileImage?: string,
  isHost: boolean = false
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'chat_messages'), {
      userId,
      username,
      message: message.trim(),
      userProfileImage,
      isHost,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
};

// Get messages from the last 7 days
export const getChatMessages = async (limitCount: number = 100): Promise<ChatMessage[]> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const q = query(
      collection(db, 'chat_messages'),
      where('timestamp', '>=', sevenDaysAgo),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const messages: ChatMessage[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        userId: data.userId,
        username: data.username,
        message: data.message,
        timestamp: data.timestamp?.toDate() || new Date(),
        userProfileImage: data.userProfileImage,
        isHost: data.isHost || false
      });
    });
    
    // Sort by timestamp ascending for display
    return messages.reverse();
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

// Subscribe to real-time chat messages
export const subscribeToChatMessages = (
  callback: (messages: ChatMessage[]) => void,
  limitCount: number = 100
) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const q = query(
      collection(db, 'chat_messages'),
      where('timestamp', '>=', sevenDaysAgo),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages: ChatMessage[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          userId: data.userId,
          username: data.username,
          message: data.message,
          timestamp: data.timestamp?.toDate() || new Date(),
          userProfileImage: data.userProfileImage,
          isHost: data.isHost || false
        });
      });
      
      // Sort by timestamp ascending for display
      callback(messages.reverse());
    });
  } catch (error) {
    console.error('Error subscribing to chat messages:', error);
    throw error;
  }
};

// Update user's online status
export const updateUserOnlineStatus = async (
  userId: string,
  username: string,
  userProfileImage?: string,
  isOnline: boolean = true
): Promise<void> => {
  try {
    const userRef = doc(db, 'chat_users', userId);
    await addDoc(collection(db, 'chat_users'), {
      userId,
      username,
      userProfileImage,
      isOnline,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user online status:', error);
    throw error;
  }
};

// Get online users
export const getOnlineUsers = async (): Promise<ChatUser[]> => {
  try {
    const q = query(
      collection(db, 'chat_users'),
      where('isOnline', '==', true),
      orderBy('lastSeen', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const users: ChatUser[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        userId: data.userId,
        username: data.username,
        userProfileImage: data.userProfileImage,
        isOnline: data.isOnline,
        lastSeen: data.lastSeen?.toDate() || new Date()
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting online users:', error);
    throw error;
  }
};

// Subscribe to online users
export const subscribeToOnlineUsers = (callback: (users: ChatUser[]) => void) => {
  try {
    const q = query(
      collection(db, 'chat_users'),
      where('isOnline', '==', true),
      orderBy('lastSeen', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const users: ChatUser[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          userId: data.userId,
          username: data.username,
          userProfileImage: data.userProfileImage,
          isOnline: data.isOnline,
          lastSeen: data.lastSeen?.toDate() || new Date()
        });
      });
      
      callback(users);
    });
  } catch (error) {
    console.error('Error subscribing to online users:', error);
    throw error;
  }
};

// Clean up old messages (older than 7 days)
export const cleanupOldMessages = async (): Promise<number> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const q = query(
      collection(db, 'chat_messages'),
      where('timestamp', '<', sevenDaysAgo)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    let deletedCount = 0;
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deletedCount++;
    });
    
    if (deletedCount > 0) {
      await batch.commit();
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up old messages:', error);
    throw error;
  }
};

// Clean up old user status records
export const cleanupOldUserStatus = async (): Promise<number> => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const q = query(
      collection(db, 'chat_users'),
      where('lastSeen', '<', oneDayAgo)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    let deletedCount = 0;
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deletedCount++;
    });
    
    if (deletedCount > 0) {
      await batch.commit();
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up old user status:', error);
    throw error;
  }
};

// Set user as offline
export const setUserOffline = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'chat_users', userId);
    await addDoc(collection(db, 'chat_users'), {
      userId,
      isOnline: false,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error setting user offline:', error);
    throw error;
  }
};

// Scheduled cleanup function - call this daily
export const scheduledCleanup = async (): Promise<{ messagesDeleted: number; usersDeleted: number }> => {
  try {
    console.log('Starting scheduled chat cleanup...');
    
    const messagesDeleted = await cleanupOldMessages();
    const usersDeleted = await cleanupOldUserStatus();
    
    console.log(`Chat cleanup completed: ${messagesDeleted} messages and ${usersDeleted} user records deleted`);
    
    return { messagesDeleted, usersDeleted };
  } catch (error) {
    console.error('Error during scheduled cleanup:', error);
    throw error;
  }
};

// Initialize cleanup schedule (call this once when the app starts)
export const initializeChatCleanup = () => {
  // Run cleanup every 24 hours
  const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  const scheduleCleanup = () => {
    scheduledCleanup().catch(console.error);
  };
  
  // Run initial cleanup after 1 hour
  setTimeout(scheduleCleanup, 60 * 60 * 1000);
  
  // Schedule recurring cleanup
  setInterval(scheduleCleanup, cleanupInterval);
  
  console.log('Chat cleanup schedule initialized');
};
