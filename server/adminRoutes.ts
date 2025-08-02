import express, { Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

// Initialize Admin collection in Firestore
export async function initializeAdminCollection() {
  try {
    const adminRef = db.doc('Admin/Information');
    const adminDoc = await adminRef.get();
    
    if (!adminDoc.exists) {
      // Create admin credentials
      await adminRef.set({
        Username: "adminAccess",
        Password: "password123",
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
      });
      console.log('Admin collection initialized successfully');
    } else {
      console.log('Admin collection already exists');
    }
  } catch (error) {
    console.error('Error initializing admin collection:', error);
  }
}

// Verify admin credentials
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    const adminRef = db.doc('Admin/Information');
    const adminDoc = await adminRef.get();
    
    if (!adminDoc.exists) {
      console.log('Admin collection not found, initializing...');
      await initializeAdminCollection();
      return false;
    }
    
    const adminData = adminDoc.data();
    return adminData.Username === username && adminData.Password === password;
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return false;
  }
}

export function registerAdminRoutes(app: express.Application) {
  // Initialize admin collection on server start (with error handling)
  try {
    initializeAdminCollection();
  } catch (error) {
    console.log('Admin collection initialization failed:', error.message);
  }

  // Admin authentication endpoint
  app.post('/api/admin/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Username and password are required' 
        });
      }

      const isValid = await verifyAdminCredentials(username, password);
      
      if (isValid) {
        res.json({ 
          success: true, 
          message: 'Admin access granted' 
        });
      } else {
        res.status(401).json({ 
          success: false, 
          error: 'Invalid admin credentials' 
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // Get admin info
  app.get('/api/admin/info', async (req: Request, res: Response) => {
    try {
      const adminRef = db.doc('Admin/Information');
      const adminDoc = await adminRef.get();
      
      if (adminDoc.exists) {
        const adminData = adminDoc.data();
        res.json({ 
          success: true, 
          data: {
            username: adminData.Username,
            createdAt: adminData.CreatedAt,
            updatedAt: adminData.UpdatedAt
          }
        });
      } else {
        res.status(404).json({ 
          success: false, 
          error: 'Admin collection not found' 
        });
      }
    } catch (error) {
      console.error('Error getting admin info:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // Update admin credentials
  app.put('/api/admin/credentials', async (req: Request, res: Response) => {
    try {
      const { currentUsername, currentPassword, newUsername, newPassword } = req.body;
      
      if (!currentUsername || !currentPassword) {
        return res.status(400).json({ 
          success: false, 
          error: 'Current credentials are required' 
        });
      }

      // Verify current credentials
      const isValid = await verifyAdminCredentials(currentUsername, currentPassword);
      
      if (!isValid) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid current credentials' 
        });
      }

      // Update admin credentials
      const adminRef = db.doc('Admin/Information');
      await adminRef.set({
        Username: newUsername || currentUsername,
        Password: newPassword || currentPassword,
        UpdatedAt: new Date().toISOString(),
      }, { merge: true });

      res.json({ 
        success: true, 
        message: 'Admin credentials updated successfully' 
      });
    } catch (error) {
      console.error('Error updating admin credentials:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // Get system statistics
  app.get('/api/admin/stats', async (req: Request, res: Response) => {
    try {
      // Get user count
      const usersRef = db.collection('Users');
      const usersSnapshot = await usersRef.get();
      const userCount = usersSnapshot.size;

      // Get active listeners count
      const activeListenersSnapshot = await usersRef.where('IsActiveListening', '==', true).get();
      const activeListenersCount = activeListenersSnapshot.size;

      // Get users with location
      const usersWithLocationSnapshot = await usersRef.where('Location', '!=', null).get();
      const usersWithLocationCount = usersWithLocationSnapshot.size;

      res.json({
        success: true,
        data: {
          totalUsers: userCount,
          activeListeners: activeListenersCount,
          usersWithLocation: usersWithLocationCount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting system stats:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // Get recent user activity
  app.get('/api/admin/recent-activity', async (req: Request, res: Response) => {
    try {
      const usersRef = db.collection('Users');
      const recentUsersSnapshot = await usersRef
        .orderBy('LastActive', 'desc')
        .limit(10)
        .get();

      const recentActivity = [];
      recentUsersSnapshot.forEach(doc => {
        const data = doc.data();
        recentActivity.push({
          userID: data.UserID,
          firstName: data.FirstName,
          lastName: data.LastName,
          email: data.EmailAddress,
          lastActive: data.LastActive,
          isActiveListening: data.IsActiveListening,
          hasLocation: !!data.Location
        });
      });

      res.json({
        success: true,
        data: recentActivity
      });
    } catch (error) {
      console.error('Error getting recent activity:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // Health check for admin routes
  app.get('/api/admin/health', (req: Request, res: Response) => {
    res.json({ 
      success: true, 
      message: 'Admin routes are healthy',
      timestamp: new Date().toISOString()
    });
  });
}