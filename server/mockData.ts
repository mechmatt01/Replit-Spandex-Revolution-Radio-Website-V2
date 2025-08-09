import { firestore } from './firebase'

// Mock data structure for testing
export interface MockActiveListener {
  id: string
  userId: string
  username: string
  location: {
    country: string
    city: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  genre: string
  isActive: boolean
  lastSeen: string
  listeningTime: number
  avatar: string
}

export interface MockUserStatistic {
  id: string
  userId: string
  username: string
  email: string
  location: {
    country: string
    city: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  subscriptionTier: string
  isActive: boolean
  joinDate: string
  totalListeningTime: number
  favoriteGenre: string
  avatar: string
}

export interface MockRadioStation {
  id: string
  name: string
  url: string
  genre: string
  country: string
  language: string
  bitrate: number
  isActive: boolean
  listeners: number
  createdAt: string
}

// Generate comprehensive mock data
export function generateMockActiveListeners(count: number = 75): MockActiveListener[] {
  const mockListeners: MockActiveListener[] = []
  const countries = ['US', 'CA', 'UK', 'DE', 'FR', 'JP', 'AU', 'BR', 'IN', 'MX', 'SE', 'NO', 'DK', 'NL', 'BE', 'CH', 'AT', 'IT', 'ES', 'PT']
  const cities = [
    'New York', 'Toronto', 'London', 'Berlin', 'Paris', 'Tokyo', 'Sydney', 'São Paulo', 'Mumbai', 'Mexico City',
    'Stockholm', 'Oslo', 'Copenhagen', 'Amsterdam', 'Brussels', 'Zurich', 'Vienna', 'Rome', 'Madrid', 'Lisbon'
  ]
  const genres = ['Metal', 'Rock', 'Punk', 'Hardcore', 'Thrash', 'Death Metal', 'Black Metal', 'Progressive Metal', 'Power Metal', 'Folk Metal']
  const avatars = [
    'Metal-Bear-Bassist.png', 'Metal-Drummer-Cat.png', 'Metal-Skull-Guitarist.png', 'Metal-Wolf-Singer.png',
    'Rock-Owl-Guitarist.png', 'Bass-Bat.jpeg', 'Drum-Dragon.jpeg', 'Guitar-Goblin.jpeg', 'Headbanger-Hamster.jpeg'
  ]
  
  for (let i = 0; i < count; i++) {
    const country = countries[Math.floor(Math.random() * countries.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const genre = genres[Math.floor(Math.random() * genres.length)]
    const avatar = avatars[Math.floor(Math.random() * avatars.length)]
    const isActive = Math.random() > 0.3 // 70% chance of being active
    
    mockListeners.push({
      id: `mock-listener-${i}`,
      userId: `user-${Math.random().toString(36).substr(2, 9)}`,
      username: `MetalHead${Math.floor(Math.random() * 9999)}`,
      location: {
        country,
        city,
        coordinates: {
          lat: (Math.random() - 0.5) * 180,
          lng: (Math.random() - 0.5) * 360
        }
      },
      genre,
      isActive,
      lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      listeningTime: Math.floor(Math.random() * 120), // 0-120 minutes
      avatar
    })
  }
  
  return mockListeners
}

export function generateMockUserStatistics(count: number = 50): MockUserStatistic[] {
  const mockStats: MockUserStatistic[] = []
  const countries = ['US', 'CA', 'UK', 'DE', 'FR', 'JP', 'AU', 'BR', 'IN', 'MX', 'SE', 'NO', 'DK', 'NL', 'BE', 'CH', 'AT', 'IT', 'ES', 'PT']
  const subscriptionTiers = ['Free', 'Basic', 'Premium', 'Legend', 'Rebel']
  const avatars = [
    'Metal-Bear-Bassist.png', 'Metal-Drummer-Cat.png', 'Metal-Skull-Guitarist.png', 'Metal-Wolf-Singer.png',
    'Rock-Owl-Guitarist.png', 'Bass-Bat.jpeg', 'Drum-Dragon.jpeg', 'Guitar-Goblin.jpeg', 'Headbanger-Hamster.jpeg'
  ]
  
  for (let i = 0; i < count; i++) {
    const country = countries[Math.floor(Math.random() * countries.length)]
    const tier = subscriptionTiers[Math.floor(Math.random() * subscriptionTiers.length)]
    const avatar = avatars[Math.floor(Math.random() * avatars.length)]
    const isActive = Math.random() > 0.2 // 80% chance of being active
    
    mockStats.push({
      id: `mock-user-${i}`,
      userId: `user-${Math.random().toString(36).substr(2, 9)}`,
      username: `User${Math.floor(Math.random() * 9999)}`,
      email: `user${i}@example.com`,
      location: {
        country,
        city: `City${i}`,
        coordinates: {
          lat: (Math.random() - 0.5) * 180,
          lng: (Math.random() - 0.5) * 360
        }
      },
      subscriptionTier: tier,
      isActive,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      totalListeningTime: Math.floor(Math.random() * 1000), // 0-1000 hours
      favoriteGenre: ['Metal', 'Rock', 'Punk'][Math.floor(Math.random() * 3)],
      avatar
    })
  }
  
  return mockStats
}

export function generateMockRadioStations(count: number = 25): MockRadioStation[] {
  const mockStations: MockRadioStation[] = []
  const genres = ['Metal', 'Rock', 'Punk', 'Hardcore', 'Thrash', 'Death Metal', 'Black Metal', 'Progressive Metal', 'Power Metal', 'Folk Metal']
  const countries = ['US', 'CA', 'UK', 'DE', 'FR', 'JP', 'AU', 'BR', 'IN', 'MX', 'SE', 'NO', 'DK', 'NL', 'BE', 'CH', 'AT', 'IT', 'ES', 'PT']
  const languages = ['English', 'German', 'French', 'Spanish', 'Portuguese', 'Japanese', 'Swedish', 'Norwegian', 'Danish', 'Dutch', 'Italian']
  
  for (let i = 0; i < count; i++) {
    const genre = genres[Math.floor(Math.random() * genres.length)]
    const country = countries[Math.floor(Math.random() * countries.length)]
    const language = languages[Math.floor(Math.random() * languages.length)]
    
    mockStations.push({
      id: `mock-station-${i}`,
      name: `${genre} Radio ${i + 1}`,
      url: `https://mock-${genre.toLowerCase()}-${i}.stream`,
      genre,
      country,
      language,
      bitrate: [128, 192, 256, 320][Math.floor(Math.random() * 4)],
      isActive: Math.random() > 0.2, // 80% chance of being active
      listeners: Math.floor(Math.random() * 1000),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  return mockStations
}

// Push mock data to Firebase for testing
export async function pushMockDataToFirebase() {
  try {
    const db = firestore
    
    // Generate mock data
    const mockListeners = generateMockActiveListeners(75)
    const mockUsers = generateMockUserStatistics(50)
    const mockStations = generateMockRadioStations(25)
    
    // Push to Firebase with "Test Data" prefix
    const batch = db.batch()
    
    // Push active listeners
    mockListeners.forEach((listener, index) => {
      const docRef = db.collection('Test Data').doc(`User: ${listener.userId}`).collection('Active Listeners').doc(`listener-${index}`)
      batch.set(docRef, listener)
    })
    
    // Push user statistics
    mockUsers.forEach((user, index) => {
      const docRef = db.collection('Test Data').doc(`User: ${user.userId}`).collection('User Statistics').doc(`user-${index}`)
      batch.set(docRef, user)
    })
    
    // Push radio stations
    mockStations.forEach((station, index) => {
      const docRef = db.collection('Test Data').doc('Radio Stations').collection('Stations').doc(`station-${index}`)
      batch.set(docRef, station)
    })
    
    await batch.commit()
    console.log('Mock data successfully pushed to Firebase')
    return true
  } catch (error) {
    console.error('Error pushing mock data to Firebase:', error)
    return false
  }
}

// Get real Firebase data
export async function getActiveListenersFromFirebase(): Promise<MockActiveListener[]> {
  try {
    const db = firestore
    const listenersRef = db.collection('activeListeners')
    const snapshot = await listenersRef.get()
    
    if (snapshot.empty) {
      return []
    }
    
    const listeners: MockActiveListener[] = []
    snapshot.forEach(doc => {
      listeners.push({
        id: doc.id,
        ...doc.data()
      } as MockActiveListener)
    })
    
    return listeners
  } catch (error) {
    console.error('Error fetching active listeners from Firebase:', error)
    return []
  }
}

export async function getUserStatisticsFromFirebase(): Promise<MockUserStatistic[]> {
  try {
    const db = firestore
    const usersRef = db.collection('users')
    const snapshot = await usersRef.get()
    
    if (snapshot.empty) {
      return []
    }
    
    const users: MockUserStatistic[] = []
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      } as MockUserStatistic)
    })
    
    return users
  } catch (error) {
    console.error('Error fetching user statistics from Firebase:', error)
    return []
  }
}

export async function getRadioStationsFromFirebase(): Promise<MockRadioStation[]> {
  try {
    const db = firestore
    const stationsRef = db.collection('radioStations')
    const snapshot = await stationsRef.get()
    
    if (snapshot.empty) {
      return []
    }
    
    const stations: MockRadioStation[] = []
    snapshot.forEach(doc => {
      stations.push({
        id: doc.id,
        ...doc.data()
      } as MockRadioStation)
    })
    
    return stations
  } catch (error) {
    console.error('Error fetching radio stations from Firebase:', error)
    return []
  }
}
