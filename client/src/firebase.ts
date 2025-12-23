// src/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  connectAuthEmulator,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from "firebase/storage";

// ❗ performance can be missing in some environments
let getPerformanceSafe: ((app: any) => any) | null = null;
(async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getPerformance } = await import("firebase/performance");
    getPerformanceSafe = getPerformance;
  } catch (e) {
    // ignore, we'll just skip performance
  }
})();

// 1) Firebase config (may be empty in local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasConfig =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId;

// ---- MOCKS for local preview ----
const mockAuth: Auth = {
  // @ts-expect-error – we are making a light mock
  currentUser: null,
  // minimal shape to avoid "undefined" errors
} as Auth;

const mockDb: Firestore = {
  // @ts-expect-error
  _fake: true,
} as Firestore;

const mockStorage: FirebaseStorage = {
  // @ts-expect-error
  _fake: true,
} as FirebaseStorage;

// these will be overwritten if init succeeds
let app: any = null;
let auth: Auth = mockAuth;
let db: Firestore = mockDb;
let storage: FirebaseStorage = mockStorage;
let performance: any = null;

if (hasConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    if (getPerformanceSafe) {
      performance = getPerformanceSafe(app);
    }

    // optional emulators
    if (
      import.meta.env.DEV &&
      import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true"
    ) {
      try {
        connectAuthEmulator(auth, "http://localhost:9099");
        connectFirestoreEmulator(db, "localhost", 8080);
        connectStorageEmulator(storage, "localhost", 9199);
      } catch (e) {
        console.warn("Firebase emulator connection failed:", e);
      }
    }
  } catch (e) {
    console.warn(
      "Firebase init failed, falling back to mock services. Error:",
      e
    );
    // fall back to mocks we declared above
  }
} else {
  console.warn(
    "No Firebase env vars detected — running with mock Firebase services."
  );
}

// ------------------------------------------------------------------
// helper: only parts of the app that REALLY need Firebase should call this
export const ensureFirebaseInitialized = () => {
  if (!hasConfig) {
    throw new Error(
      "This feature needs Firebase, but you're running in local mock mode."
    );
  }
  return { auth, db, storage, performance };
};

// ------------------------------------------------------------------
// GOOGLE PROVIDER
export const googleProvider = new GoogleAuthProvider();

// ------------------------------------------------------------------
// AUTH FUNCTIONS — make them graceful in mock mode

export const signInWithGoogle = async () => {
  if (!hasConfig) {
    throw new Error("Google sign-in not available in local mock mode.");
  }
  return await signInWithPopup(auth, googleProvider);
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  if (!hasConfig) {
    throw new Error("Email sign-up not available in local mock mode.");
  }
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: `${firstName} ${lastName}` });
  await sendEmailVerification(result.user);
  return result;
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!hasConfig) {
    throw new Error("Email sign-in not available in local mock mode.");
  }
  return await signInWithEmailAndPassword(auth, email, password);
};

export const sendPasswordReset = async (email: string) => {
  if (!hasConfig) {
    throw new Error("Password reset not available in local mock mode.");
  }
  await sendPasswordResetEmail(auth, email);
};

// ------------------------------------------------------------------
// Token helper
export const getIdToken = async (): Promise<string | null> => {
  if (!hasConfig) return null;
  const user = auth.currentUser;
  if (user) return await user.getIdToken();
  return null;
};

// ------------------------------------------------------------------
// Authenticated fetch helper
export const authenticatedApiCall = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = await getIdToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};

// ------------------------------------------------------------------
export { app, auth, db, storage, performance, firebaseConfig, hasConfig };
