import express, { type Request, Response, Express } from "express";
import type { Session } from "express-session";
import { createServer, type Server } from "http";
import { setupFirebaseAuth } from "./firebaseAuth";
import { registerAdminRoutes } from "./adminRoutes";
import { firebaseRadioStorage, firebaseLiveStatsStorage } from "./firebaseStorage";
import bcrypt from "bcryptjs";

// Firebase Admin SDK
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
let firebaseApp: any;
let isFirebaseAvailable = false;

try {
  const apps = getApps();
  if (apps.length > 0) {
    firebaseApp = apps[0];
    isFirebaseAvailable = true;
    console.log('Using existing Firebase app');
  } else {
    let serviceAccount;
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      console.log('Loaded Firebase service account from file');
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
      console.log('Loaded Firebase service account from environment variables');
    } else {
      console.log('Firebase service account not found');
      isFirebaseAvailable = false;
    }

    if (serviceAccount) {
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId || serviceAccount.project_id,
      });
      isFirebaseAvailable = true;
      console.log('Firebase app initialized successfully');
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  isFirebaseAvailable = false;
}

const db = isFirebaseAvailable ? getFirestore(firebaseApp) : null;

// Login user with email and password
async function loginFirebaseUser(email: string, password: string) {
  try {
    console.log('[Firebase Auth] Attempting login for:', email);

    if (!db) {
      return { success: false, error: 'Database not available' };
    }

    // Find user by email
    const userQuery = await db.collection('Users').where('EmailAddress', '==', email).get();

    if (userQuery.empty) {
      console.log('[Firebase Auth] User not found:', email);
      return { success: false, error: 'No account found with this email address. Please check your email or create a new account.' };
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.PasswordHash);

    if (!isPasswordValid) {
      console.log('[Firebase Auth] Invalid password for:', email);
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Update last login time
    await db.collection('Users').doc(`User: ${userData.UserID}`).update({
      UpdatedAt: new Date().toISOString(),
      LastActive: new Date().toISOString()
    });

    console.log('[Firebase Auth] Login successful for:', email);

    // Remove password from response
    const { PasswordHash, ...profileWithoutPassword } = userData;

    return {
      success: true,
      userID: userData.UserID,
      profile: profileWithoutPassword
    };

  } catch (error: any) {
    console.error('[Firebase Auth] Login error:', error);
    return { 
      success: false, 
      error: error.message || 'Login failed. Please try again.' 
    };
  }
}

// Handle Google OAuth authentication
async function handleGoogleAuth(googleId: string, email: string, firstName: string, lastName: string) {
  try {
    console.log('[Google Auth] Attempting Google auth for:', email);

    if (!db) {
      return { success: false, error: 'Database not available' };
    }

    // Check if user exists by Google ID
    let userQuery = await db.collection('Users').where('GoogleID', '==', googleId).get();
    let userData = null;

    if (!userQuery.empty) {
      // User exists with Google ID
      userData = userQuery.docs[0].data();
      console.log('[Google Auth] User found by Google ID:', userData.UserID);
    } else {
      // Check if user exists by email
      userQuery = await db.collection('Users').where('EmailAddress', '==', email).get();
      
      if (!userQuery.empty) {
        // User exists with email, link Google account
        userData = userQuery.docs[0].data();
        await db.collection('Users').doc(`User: ${userData.UserID}`).update({
          GoogleID: googleId,
          EmailVerified: true,
          UpdatedAt: new Date().toISOString(),
          LastActive: new Date().toISOString()
        });
        userData.GoogleID = googleId;
        console.log('[Google Auth] Linked Google account to existing user:', userData.UserID);
      } else {
        // Create new user
        const generateUserID = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let result = '';
          for (let i = 0; i < 10; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };

        const userID = generateUserID();
        userData = {
          UserID: userID,
          FirstName: firstName,
          LastName: lastName,
          EmailAddress: email,
          GoogleID: googleId,
          PhoneNumber: '',
          UserProfileImage: '',
          Location: null,
          IsActiveListening: false,
          ActiveSubscription: false,
          RenewalDate: null,
          EmailVerified: true,
          PhoneVerified: false,
          CreatedAt: new Date().toISOString(),
          UpdatedAt: new Date().toISOString(),
          LastActive: new Date().toISOString(),
        };

        await db.collection('Users').doc(`User: ${userID}`).set(userData);
        console.log('[Google Auth] Created new user with Google ID:', userID);
      }
    }

    // Update last login time
    await db.collection('Users').doc(`User: ${userData.UserID}`).update({
      LastActive: new Date().toISOString()
    });

    console.log('[Google Auth] Google authentication successful for:', email);

    return {
      success: true,
      userID: userData.UserID,
      profile: userData
    };

  } catch (error: any) {
    console.error('[Google Auth] Google authentication error:', error);
    return { 
      success: false, 
      error: error.message || 'Google authentication failed. Please try again.' 
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Initialize Firebase radio storage (with error handling)
  try {
    await firebaseRadioStorage.initializeDefaultStations();
  } catch (error) {
    console.log('Firebase initialization failed, continuing without Firebase features:', error.message || error);
  }

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Register admin routes
  registerAdminRoutes(app);

  // Radio stations API
  app.get("/api/radio-stations", async (req, res) => {
    try {
      const stations = await firebaseRadioStorage.getRadioStations();
      res.json(stations);
    } catch (error) {
      console.error('Error fetching radio stations:', error);
      res.status(500).json({ error: 'Failed to fetch radio stations' });
    }
  });

  app.get("/api/radio-stations/active", async (req, res) => {
    try {
      const stations = await firebaseRadioStorage.getRadioStations();
      res.json(stations);
    } catch (error) {
      console.error('Error fetching active radio stations:', error);
      res.status(500).json({ error: 'Failed to fetch active radio stations' });
    }
  });

  // User registration endpoint
  app.post("/api/auth/firebase/register", async (req, res) => {
    try {
      const { firstName, lastName, email, phoneNumber, password } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Generate user ID
      const generateUserID = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 10; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      const userID = generateUserID();
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user document in Firestore
      const userData = {
        UserID: userID,
        FirstName: firstName,
        LastName: lastName,
        EmailAddress: email,
        PhoneNumber: phoneNumber || '',
        PasswordHash: hashedPassword,
        UserProfileImage: '',
        Location: null,
        IsActiveListening: false,
        ActiveSubscription: false,
        RenewalDate: null,
        EmailVerified: false,
        PhoneVerified: false,
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
        LastActive: new Date().toISOString(),
      };

      if (db) {
        await db.collection('Users').doc(`User: ${userID}`).set(userData);
        console.log('User created in Firestore:', userID);
      }

      res.json({
        success: true,
        userID,
        profile: {
          UserID: userID,
          FirstName: firstName,
          LastName: lastName,
          EmailAddress: email,
          PhoneNumber: phoneNumber || '',
          UserProfileImage: '',
          Location: null,
          IsActiveListening: false,
          ActiveSubscription: false,
          RenewalDate: null,
          EmailVerified: false,
          PhoneVerified: false,
          CreatedAt: userData.CreatedAt,
          UpdatedAt: userData.UpdatedAt,
          LastActive: userData.LastActive,
        }
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // User login endpoint
  app.post("/api/auth/firebase/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }

      const result = await loginFirebaseUser(email, password);

      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json({ error: result.error });
      }
    } catch (error: any) {
      console.error('Firebase login error:', error);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  });

  // Google OAuth login/register endpoint
  app.post("/api/auth/firebase/google", async (req, res) => {
    try {
      const { googleId, email, firstName, lastName } = req.body;

      if (!googleId || !email || !firstName || !lastName) {
        return res.status(400).json({ error: 'Google ID, email, first name, and last name are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }

      const result = await handleGoogleAuth(googleId, email, firstName, lastName);

      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json({ error: result.error });
      }
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      res.status(500).json({ error: 'Google authentication failed. Please try again.' });
    }
  });

  // Setup Firebase authentication routes
  setupFirebaseAuth(app);

  return server;
}