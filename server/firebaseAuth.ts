import express, { Request, Response, NextFunction } from 'express';
import { auth } from './firebase';
import { db, isFirebaseAvailable } from './firebaseStorage';
import { UserProfileSchema, type UserProfile } from '../shared/schema';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Generate 10-character alphanumeric key
function generateUserKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create or get user profile in Firestore
async function createOrGetUserProfile(firebaseUid: string, userData: any): Promise<UserProfile> {
  try {
    // Check if user already exists
    const userQuery = await db.collection('Users').where('firebaseUid', '==', firebaseUid).get();
    
    if (!userQuery.empty) {
      // User exists, update last login
      const userDoc = userQuery.docs[0];
      const userData = userDoc.data() as UserProfile;
      
      await db.collection('Users').doc(userDoc.id).update({
        lastLogin: new Date(),
        updatedAt: new Date(),
      });
      
      return {
        ...userData,
        lastLogin: new Date(),
        updatedAt: new Date(),
      };
    } else {
      // Create new user with alphanumeric key
      const userKey = generateUserKey();
      const newUser: UserProfile = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        userProfileImage: userData.profileImageUrl || '',
        emailAddress: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        location: userData.location || null,
        isActiveListening: false,
        activeSubscription: false,
        renewalDate: null,
        lastLogin: new Date(),
        userID: userKey,
        isEmailVerified: userData.isEmailVerified || false,
        isPhoneVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Create user document with the alphanumeric key as document ID
      await db.collection('Users').doc(`User: ${userKey}`).set(newUser);
      
      return newUser;
    }
  } catch (error) {
    console.error('Error creating/getting user profile:', error);
    throw error;
  }
}

// Middleware to verify Firebase ID token
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Create or get user profile
    const userProfile = await createOrGetUserProfile(decodedToken.uid, {
      email: decodedToken.email || '',
      firstName: decodedToken.name?.split(' ')[0] || '',
      lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
      profileImageUrl: decodedToken.picture || '',
      isEmailVerified: decodedToken.email_verified || false,
    });

    req.user = userProfile;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Create Admin collection if it doesn't exist
async function ensureAdminCollection() {
  try {
    const adminDoc = await db.collection('Admin').doc('Information').get();
    if (!adminDoc.exists) {
      await db.collection('Admin').doc('Information').set({
        Username: 'adminAccess',
        Password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('Admin collection created with default credentials');
    }
  } catch (error) {
    console.error('Error ensuring admin collection:', error);
  }
}

// API Routes for Firebase Authentication
export const setupFirebaseAuth = (app: express.Application) => {
  // Ensure admin collection exists
  ensureAdminCollection();
  
  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      firebase: isFirebaseAvailable ? 'connected' : 'disconnected'
    });
  });
  // Get current user profile
  app.get('/api/auth/user', verifyToken, requireAuth, async (req: Request, res: Response) => {
    try {
      res.json({ user: req.user });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update user profile
  app.put('/api/auth/user', verifyToken, requireAuth, async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, phoneNumber, location, userProfileImage } = req.body;
      
      const updateData: Partial<UserProfile> = {
        updatedAt: new Date(),
      };
      
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (phoneNumber) updateData.phoneNumber = phoneNumber;
      if (location) updateData.location = location;
      if (userProfileImage) updateData.userProfileImage = userProfileImage;
      
      await db.collection('Users').doc(`User: ${req.user.userID}`).update(updateData);
      
      const updatedUser = { ...req.user, ...updateData };
      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update listening status
  app.put('/api/auth/listening-status', verifyToken, requireAuth, async (req: Request, res: Response) => {
    try {
      const { isActiveListening } = req.body;
      
      await db.collection('Users').doc(`User: ${req.user.userID}`).update({
        isActiveListening: isActiveListening,
        updatedAt: new Date(),
      });
      
      res.json({ success: true, isActiveListening });
    } catch (error) {
      console.error('Error updating listening status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update user location
  app.put('/api/auth/location', verifyToken, requireAuth, async (req: Request, res: Response) => {
    try {
      const { latitude, longitude } = req.body;
      
      await db.collection('Users').doc(`User: ${req.user.userID}`).update({
        location: { latitude, longitude },
        updatedAt: new Date(),
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get active listeners for map
  app.get('/api/auth/active-listeners', async (req: Request, res: Response) => {
    try {
      // Add a small delay to ensure Firebase is fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!db) {
        console.warn('Database not available, returning empty array');
        return res.json([]);
      }

      // Check if billing is enabled first
      try {
        const testQuery = await db.collection('Users').limit(1).get();
      } catch (billingError: any) {
        if (billingError.code === 7 && billingError.message?.includes('billing')) {
          console.warn('⚠️  Firebase billing not enabled. Returning empty active listeners.');
          return res.json([]);
        }
        console.warn('Firebase query test failed:', billingError.message);
        return res.json([]);
      }

      // First, let's try a simple query to see if the collection exists
      const allUsersQuery = await db.collection('Users').limit(5).get();
      console.log('Total users in collection:', allUsersQuery.size);
      
      // Now try the composite query with error handling
      let activeListenersQuery;
      try {
        activeListenersQuery = await db.collection('Users')
          .where('isActiveListening', '==', true)
          .where('location', '!=', null)
          .get();
      } catch (queryError: any) {
        console.warn('Composite query failed, trying simpler query:', queryError.message);
        // Fallback to simpler query
        try {
          activeListenersQuery = await db.collection('Users')
            .where('isActiveListening', '==', true)
            .get();
        } catch (fallbackError: any) {
          console.warn('Fallback query also failed:', fallbackError.message);
          return res.json([]);
        }
      }

      const activeListeners = activeListenersQuery.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          username: data.username || 'Anonymous',
          location: data.location || null,
          IsActiveListening: data.isActiveListening || false,
          Location: data.location || null,
          lastSeen: data.lastSeen ? data.lastSeen.toDate() : new Date(),
          profileImage: data.profileImage || null
        };
      });

      console.log(`Found ${activeListeners.length} active listeners`);
      res.json(activeListeners);
    } catch (error: any) {
      console.error('Error fetching active listeners:', error);
      if (error.code === 7 && error.message?.includes('billing')) {
        console.warn('⚠️  Firebase billing not enabled. Returning empty active listeners.');
        return res.json([]);
      }
      // Always return empty array instead of 500 error
      console.warn('Returning empty array due to error');
      return res.json([]);
    }
  });

  // Get total listeners count
  app.get('/api/auth/total-listeners', async (req: Request, res: Response) => {
    try {
      const dataDoc = await db.collection('Data').doc('Statistics').get();
      const totalListeners = dataDoc.exists ? dataDoc.data()?.TotalListeners || 0 : 0;
      
      res.json({ totalListeners });
    } catch (error) {
      console.error('Error getting total listeners:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update total listeners count
  app.put('/api/auth/total-listeners', verifyToken, requireAuth, async (req: Request, res: Response) => {
    try {
      const { totalListeners } = req.body;
      
      await db.collection('Data').doc('Statistics').set({
        TotalListeners: totalListeners,
        updatedAt: new Date(),
      }, { merge: true });
      
      res.json({ success: true, totalListeners });
    } catch (error) {
      console.error('Error updating total listeners:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};