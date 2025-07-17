import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, '..', 'firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();

async function initializeFirebaseData() {
  console.log('Initializing Firebase data...');
  
  // Initialize radio stations
  const radioStations = [
    {
      stationId: 'kbfb-955',
      name: '95.5 The Beat',
      frequency: '95.5 FM',
      description: 'Dallas Hip Hop & R&B',
      streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KBFBFMAAC.aac',
      location: 'Dallas, TX',
      isActive: true,
      sortOrder: 1,
      website: 'https://955thebeat.com',
      genre: 'Hip Hop',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      stationId: 'hot97',
      name: 'Hot 97',
      frequency: '97.1 FM',
      description: 'New York Hip Hop & R&B',
      streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTAAC.aac',
      location: 'New York, NY',
      isActive: true,
      sortOrder: 2,
      website: 'https://hot97.com',
      genre: 'Hip Hop',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      stationId: 'power106',
      name: 'Power 106',
      frequency: '105.9 FM',
      description: 'Los Angeles Hip Hop & R&B',
      streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KPWRAAC.aac',
      location: 'Los Angeles, CA',
      isActive: true,
      sortOrder: 3,
      website: 'https://power106.com',
      genre: 'Hip Hop',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      stationId: 'somafm-metal',
      name: 'SomaFM Metal',
      frequency: 'Online',
      description: 'Heavy Metal & Hard Rock',
      streamUrl: 'https://ice1.somafm.com/metal-128-mp3',
      location: 'San Francisco, CA',
      isActive: true,
      sortOrder: 4,
      website: 'https://somafm.com/metal',
      genre: 'Metal',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
  ];

  // Add radio stations
  for (const station of radioStations) {
    await db.collection('radioStations').add(station);
    console.log(`Added station: ${station.name}`);
  }

  // Initialize stream stats
  const streamStats = {
    currentListeners: 125,
    totalListeners: 2847,
    peakListeners: 1834,
    uptime: 99.8,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  };

  await db.collection('streamStats').add(streamStats);
  console.log('Stream stats initialized');

  // Initialize show schedules
  const showSchedules = [
    {
      title: 'The Morning Rebellion',
      host: 'Jake Steel',
      dayOfWeek: 'Monday',
      startTime: '08:00',
      endTime: '10:00',
      description: 'Start your week with classic heavy metal',
      isActive: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      title: 'Midnight Mayhem',
      host: 'Sarah Thunder',
      dayOfWeek: 'Friday',
      startTime: '23:00',
      endTime: '01:00',
      description: 'The heaviest metal to end your week',
      isActive: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
  ];

  for (const schedule of showSchedules) {
    await db.collection('showSchedules').add(schedule);
    console.log(`Added show: ${schedule.title}`);
  }

  console.log('Firebase initialization complete!');
}

initializeFirebaseData().catch(console.error);