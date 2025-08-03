import type { Express } from "express";
import { firebaseRadioStorage } from "./firebaseStorage";
import { universalAdDetector } from "./universalAdDetection";
import { insertRadioStationSchema } from "@shared/schema";
import { storage } from "./storage";
import { z } from "zod";

/**
 * Admin API Routes for Radio Station Management
 * All routes require authentication and admin privileges
 */
export function registerAdminRoutes(app: Express): void {
  // Middleware to check admin privileges
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Check if user is admin (you can implement your own admin check)
      // For now, we'll use the user's admin status from the database
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin privileges required" });
      }

      next();
    } catch (error) {
      console.error("Admin middleware error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get all radio stations (admin only)
  app.get("/api/admin/radio-stations", requireAdmin, async (req, res) => {
    try {
      const stations = await firebaseRadioStorage.getRadioStations();
      res.json(stations);
    } catch (error) {
      console.error("Failed to fetch radio stations:", error);
      res.status(500).json({ error: "Failed to fetch radio stations" });
    }
  });

  // Get single radio station (admin only)
  app.get("/api/admin/radio-stations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const station = await firebaseRadioStorage.getRadioStationById(id);
      
      if (!station) {
        return res.status(404).json({ error: "Radio station not found" });
      }

      res.json(station);
    } catch (error) {
      console.error("Failed to fetch radio station:", error);
      res.status(500).json({ error: "Failed to fetch radio station" });
    }
  });

  // Create new radio station (admin only)
  app.post("/api/admin/radio-stations", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertRadioStationSchema.parse(req.body);
      
      // Check if station ID already exists
      const existingStation = await firebaseRadioStorage.getRadioStationByStationId(validatedData.stationId);
      if (existingStation) {
        return res.status(409).json({ error: "Station ID already exists" });
      }

      const station = await firebaseRadioStorage.createRadioStation(validatedData);
      
      // Test the station's metadata API
      const metadata = await universalAdDetector.fetchStationMetadata(station);
      
      res.status(201).json({
        station,
        metadata,
        message: "Radio station created successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      
      console.error("Failed to create radio station:", error);
      res.status(500).json({ error: "Failed to create radio station" });
    }
  });

  // Update radio station (admin only)
  app.put("/api/admin/radio-stations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRadioStationSchema.partial().parse(req.body);
      
      // Check if station exists
      const existingStation = await firebaseRadioStorage.getRadioStationById(id);
      if (!existingStation) {
        return res.status(404).json({ error: "Radio station not found" });
      }

      // Check if station ID is being changed and already exists
      if (validatedData.stationId && validatedData.stationId !== existingStation.stationId) {
        const duplicateStation = await firebaseRadioStorage.getRadioStationByStationId(validatedData.stationId);
        if (duplicateStation) {
          return res.status(409).json({ error: "Station ID already exists" });
        }
      }

      const updatedStation = await firebaseRadioStorage.updateRadioStation(id, validatedData);
      
      if (!updatedStation) {
        return res.status(500).json({ error: "Failed to update radio station" });
      }

      // Test the updated station's metadata API
      const metadata = await universalAdDetector.fetchStationMetadata(updatedStation);
      
      res.json({
        station: updatedStation,
        metadata,
        message: "Radio station updated successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      
      console.error("Failed to update radio station:", error);
      res.status(500).json({ error: "Failed to update radio station" });
    }
  });

  // Delete radio station (admin only)
  app.delete("/api/admin/radio-stations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if station exists
      const existingStation = await firebaseRadioStorage.getRadioStationById(id);
      if (!existingStation) {
        return res.status(404).json({ error: "Radio station not found" });
      }

      await firebaseRadioStorage.deleteRadioStation(id);
      
      res.json({ message: "Radio station deleted successfully" });
    } catch (error) {
      console.error("Failed to delete radio station:", error);
      res.status(500).json({ error: "Failed to delete radio station" });
    }
  });

  // Update station sort order (admin only)
  app.patch("/api/admin/radio-stations/:id/sort", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { sortOrder } = req.body;
      
      if (typeof sortOrder !== "number") {
        return res.status(400).json({ error: "Sort order must be a number" });
      }

      const updatedStation = await firebaseRadioStorage.updateStationSortOrder(id, sortOrder);
      
      if (!updatedStation) {
        return res.status(404).json({ error: "Radio station not found" });
      }

      res.json({ station: updatedStation, message: "Sort order updated successfully" });
    } catch (error) {
      console.error("Failed to update sort order:", error);
      res.status(500).json({ error: "Failed to update sort order" });
    }
  });

  // Test station metadata API (admin only)
  app.post("/api/admin/radio-stations/:id/test", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const station = await firebaseRadioStorage.getRadioStationById(id);
      
      if (!station) {
        return res.status(404).json({ error: "Radio station not found" });
      }

      // Test metadata fetching
      const metadata = await universalAdDetector.fetchStationMetadata(station);
      
      // Test ad detection
      const adDetection = await universalAdDetector.detectAdsForStation(station.stationId, metadata || undefined);
      
      res.json({
        station: station.name,
        metadata,
        adDetection,
        status: metadata ? "success" : "failed",
        message: metadata ? "Station API is working" : "Station API is not responding"
      });
    } catch (error) {
      console.error("Failed to test station:", error);
      res.status(500).json({ error: "Failed to test station" });
    }
  });

  // Get advertisement detection results for a station
  app.get("/api/admin/radio-stations/:id/ads", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const station = await firebaseRadioStorage.getRadioStationById(id);
      
      if (!station) {
        return res.status(404).json({ error: "Radio station not found" });
      }

      const metadata = await universalAdDetector.fetchStationMetadata(station);
      const adDetection = await universalAdDetector.detectAdsForStation(station.stationId, metadata || undefined);
      
      res.json({
        stationId: station.stationId,
        stationName: station.name,
        currentMetadata: metadata,
        adDetection,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to get ad detection results:", error);
      res.status(500).json({ error: "Failed to get ad detection results" });
    }
  });

  // Initialize default stations (admin only)
  app.post("/api/admin/radio-stations/initialize", requireAdmin, async (req, res) => {
    try {
      await firebaseRadioStorage.initializeDefaultStations();
      const stations = await firebaseRadioStorage.getRadioStations();
      
      res.json({
        message: "Default stations initialized successfully",
        stations
      });
    } catch (error) {
      console.error("Failed to initialize default stations:", error);
      res.status(500).json({ error: "Failed to initialize default stations" });
    }
  });
}