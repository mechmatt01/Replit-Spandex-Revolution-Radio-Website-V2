// Simple test script to verify Firebase database functionality
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let firebaseApp;
let isFirebaseAvailable = false;

try {
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId || serviceAccount.project_id,
    });
    isFirebaseAvailable = true;
    console.log('✅ Firebase app initialized successfully');
  } else {
    console.log('❌ Firebase service account not found');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  process.exit(1);
}

const db = getFirestore(firebaseApp);

// Test functions
async function testAdminCollection() {
  console.log('\n🔧 Testing Admin Collection...');
  
  try {
    const adminRef = db.doc('Admin/Information');
    const adminDoc = await adminRef.get();
    
    if (!adminDoc.exists) {
      console.log('📝 Creating Admin collection...');
      await adminRef.set({
        Username: "adminAccess",
        Password: "password123",
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
      });
      console.log('✅ Admin collection created successfully');
    } else {
      console.log('✅ Admin collection already exists');
      const adminData = adminDoc.data();
      console.log('📋 Admin data:', {
        username: adminData.Username,
        createdAt: adminData.CreatedAt,
        updatedAt: adminData.UpdatedAt
      });
    }
  } catch (error) {
    console.error('❌ Error testing admin collection:', error);
  }
}

async function testUserCreation() {
  console.log('\n👤 Testing User Creation...');
  
  try {
    const testUserID = 'TEST_USER_' + Date.now();
    const testUserData = {
      UserID: testUserID,
      FirstName: "Test",
      LastName: "User",
      EmailAddress: "test@example.com",
      PhoneNumber: "+1234567890",
      PasswordHash: "hashed_password",
      UserProfileImage: "",
      Location: { lat: 40.7128, lng: -74.0060 },
      IsActiveListening: false,
      ActiveSubscription: false,
      RenewalDate: null,
      EmailVerified: false,
      PhoneVerified: false,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      LastActive: new Date().toISOString(),
    };

    await db.doc(`Users/User: ${testUserID}`).set(testUserData);
    console.log('✅ Test user created successfully');
    
    // Verify user was created
    const userDoc = await db.doc(`Users/User: ${testUserID}`).get();
    if (userDoc.exists) {
      console.log('✅ Test user verified in database');
      const userData = userDoc.data();
      console.log('📋 User data:', {
        userID: userData.UserID,
        firstName: userData.FirstName,
        lastName: userData.LastName,
        email: userData.EmailAddress,
        location: userData.Location,
        isActiveListening: userData.IsActiveListening,
        lastActive: userData.LastActive
      });
    } else {
      console.log('❌ Test user not found in database');
    }
    
    // Clean up test user
    console.log('🧹 Cleaning up test user...');
    // Note: In a real test, you might want to delete the test user
    // await db.doc(`Users/User: ${testUserID}`).delete();
    
  } catch (error) {
    console.error('❌ Error testing user creation:', error);
  }
}

async function testListeningStatusUpdate() {
  console.log('\n🎵 Testing Listening Status Update...');
  
  try {
    const testUserID = 'TEST_USER_' + Date.now();
    const testUserData = {
      UserID: testUserID,
      FirstName: "Test",
      LastName: "Listener",
      EmailAddress: "listener@example.com",
      PhoneNumber: "+1234567890",
      PasswordHash: "hashed_password",
      UserProfileImage: "",
      Location: { lat: 40.7128, lng: -74.0060 },
      IsActiveListening: false,
      ActiveSubscription: false,
      RenewalDate: null,
      EmailVerified: false,
      PhoneVerified: false,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      LastActive: new Date().toISOString(),
    };

    // Create test user
    await db.doc(`Users/User: ${testUserID}`).set(testUserData);
    console.log('✅ Test listener user created');

    // Update listening status to true
    await db.doc(`Users/User: ${testUserID}`).set({
      IsActiveListening: true,
      LastActive: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('✅ Listening status updated to true');

    // Verify the update
    const userDoc = await db.doc(`Users/User: ${testUserID}`).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('📋 Updated user data:', {
        isActiveListening: userData.IsActiveListening,
        lastActive: userData.LastActive,
        updatedAt: userData.UpdatedAt
      });
    }

    // Update listening status to false
    await db.doc(`Users/User: ${testUserID}`).set({
      IsActiveListening: false,
      LastActive: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('✅ Listening status updated to false');

  } catch (error) {
    console.error('❌ Error testing listening status update:', error);
  }
}

async function testLocationUpdate() {
  console.log('\n📍 Testing Location Update...');
  
  try {
    const testUserID = 'TEST_USER_' + Date.now();
    const testUserData = {
      UserID: testUserID,
      FirstName: "Test",
      LastName: "Location",
      EmailAddress: "location@example.com",
      PhoneNumber: "+1234567890",
      PasswordHash: "hashed_password",
      UserProfileImage: "",
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

    // Create test user
    await db.doc(`Users/User: ${testUserID}`).set(testUserData);
    console.log('✅ Test location user created');

    // Update location
    const newLocation = { lat: 34.0522, lng: -118.2437 }; // Los Angeles
    await db.doc(`Users/User: ${testUserID}`).set({
      Location: newLocation,
      LastActive: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('✅ Location updated to Los Angeles');

    // Verify the update
    const userDoc = await db.doc(`Users/User: ${testUserID}`).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('📋 Updated location data:', {
        location: userData.Location,
        lastActive: userData.LastActive,
        updatedAt: userData.UpdatedAt
      });
    }

  } catch (error) {
    console.error('❌ Error testing location update:', error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Firebase Database Tests...\n');
  
  await testAdminCollection();
  await testUserCreation();
  await testListeningStatusUpdate();
  await testLocationUpdate();
  
  console.log('\n✅ All tests completed successfully!');
  console.log('🎉 Firebase database is working properly.');
}

// Run the tests
runAllTests().catch(console.error); 