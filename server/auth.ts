import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { User, RegisterUser, LoginUser } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// Passport configuration
export function setupPassport(app: Express) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy
  passport.use(new LocalStrategy(
    { usernameField: "email" },
    async (email: string, password: string, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !user.password) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid email or password" });
        }

        if (!user.isEmailVerified) {
          return done(null, false, { message: "Please verify your email address" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Google OAuth strategy
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : (process.env.NODE_ENV === 'production' 
        ? `https://${process.env.REPL_SLUG}.${process.env.REPLIT_CLUSTER || 'replit'}.app`
        : 'http://localhost:5000');
    
    passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${baseUrl}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with Google ID
        let user = await storage.getUserByGoogleId(profile.id);
        
        if (!user) {
          // Check if user exists with same email
          user = await storage.getUserByEmail(profile.emails?.[0]?.value || "");
          
          if (user) {
            // Link Google account to existing user
            user = await storage.updateUser(user.id, {
              googleId: profile.id,
              isEmailVerified: true,
            });
          } else {
            // Create new user
            const email = profile.emails?.[0]?.value || "";
            const firstName = profile.name?.givenName || "";
            const lastName = profile.name?.familyName || "";
            
            // Generate username from email or name
            let username = email.split('@')[0];
            if (!username && firstName) {
              username = firstName.toLowerCase();
            }
            if (!username) {
              username = `user_${profile.id}`;
            }
            
            user = await storage.upsertUser({
              username,
              email,
              firstName,
              lastName,
              googleId: profile.id,
            });
            
            user = await storage.updateUser(user.id, {
              isEmailVerified: true,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Authentication middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && (req.user as User)?.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};

// Utility functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateJWT(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export async function sendVerificationEmail(email: string, token: string, firstName: string) {
  const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:5000"}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@spandexsalvationradio.com",
    to: email,
    subject: "Verify Your Email - Spandex Salvation Radio",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff6b35;">Welcome to Spandex Salvation Radio, ${firstName}!</h1>
        <p>Thank you for joining the hairspray rebellion! Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account with Spandex Salvation Radio, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await emailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
}