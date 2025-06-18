import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Spotify API configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "60a088cba7d14e8888e34e92d40f8c41";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
import { insertSubmissionSchema, insertContactSchema, insertSubscriptionSchema, insertNowPlayingSchema } from "@shared/schema";
import { z } from "zod";

// Initialize Stripe if available
let stripe: any = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
  }
} catch (error) {
  console.log("Stripe not available - payment processing disabled");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Submissions API
  app.get("/api/submissions", async (req, res) => {
    try {
      const submissions = await storage.getSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  app.post("/api/submissions", async (req, res) => {
    try {
      const validatedData = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create submission" });
      }
    }
  });

  app.patch("/api/submissions/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const submission = await storage.updateSubmissionStatus(id, status);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      res.status(500).json({ error: "Failed to update submission status" });
    }
  });

  // Contacts API
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create contact" });
      }
    }
  });

  // Show Schedules API
  app.get("/api/schedules", async (req, res) => {
    try {
      const schedules = await storage.getActiveShowSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });

  // Past Shows API
  app.get("/api/past-shows", async (req, res) => {
    try {
      const shows = await storage.getPastShows();
      res.json(shows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch past shows" });
    }
  });

  // Now Playing API
  app.get("/api/now-playing", async (req, res) => {
    try {
      const track = await storage.getCurrentTrack();
      res.json(track);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current track" });
    }
  });

  app.post("/api/now-playing", async (req, res) => {
    try {
      const validatedData = insertNowPlayingSchema.parse(req.body);
      const track = await storage.updateNowPlaying(validatedData);
      res.json(track);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update now playing" });
      }
    }
  });

  // Stream Stats API
  app.get("/api/stream-stats", async (req, res) => {
    try {
      const stats = await storage.getStreamStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stream stats" });
    }
  });

  // Live Radio Stream Status API
  app.get("/api/radio-status", async (req, res) => {
    try {
      const response = await fetch("http://168.119.74.185:9858/status-json.xsl");
      if (!response.ok) {
        throw new Error("Failed to fetch radio status");
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Radio status error:", error);
      res.status(500).json({ error: "Failed to fetch radio status" });
    }
  });



  // Subscriptions API
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create subscription" });
      }
    }
  });

  // Stripe Payment Processing API
  app.post("/api/create-subscription", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: "Payment processing not available - Stripe not configured" });
    }

    try {
      const { priceId, customerEmail, customerName } = req.body;
      
      if (!priceId || !customerEmail || !customerName) {
        return res.status(400).json({ error: "Missing required payment information" });
      }

      // Create customer
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error('Stripe subscription error:', error);
      res.status(400).json({ error: error.message || "Payment processing failed" });
    }
  });

  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: "Payment processing not available - Stripe not configured" });
    }

    try {
      const { amount, currency = 'usd' } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid payment amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error: any) {
      console.error('Stripe payment intent error:', error);
      res.status(400).json({ error: error.message || "Payment processing failed" });
    }
  });

  // Spotify authentication endpoints
  app.post("/api/spotify/token", async (req, res) => {
    try {
      const { code, redirect_uri } = req.body;
      
      const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirect_uri
        })
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        res.json(tokenData);
      } else {
        const errorData = await tokenResponse.text();
        console.error("Spotify token error:", errorData);
        res.status(400).json({ error: "Failed to get access token", details: errorData });
      }
    } catch (error) {
      console.error("Spotify token error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/spotify/refresh", async (req, res) => {
    try {
      const { refresh_token } = req.body;
      
      const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refresh_token
        })
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        res.json(tokenData);
      } else {
        res.status(400).json({ error: "Failed to refresh token" });
      }
    } catch (error) {
      console.error("Spotify refresh error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Authentication API
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // In a real app, you'd use proper session management or JWT
      res.json({ 
        id: user.id, 
        username: user.username, 
        isAdmin: user.isAdmin 
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
