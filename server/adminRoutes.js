import { getFirestore } from 'firebase-admin/firestore';
import { generateMockRadioStations, generateMockActiveListeners, generateMockUserStatistics, getActiveListenersFromFirebase, getUserStatisticsFromFirebase } from './mockData.js';
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
        }
        else {
            console.log('Admin collection already exists');
        }
    }
    catch (error) {
        console.error('Error initializing admin collection:', error);
    }
}
// Verify admin credentials
export async function verifyAdminCredentials(username, password) {
    try {
        console.log('[Admin] Verifying credentials for username:', username);
        const adminRef = db.doc('Admin/Information');
        const adminDoc = await adminRef.get();
        if (!adminDoc.exists) {
            console.log('[Admin] Admin collection not found, initializing...');
            await initializeAdminCollection();
            return false;
        }
        const adminData = adminDoc.data();
        console.log('[Admin] Retrieved admin data:', {
            storedUsername: adminData.Username,
            storedPassword: adminData.Password ? '***' : 'undefined',
            providedUsername: username,
            providedPassword: password ? '***' : 'undefined'
        });
        const isValid = adminData.Username === username && adminData.Password === password;
        console.log('[Admin] Credentials validation result:', isValid);
        return isValid;
    }
    catch (error) {
        console.error('[Admin] Error verifying admin credentials:', error);
        return false;
    }
}
export function registerAdminRoutes(app) {
    // Initialize admin collection on server start (with error handling)
    try {
        initializeAdminCollection();
    }
    catch (error) {
        console.log('Admin collection initialization failed:', error.message);
    }
    // Admin authentication endpoint
    app.post('/api/admin/login', async (req, res) => {
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
            }
            else {
                res.status(401).json({
                    success: false,
                    error: 'Invalid admin credentials'
                });
            }
        }
        catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Get admin info
    app.get('/api/admin/info', async (req, res) => {
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
            }
            else {
                res.status(404).json({
                    success: false,
                    error: 'Admin collection not found'
                });
            }
        }
        catch (error) {
            console.error('Error getting admin info:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Update admin credentials
    app.put('/api/admin/credentials', async (req, res) => {
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
        }
        catch (error) {
            console.error('Error updating admin credentials:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Get system statistics
    app.get('/api/admin/stats', async (req, res) => {
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
        }
        catch (error) {
            console.error('Error getting system stats:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Get recent user activity
    app.get('/api/admin/recent-activity', async (req, res) => {
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
        }
        catch (error) {
            console.error('Error getting recent activity:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Active listeners endpoint
    app.get('/api/admin/active-listeners', async (req, res) => {
        try {
            const { useMockData } = req.query;
            if (useMockData === 'true') {
                // Return mock data for testing
                const mockListeners = generateMockActiveListeners();
                res.json(mockListeners);
            }
            else {
                // Return real Firebase data
                const listeners = await getActiveListenersFromFirebase();
                res.json(listeners);
            }
        }
        catch (error) {
            console.error('Error fetching active listeners:', error);
            res.status(500).json({ error: 'Failed to fetch active listeners' });
        }
    });
    // User statistics endpoint
    app.get('/api/admin/user-statistics', async (req, res) => {
        try {
            const { useMockData } = req.query;
            if (useMockData === 'true') {
                // Return mock data for testing
                const mockStats = generateMockUserStatistics();
                res.json(mockStats);
            }
            else {
                // Return real Firebase data
                const stats = await getUserStatisticsFromFirebase();
                res.json(stats);
            }
        }
        catch (error) {
            console.error('Error fetching user statistics:', error);
            res.status(500).json({ error: 'Failed to fetch user statistics' });
        }
    });
    // Get radio stations (with mock data support)
    app.get('/api/admin/radio-stations', async (req, res) => {
        try {
            const { useMockData } = req.query;
            if (useMockData === 'true') {
                // Return mock data
                const mockStations = generateMockRadioStations(25);
                res.json(mockStations);
            }
            else {
                // Return real data from Firebase
                if (!db) {
                    return res.status(500).json({
                        success: false,
                        error: 'Database not available'
                    });
                }
                const stationsRef = db.collection('RadioStations');
                const stationsSnapshot = await stationsRef.get();
                const stations = [];
                stationsSnapshot.forEach(doc => {
                    stations.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                res.json(stations);
            }
        }
        catch (error) {
            console.error('Error getting radio stations:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get radio stations'
            });
        }
    });
    // Add new radio station
    app.post('/api/admin/radio-stations', async (req, res) => {
        try {
            const { useMockData } = req.query;
            const stationData = req.body;
            if (useMockData === 'true') {
                // Return mock success response
                res.json({
                    success: true,
                    message: 'Station added successfully (mock)',
                    id: 'mock-' + Date.now()
                });
            }
            else {
                // Add to Firebase
                if (!db) {
                    return res.status(500).json({
                        success: false,
                        error: 'Database not available'
                    });
                }
                const stationsRef = db.collection('RadioStations');
                const newStation = await stationsRef.add({
                    ...stationData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                res.json({
                    success: true,
                    message: 'Station added successfully',
                    id: newStation.id
                });
            }
        }
        catch (error) {
            console.error('Error adding radio station:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to add radio station'
            });
        }
    });
    // Update radio station
    app.put('/api/admin/radio-stations/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { useMockData } = req.query;
            const updateData = req.body;
            if (useMockData === 'true') {
                // Return mock success response
                res.json({
                    success: true,
                    message: 'Station updated successfully (mock)'
                });
            }
            else {
                // Update in Firebase
                if (!db) {
                    return res.status(500).json({
                        success: false,
                        error: 'Database not available'
                    });
                }
                await db.collection('RadioStations').doc(id).update({
                    ...updateData,
                    updatedAt: new Date().toISOString()
                });
                res.json({
                    success: true,
                    message: 'Station updated successfully'
                });
            }
        }
        catch (error) {
            console.error('Error updating radio station:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update radio station'
            });
        }
    });
    // Delete radio station
    app.delete('/api/admin/radio-stations/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { useMockData } = req.query;
            if (useMockData === 'true') {
                // Return mock success response
                res.json({
                    success: true,
                    message: 'Station deleted successfully (mock)'
                });
            }
            else {
                // Delete from Firebase
                if (!db) {
                    return res.status(500).json({
                        success: false,
                        error: 'Database not available'
                    });
                }
                await db.collection('RadioStations').doc(id).delete();
                res.json({
                    success: true,
                    message: 'Station deleted successfully'
                });
            }
        }
        catch (error) {
            console.error('Error deleting radio station:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete radio station'
            });
        }
    });
    // Toggle radio station status
    app.put('/api/admin/radio-stations/:id/toggle-status', async (req, res) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const { useMockData } = req.query;
            if (useMockData === 'true') {
                // Return mock success response
                res.json({
                    success: true,
                    message: 'Station status updated successfully (mock)'
                });
            }
            else {
                // Update status in Firebase
                if (!db) {
                    return res.status(500).json({
                        success: false,
                        error: 'Database not available'
                    });
                }
                await db.collection('RadioStations').doc(id).update({
                    isActive,
                    updatedAt: new Date().toISOString()
                });
                res.json({
                    success: true,
                    message: 'Station status updated successfully'
                });
            }
        }
        catch (error) {
            console.error('Error updating station status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update station status'
            });
        }
    });
    // Health check for admin routes
    app.get('/api/admin/health', (req, res) => {
        res.json({
            success: true,
            message: 'Admin routes are healthy',
            timestamp: new Date().toISOString()
        });
    });
}
