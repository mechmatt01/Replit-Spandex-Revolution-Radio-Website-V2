import express, { Request, Response, NextFunction } from 'express';
import { auth, generateUserKey, sendEmailVerification, sendPhoneVerification } from './firebase';
// import { storage } from './storage';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
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
    
    // Get or create user in our database
    let user = await storage.getUser(decodedToken.uid);
    
    if (!user) {
      // Create new user with alphanumeric key
      const userKey = generateUserKey();
      user = await storage.createUser({
        id: decodedToken.uid,
        userKey,
        email: decodedToken.email || '',
        firstName: decodedToken.name?.split(' ')[0] || '',
        lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: decodedToken.picture || '',
        isEmailVerified: decodedToken.email_verified || false,
        isActiveListening: false,
        activeSubscription: false,
        isFirstLogin: true,
      });
    }

    req.user = user;
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

// API Routes for Firebase Authentication
export const setupFirebaseAuth = (app: express.Application) => {
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
      const { firstName, lastName, phoneNumber, location } = req.body;
      
      const updatedUser = await storage.updateUser(req.user.id, {
        firstName,
        lastName,
        phoneNumber,
        location,
      });

      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Send email verification
  app.post('/api/auth/send-email-verification', verifyToken, requireAuth, async (req: Request, res: Response) => {
    try {
      const success = await sendEmailVerification(req.user.email);
      if (success) {
        res.json({ message: 'Email verification sent' });
      } else {
        res.status(400).json({ error: 'Failed to send email verification' });
      }
    } catch (error) {
      console.error('Error sending email verification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Send phone verification
  app.post('/api/auth/send-phone-verification', verifyToken, requireAuth, async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.body;
      
      // Update user's phone number
      await storage.updateUser(req.user.id, { phoneNumber });
      
      // Generate and send verification code
      const verificationCode = await sendPhoneVerification(phoneNumber);
      
      if (verificationCode) {
        // Store verification code in database
        await storage.updateUser(req.user.id, { phoneVerificationCode: verificationCode });
        res.json({ message: 'Phone verification code sent' });
      } else {
        res.status(400).json({ error: 'Failed to send phone verification' });
      }
    } catch (error) {
      console.error('Error sending phone verification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Verify phone number
  app.post('/api/auth/verify-phone', verifyToken, requireAuth, async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      const verifiedUser = await storage.verifyPhone(req.user.id, code);
      
      if (verifiedUser) {
        res.json({ message: 'Phone number verified', user: verifiedUser });
      } else {
        res.status(400).json({ error: 'Invalid verification code' });
      }
    } catch (error) {
      console.error('Error verifying phone:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update listening status
  app.put('/api/auth/listening-status', verifyToken, requireAuth, async (req: Request, res: Response) => {
    try {
      const { isActiveListening } = req.body;
      const updatedUser = await storage.updateListeningStatus(req.user.id, isActiveListening);
      
      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Error updating listening status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update user location
  app.put('/api/auth/location', verifyToken, requireAuth, async (req: Request, res: Response) => {
    try {
      const { location } = req.body;
      const updatedUser = await storage.updateUserLocation(req.user.id, location);
      
      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get active listeners for map
  app.get('/api/auth/active-listeners', async (req: Request, res: Response) => {
    try {
      const { getFirestore, collection, query, where, getDocs } = require('firebase-admin/firestore');
      const db = getFirestore();
      
      // Get all users with IsActiveListening: true
      const usersSnapshot = await getDocs(query(collection(db, 'Users'), where('IsActiveListening', '==', true)));
      
      const listeners = [];
      usersSnapshot.forEach((doc: any) => {
        const data = doc.data();
        if (data.Location && typeof data.Location.lat === 'number' && typeof data.Location.lng === 'number') {
          listeners.push({
            id: doc.id,
            ...data,
          });
        }
      });
      
      res.json({ listeners });
    } catch (error) {
      console.error('Error getting active listeners:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Upload profile image
  app.post('/api/auth/upload-profile-image', verifyToken, requireAuth, async (req: Request, res: Response) => {
    try {
      // This would handle file upload to Firebase Storage
      // For now, we'll just update the profile image URL
      const { imageUrl } = req.body;
      const updatedUser = await storage.updateUser(req.user.id, { profileImageUrl: imageUrl });
      
      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};