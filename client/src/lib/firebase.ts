import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export interface FirebaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  showVerifiedBadge?: boolean;
  subscriptionStatus?: string;
  subscriptionTier?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  isEmailVerified?: boolean;
  isAdmin?: boolean;
  accountDeletionScheduled?: boolean;
  accountDeletionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User operations
export const createUser = async (userData: Omit<FirebaseUser, 'createdAt' | 'updatedAt'>): Promise<FirebaseUser> => {
  const now = new Date();
  const user: FirebaseUser = {
    ...userData,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(doc(db, 'users', userData.id), user);
  return user;
};

export const getUser = async (userId: string): Promise<FirebaseUser | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      accountDeletionDate: data.accountDeletionDate?.toDate(),
    } as FirebaseUser;
  }
  return null;
};

export const updateUser = async (userId: string, updates: Partial<FirebaseUser>): Promise<FirebaseUser | null> => {
  const userRef = doc(db, 'users', userId);
  const updatedData = {
    ...updates,
    updatedAt: new Date(),
  };
  
  await updateDoc(userRef, updatedData);
  return await getUser(userId);
};

export const getUserByEmail = async (email: string): Promise<FirebaseUser | null> => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      accountDeletionDate: data.accountDeletionDate?.toDate(),
    } as FirebaseUser;
  }
  return null;
};

export const scheduleAccountDeletion = async (userId: string, deletionDate: Date): Promise<void> => {
  await updateUser(userId, {
    accountDeletionScheduled: true,
    accountDeletionDate: deletionDate,
  });
};

export const deleteUser = async (userId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId));
};

// Get users scheduled for deletion
export const getUsersScheduledForDeletion = async (): Promise<FirebaseUser[]> => {
  const now = new Date();
  const q = query(
    collection(db, 'users'),
    where('accountDeletionScheduled', '==', true),
    where('accountDeletionDate', '<=', now)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      accountDeletionDate: data.accountDeletionDate?.toDate(),
    } as FirebaseUser;
  });
};