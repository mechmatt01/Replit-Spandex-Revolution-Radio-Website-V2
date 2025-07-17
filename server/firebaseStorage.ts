import { db } from "./firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import type { IStorage } from "./storage";
import type {
  User,
  InsertUser,
  Submission,
  InsertSubmission,
  Contact,
  InsertContact,
  ShowSchedule,
  InsertShowSchedule,
  PastShow,
  InsertPastShow,
  NowPlaying,
  InsertNowPlaying,
  StreamStats,
  InsertStreamStats,
  Subscription,
  InsertSubscription,
} from "@shared/schema";

export class FirebaseStorage implements IStorage {
  // Users
  async getUsers(): Promise<User[]> {
    const snapshot = await db.collection("users").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
  }

  async getUserById(id: string): Promise<User | undefined> {
    const userDoc = await db.collection("users").doc(id).get();
    if (userDoc.exists) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const snapshot = await db.collection("users").where("email", "==", email).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const docRef = await db.collection("users").add({
      ...user,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    const newUser = await this.getUserById(docRef.id);
    return newUser!;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    await db.collection("users").doc(id).update({
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<void> {
    await db.collection("users").doc(id).delete();
  }

  // Additional user methods required by IStorage interface
  async getUser(id: string): Promise<User | undefined> {
    return this.getUserById(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const snapshot = await db.collection("users").where("username", "==", username).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const snapshot = await db.collection("users").where("googleId", "==", googleId).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return undefined;
  }

  async upsertUser(user: any): Promise<User> {
    const existingUser = await this.getUserById(user.id);
    if (existingUser) {
      return await this.updateUser(user.id, user) || existingUser;
    }
    return await this.createUser(user);
  }

  async updateUserLocation(id: string, location: any): Promise<User | undefined> {
    await db.collection("users").doc(id).update({
      location,
      updatedAt: Timestamp.now(),
    });
    return this.getUserById(id);
  }

  async updateListeningStatus(id: string, isActiveListening: boolean): Promise<User | undefined> {
    await db.collection("users").doc(id).update({
      isActiveListening,
      updatedAt: Timestamp.now(),
    });
    return this.getUserById(id);
  }

  async getActiveListeners(): Promise<User[]> {
    const snapshot = await db.collection("users").where("isActiveListening", "==", true).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
  }

  async verifyEmail(token: string): Promise<User | undefined> {
    const snapshot = await db.collection("users").where("emailVerificationToken", "==", token).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await db.collection("users").doc(doc.id).update({
        emailVerified: true,
        emailVerificationToken: null,
        updatedAt: Timestamp.now(),
      });
      return this.getUserById(doc.id);
    }
    return undefined;
  }

  async verifyPhone(userId: string, code: string): Promise<User | undefined> {
    const user = await this.getUserById(userId);
    if (user && user.phoneVerificationCode === code) {
      await db.collection("users").doc(userId).update({
        phoneVerified: true,
        phoneVerificationCode: null,
        updatedAt: Timestamp.now(),
      });
      return this.getUserById(userId);
    }
    return undefined;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User | undefined> {
    await db.collection("users").doc(id).update({
      password: hashedPassword,
      updatedAt: Timestamp.now(),
    });
    return this.getUserById(id);
  }

  async updateStripeInfo(
    id: string,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string
  ): Promise<User | undefined> {
    const updates: any = { updatedAt: Timestamp.now() };
    if (stripeCustomerId) updates.stripeCustomerId = stripeCustomerId;
    if (stripeSubscriptionId) updates.stripeSubscriptionId = stripeSubscriptionId;
    
    await db.collection("users").doc(id).update(updates);
    return this.getUserById(id);
  }

  async getUserSubmissions(userId: string): Promise<Submission[]> {
    const snapshot = await db.collection("submissions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Submission));
  }

  // Submissions
  async getSubmissions(): Promise<Submission[]> {
    const snapshot = await db.collection("submissions").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Submission));
  }

  async getSubmissionById(id: string): Promise<Submission | undefined> {
    const submissionDoc = await db.collection("submissions").doc(id).get();
    if (submissionDoc.exists) {
      return { id: submissionDoc.id, ...submissionDoc.data() } as Submission;
    }
    return undefined;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const docRef = await db.collection("submissions").add({
      ...submission,
      createdAt: Timestamp.now(),
    });
    const newSubmission = await this.getSubmissionById(docRef.id);
    return newSubmission!;
  }

  async updateSubmission(id: string, updates: Partial<InsertSubmission>): Promise<Submission | undefined> {
    await db.collection("submissions").doc(id).update(updates);
    return this.getSubmissionById(id);
  }

  async deleteSubmission(id: string): Promise<void> {
    await db.collection("submissions").doc(id).delete();
  }

  async updateSubmissionStatus(id: number, status: string): Promise<Submission | undefined> {
    const idStr = id.toString();
    await db.collection("submissions").doc(idStr).update({
      status,
      updatedAt: Timestamp.now(),
    });
    return this.getSubmissionById(idStr);
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    const snapshot = await db.collection("contacts").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Contact));
  }

  async getContactById(id: string): Promise<Contact | undefined> {
    const contactDoc = await db.collection("contacts").doc(id).get();
    if (contactDoc.exists) {
      return { id: contactDoc.id, ...contactDoc.data() } as Contact;
    }
    return undefined;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const docRef = await db.collection("contacts").add({
      ...contact,
      createdAt: Timestamp.now(),
    });
    const newContact = await this.getContactById(docRef.id);
    return newContact!;
  }

  async deleteContact(id: string): Promise<void> {
    await db.collection("contacts").doc(id).delete();
  }

  // Show Schedules
  async getShowSchedules(): Promise<ShowSchedule[]> {
    const snapshot = await db.collection("showSchedules").orderBy("dayOfWeek").orderBy("startTime").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ShowSchedule));
  }

  async getShowScheduleById(id: string): Promise<ShowSchedule | undefined> {
    const scheduleDoc = await db.collection("showSchedules").doc(id).get();
    if (scheduleDoc.exists) {
      return { id: scheduleDoc.id, ...scheduleDoc.data() } as ShowSchedule;
    }
    return undefined;
  }

  async createShowSchedule(schedule: InsertShowSchedule): Promise<ShowSchedule> {
    const docRef = await db.collection("showSchedules").add(schedule);
    const newSchedule = await this.getShowScheduleById(docRef.id);
    return newSchedule!;
  }

  async updateShowSchedule(id: string, updates: Partial<InsertShowSchedule>): Promise<ShowSchedule | undefined> {
    await db.collection("showSchedules").doc(id).update(updates);
    return this.getShowScheduleById(id);
  }

  async deleteShowSchedule(id: string): Promise<void> {
    await db.collection("showSchedules").doc(id).delete();
  }

  async getActiveShowSchedules(): Promise<ShowSchedule[]> {
    const now = new Date();
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    const snapshot = await db.collection("showSchedules")
      .where("dayOfWeek", "==", dayOfWeek)
      .get();
    
    // Filter by time
    const schedules = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ShowSchedule));
    return schedules.filter(schedule => {
      return schedule.startTime <= currentTime && schedule.endTime >= currentTime;
    });
  }

  // Past Shows
  async getPastShows(): Promise<PastShow[]> {
    const snapshot = await db.collection("pastShows").orderBy("date", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PastShow));
  }

  async getPastShowById(id: string): Promise<PastShow | undefined> {
    const pastShowDoc = await db.collection("pastShows").doc(id).get();
    if (pastShowDoc.exists) {
      return { id: pastShowDoc.id, ...pastShowDoc.data() } as PastShow;
    }
    return undefined;
  }

  async createPastShow(pastShow: InsertPastShow): Promise<PastShow> {
    const docRef = await db.collection("pastShows").add(pastShow);
    const newPastShow = await this.getPastShowById(docRef.id);
    return newPastShow!;
  }

  async updatePastShow(id: string, updates: Partial<InsertPastShow>): Promise<PastShow | undefined> {
    await db.collection("pastShows").doc(id).update(updates);
    return this.getPastShowById(id);
  }

  async deletePastShow(id: string): Promise<void> {
    await db.collection("pastShows").doc(id).delete();
  }

  // Now Playing
  async getNowPlaying(): Promise<NowPlaying[]> {
    const snapshot = await db.collection("nowPlaying").orderBy("timestamp", "desc").limit(1).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as NowPlaying));
  }

  async createNowPlaying(nowPlaying: InsertNowPlaying): Promise<NowPlaying> {
    const docRef = await db.collection("nowPlaying").add({
      ...nowPlaying,
      timestamp: Timestamp.now(),
    });
    const newNowPlayingDoc = await docRef.get();
    return { id: docRef.id, ...newNowPlayingDoc.data() } as NowPlaying;
  }

  // Stream Stats
  async getStreamStats(): Promise<StreamStats[]> {
    const snapshot = await db.collection("streamStats").orderBy("timestamp", "desc").limit(1).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StreamStats));
  }

  async createStreamStats(stats: InsertStreamStats): Promise<StreamStats> {
    const docRef = await db.collection("streamStats").add({
      ...stats,
      timestamp: Timestamp.now(),
    });
    const newStatsDoc = await docRef.get();
    return { id: docRef.id, ...newStatsDoc.data() } as StreamStats;
  }

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    const snapshot = await db.collection("subscriptions").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Subscription));
  }

  async getSubscriptionById(id: string): Promise<Subscription | undefined> {
    const subscriptionDoc = await db.collection("subscriptions").doc(id).get();
    if (subscriptionDoc.exists) {
      return { id: subscriptionDoc.id, ...subscriptionDoc.data() } as Subscription;
    }
    return undefined;
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    const snapshot = await db.collection("subscriptions").where("userId", "==", userId).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Subscription;
    }
    return undefined;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const docRef = await db.collection("subscriptions").add({
      ...subscription,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    const newSubscription = await this.getSubscriptionById(docRef.id);
    return newSubscription!;
  }

  async updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    await db.collection("subscriptions").doc(id).update({
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return this.getSubscriptionById(id);
  }

  async deleteSubscription(id: string): Promise<void> {
    await db.collection("subscriptions").doc(id).delete();
  }

  // Now Playing methods
  async getCurrentTrack(): Promise<NowPlaying | undefined> {
    const snapshot = await db.collection("nowPlaying")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as NowPlaying;
    }
    return undefined;
  }

  async updateNowPlaying(track: InsertNowPlaying): Promise<NowPlaying> {
    const trackData = {
      ...track,
      createdAt: Timestamp.now(),
    };
    const docRef = await db.collection("nowPlaying").add(trackData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as NowPlaying;
  }

  // Stream Stats methods
  async getStreamStats(): Promise<StreamStats | undefined> {
    const snapshot = await db.collection("streamStats")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as StreamStats;
    }
    return undefined;
  }

  async updateStreamStats(stats: Partial<StreamStats>): Promise<StreamStats> {
    const currentStats = await this.getStreamStats();
    
    if (currentStats && currentStats.id) {
      await db.collection("streamStats").doc(currentStats.id).update({
        ...stats,
        updatedAt: Timestamp.now(),
      });
      const doc = await db.collection("streamStats").doc(currentStats.id).get();
      return { id: doc.id, ...doc.data() } as StreamStats;
    } else {
      const docRef = await db.collection("streamStats").add({
        ...stats,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() } as StreamStats;
    }
  }

  // Account deletion methods
  async scheduleUserDeletion(id: string): Promise<User | undefined> {
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30); // 30 days from now
    
    await db.collection("users").doc(id).update({
      scheduledDeletion: Timestamp.fromDate(deletionDate),
      updatedAt: Timestamp.now(),
    });
    return this.getUserById(id);
  }

  async deleteUserAccount(id: string): Promise<void> {
    // Delete user's submissions
    const submissions = await db.collection("submissions").where("userId", "==", id).get();
    const batch = db.batch();
    submissions.docs.forEach(doc => batch.delete(doc.ref));
    
    // Delete user's subscriptions
    const subscriptions = await db.collection("subscriptions").where("userId", "==", id).get();
    subscriptions.docs.forEach(doc => batch.delete(doc.ref));
    
    // Delete user
    batch.delete(db.collection("users").doc(id));
    
    await batch.commit();
  }

  // Radio station methods (stub implementations for now)
  async getRadioStations(): Promise<RadioStation[]> {
    const snapshot = await db.collection("radioStations").orderBy("sortOrder", "asc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RadioStation));
  }

  async getActiveRadioStations(): Promise<RadioStation[]> {
    const snapshot = await db.collection("radioStations")
      .where("isActive", "==", true)
      .orderBy("sortOrder", "asc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RadioStation));
  }

  async getRadioStationById(id: number): Promise<RadioStation | undefined> {
    const doc = await db.collection("radioStations").doc(id.toString()).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() } as RadioStation;
    }
    return undefined;
  }

  async getRadioStationByStationId(stationId: string): Promise<RadioStation | undefined> {
    const snapshot = await db.collection("radioStations").where("stationId", "==", stationId).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as RadioStation;
    }
    return undefined;
  }

  async createRadioStation(station: InsertRadioStation): Promise<RadioStation> {
    const stationData = {
      ...station,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await db.collection("radioStations").add(stationData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as RadioStation;
  }

  async updateRadioStation(id: number, updates: Partial<InsertRadioStation>): Promise<RadioStation | undefined> {
    await db.collection("radioStations").doc(id.toString()).update({
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return this.getRadioStationById(id);
  }

  async deleteRadioStation(id: number): Promise<void> {
    await db.collection("radioStations").doc(id.toString()).delete();
  }

  async updateStationSortOrder(id: number, sortOrder: number): Promise<RadioStation | undefined> {
    await db.collection("radioStations").doc(id.toString()).update({
      sortOrder,
      updatedAt: Timestamp.now(),
    });
    return this.getRadioStationById(id);
  }

  // Initialize default radio stations
  async initializeDefaultStations(): Promise<void> {
    const defaultStations = [
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
      },
    ];

    try {
      // Check if stations already exist
      const existingStations = await this.getRadioStations();
      
      if (existingStations.length === 0) {
        // Initialize with default stations
        for (const station of defaultStations) {
          await this.createRadioStation(station);
        }
        console.log('Default radio stations initialized in Firebase');
      } else {
        console.log(`Found ${existingStations.length} existing radio stations in Firebase`);
      }
    } catch (error) {
      console.error('Error initializing radio stations:', error);
      throw error;
    }
  }
}

export const firebaseStorage = new FirebaseStorage();