import { collection, addDoc, getDocs, orderBy, limit, query, where, doc, onSnapshot, serverTimestamp, writeBatch, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Add a new message to the chat
export const addChatMessage = async (userId, username, message, userProfileImage, isHost = false) => {
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
    }
    catch (error) {
        console.error('Error adding chat message:', error);
        throw error;
    }
};

// Get messages from the last 7 days
export const getChatMessages = async (limitCount = 100) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const q = query(collection(db, 'chat_messages'), where('timestamp', '>=', sevenDaysAgo), orderBy('timestamp', 'desc'), limit(limitCount));
        const querySnapshot = await getDocs(q);
        const messages = [];
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
    }
    catch (error) {
        console.error('Error getting chat messages:', error);
        throw error;
    }
};

// Subscribe to real-time chat messages
export const subscribeToChatMessages = (callback, limitCount = 100) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const q = query(collection(db, 'chat_messages'), where('timestamp', '>=', sevenDaysAgo), orderBy('timestamp', 'desc'), limit(limitCount));
        return onSnapshot(q, (querySnapshot) => {
            const messages = [];
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
    }
    catch (error) {
        console.error('Error subscribing to chat messages:', error);
        throw error;
    }
};

// Update user's online status - FIXED to use setDoc instead of addDoc
export const updateUserOnlineStatus = async (userId, username, userProfileImage, isOnline = true) => {
    try {
        const userRef = doc(db, 'chat_users', userId);
        await setDoc(userRef, {
            userId,
            username,
            userProfileImage,
            isOnline,
            lastSeen: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true });
    }
    catch (error) {
        console.error('Error updating user online status:', error);
        throw error;
    }
};

// Set user offline
export const setUserOffline = async (userId) => {
    try {
        const userRef = doc(db, 'chat_users', userId);
        await updateDoc(userRef, {
            isOnline: false,
            lastSeen: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
    catch (error) {
        console.error('Error setting user offline:', error);
        throw error;
    }
};

// Get online users
export const getOnlineUsers = async () => {
    try {
        const q = query(collection(db, 'chat_users'), where('isOnline', '==', true), orderBy('lastSeen', 'desc'));
        const querySnapshot = await getDocs(q);
        const users = [];
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
    }
    catch (error) {
        console.error('Error getting online users:', error);
        return [];
    }
};

// Subscribe to online users
export const subscribeToOnlineUsers = (callback) => {
    try {
        const q = query(collection(db, 'chat_users'), where('isOnline', '==', true), orderBy('lastSeen', 'desc'));
        return onSnapshot(q, (querySnapshot) => {
            const users = [];
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
    }
    catch (error) {
        console.error('Error subscribing to online users:', error);
        throw error;
    }
};

// Clean up old messages (older than 7 days)
export const cleanupOldMessages = async () => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const q = query(collection(db, 'chat_messages'), where('timestamp', '<', sevenDaysAgo));
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
    }
    catch (error) {
        console.error('Error cleaning up old messages:', error);
        throw error;
    }
};

// Clean up old user status records
export const cleanupOldUserStatus = async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const q = query(collection(db, 'chat_users'), where('lastSeen', '<', thirtyDaysAgo));
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
    }
    catch (error) {
        console.error('Error cleaning up old user status:', error);
        throw error;
    }
};
// Scheduled cleanup function - call this daily
export const scheduledCleanup = async () => {
    try {
        console.log('Starting scheduled chat cleanup...');
        const messagesDeleted = await cleanupOldMessages();
        const usersDeleted = await cleanupOldUserStatus();
        console.log(`Chat cleanup completed: ${messagesDeleted} messages and ${usersDeleted} user records deleted`);
        return { messagesDeleted, usersDeleted };
    }
    catch (error) {
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

// Ensure Firebase collections exist and are properly set up
export const ensureChatCollections = async () => {
    try {
        // Create a test document to ensure the collection exists
        const testDoc = await addDoc(collection(db, 'chat_messages'), {
            userId: 'system',
            username: 'System',
            message: 'Chat system initialized',
            timestamp: serverTimestamp(),
            createdAt: serverTimestamp(),
            isSystem: true
        });
        
        // Delete the test document immediately
        await deleteDoc(testDoc);
        
        console.log('Chat collections are properly set up');
    } catch (error) {
        console.error('Error ensuring chat collections:', error);
        throw error;
    }
};

// Initialize chat system
export const initializeChatSystem = async () => {
    try {
        await ensureChatCollections();
        
        // Set up periodic cleanup
        setInterval(async () => {
            try {
                await cleanupOldMessages();
                await cleanupOldUserStatus();
            } catch (error) {
                console.error('Error during periodic cleanup:', error);
            }
        }, 24 * 60 * 60 * 1000); // Run cleanup every 24 hours
        
        console.log('Chat system initialized successfully');
    } catch (error) {
        console.error('Error initializing chat system:', error);
        throw error;
    }
};
