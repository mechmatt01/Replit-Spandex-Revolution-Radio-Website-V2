import express, { Request, Response, NextFunction } from 'express';
import { auth } from './firebase';
import nodemailer from "nodemailer";
import crypto from "crypto";

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
    
    // Create user object from Firebase token
    const user = {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      firstName: decodedToken.name?.split(' ')[0] || '',
      lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
      profileImageUrl: decodedToken.picture || '',
      isEmailVerified: decodedToken.email_verified || false,
      isActiveListening: false,
      activeSubscription: false,
      isFirstLogin: true,
    };

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Authentication middleware using Firebase
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Create user object from Firebase token
    const user = {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      firstName: decodedToken.name?.split(' ')[0] || '',
      lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
      profileImageUrl: decodedToken.picture || '',
      isEmailVerified: decodedToken.email_verified || false,
      isActiveListening: false,
      activeSubscription: false,
      isFirstLogin: true,
    };

    req.user = user;
    return next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First verify authentication
    await isAuthenticated(req, res, () => {});
    
    // Check if user is admin (you can implement your own admin check)
    // For now, we'll check if the user has admin claims or is in admin collection
    if (req.user?.isAdmin) {
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(403).json({ message: "Admin access required" });
  }
};

// Utility functions
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName: string,
) {
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
