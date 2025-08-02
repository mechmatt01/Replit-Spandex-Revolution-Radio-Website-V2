import {
  users,
  submissions,
  contacts,
  showSchedules,
  pastShows,
  nowPlaying,
  streamStats,
  subscriptions,
  radioStations,
  merchandise,
  settings,
  type User,
  type UpsertUser,
  type RegisterUser,
  type Submission,
  type InsertSubmission,
  type Contact,
  type InsertContact,
  type ShowSchedule,
  type InsertShowSchedule,
  type PastShow,
  type NowPlaying,
  type InsertNowPlaying,
  type StreamStats,
  type Subscription,
  type InsertSubscription,
  type RadioStation,
  type InsertRadioStation,
  type Merchandise,
  type InsertMerchandise,
  type Setting,
  type InsertSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Other operations
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: RegisterUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserLocation(id: string, location: any): Promise<User | undefined>;
  updateListeningStatus(
    id: string,
    isActiveListening: boolean,
  ): Promise<User | undefined>;
  getActiveListeners(): Promise<User[]>;
  verifyEmail(token: string): Promise<User | undefined>;
  verifyPhone(userId: string, code: string): Promise<User | undefined>;
  updatePassword(id: string, hashedPassword: string): Promise<User | undefined>;
  updateStripeInfo(
    id: string,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string,
  ): Promise<User | undefined>;
  getUserSubmissions(userId: string): Promise<Submission[]>;

  // Submissions
  getSubmissions(): Promise<Submission[]>;
  getSubmissionById(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmissionStatus(
    id: number,
    status: string,
  ): Promise<Submission | undefined>;

  // Contacts
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;

  // Show schedules
  getShowSchedules(): Promise<ShowSchedule[]>;
  getActiveShowSchedules(): Promise<ShowSchedule[]>;
  createShowSchedule(schedule: InsertShowSchedule): Promise<ShowSchedule>;
  updateShowSchedule(
    id: number,
    schedule: Partial<InsertShowSchedule>,
  ): Promise<ShowSchedule | undefined>;

  // Past shows
  getPastShows(): Promise<PastShow[]>;

  // Now playing
  getCurrentTrack(): Promise<NowPlaying | undefined>;
  updateNowPlaying(track: InsertNowPlaying): Promise<NowPlaying>;

  // Stream stats
  getStreamStats(): Promise<StreamStats | undefined>;
  updateStreamStats(stats: Partial<StreamStats>): Promise<StreamStats>;

  // Subscriptions
  getSubscriptions(): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;

  // Account deletion
  scheduleUserDeletion(id: string): Promise<User | undefined>;
  deleteUserAccount(id: string): Promise<void>;

  // Radio stations
  getRadioStations(): Promise<RadioStation[]>;
  getActiveRadioStations(): Promise<RadioStation[]>;
  getRadioStationById(id: number): Promise<RadioStation | undefined>;
  getRadioStationByStationId(stationId: string): Promise<RadioStation | undefined>;
  createRadioStation(station: InsertRadioStation): Promise<RadioStation>;
  updateRadioStation(id: number, updates: Partial<InsertRadioStation>): Promise<RadioStation | undefined>;
  deleteRadioStation(id: number): Promise<void>;
  updateStationSortOrder(id: number, sortOrder: number): Promise<RadioStation | undefined>;

  // Merchandise
  getMerchandise(): Promise<Merchandise[]>;
  getActiveMerchandise(): Promise<Merchandise[]>;
  getMerchandiseById(id: number): Promise<Merchandise | undefined>;
  createMerchandise(merch: InsertMerchandise): Promise<Merchandise>;
  updateMerchandise(id: number, updates: Partial<InsertMerchandise>): Promise<Merchandise | undefined>;
  deleteMerchandise(id: number): Promise<void>;

  // Settings
  getSettings(): Promise<Setting[]>;
  getSettingByKey(key: string): Promise<Setting | undefined>;
  upsertSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(key: string, value: string, updatedBy?: string): Promise<Setting | undefined>;

  // User management (admin)
  getAllUsers(): Promise<User[]>;
  updateUserAdminStatus(id: string, isAdmin: boolean): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData as any)
      .onConflictDoUpdate({
        target: users.id,
        set: userData,
      })
      .returning();
    return user;
  }

  // Other operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async updateListeningStatus(
    id: string,
    isActiveListening: boolean,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isActiveListening } as any)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
      })
      .returning();
    return user;
  }

  async updateUser(
    id: string,
    updates: Partial<User>,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserLocation(
    id: string,
    location: any,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        location,
      } as any)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getActiveListeners(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.isActiveListening, true));
  }

  async verifyPhone(userId: string, code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return undefined;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        isPhoneVerified: true,
      } as any)
      .where(eq(users.id, userId))
      .returning();

    return updatedUser || undefined;
  }

  async verifyEmail(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));

    if (!user) {
      return undefined;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        isEmailVerified: true,
        emailVerificationToken: null,
      } as any)
      .where(eq(users.id, user.id))
      .returning();

    return updatedUser || undefined;
  }

  async updatePassword(
    id: string,
    hashedPassword: string,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
      } as any)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateStripeInfo(
    id: string,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
      } as any)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getSubmissions(): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .orderBy(desc(submissions.createdAt));
  }

  async getSubmissionById(id: number): Promise<Submission | undefined> {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, id));
    return submission || undefined;
  }

  async createSubmission(
    insertSubmission: InsertSubmission,
  ): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values(insertSubmission as any)
      .returning();
    return submission;
  }

  async getUserSubmissions(userId: string): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId));
  }

  async updateSubmissionStatus(
    id: number,
    status: string,
  ): Promise<Submission | undefined> {
    const [submission] = await db
      .update(submissions)
      .set({ status } as any)
      .where(eq(submissions.id, id))
      .returning();
    return submission || undefined;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact as any)
      .returning();
    return contact;
  }

  async getShowSchedules(): Promise<ShowSchedule[]> {
    return await db.select().from(showSchedules);
  }

  async getActiveShowSchedules(): Promise<ShowSchedule[]> {
    return await db
      .select()
      .from(showSchedules)
      .where(eq(showSchedules.isActive, true));
  }

  async createShowSchedule(
    insertSchedule: InsertShowSchedule,
  ): Promise<ShowSchedule> {
    const [schedule] = await db
      .insert(showSchedules)
      .values(insertSchedule as any)
      .returning();
    return schedule;
  }

  async updateShowSchedule(
    id: number,
    updateData: Partial<InsertShowSchedule>,
  ): Promise<ShowSchedule | undefined> {
    const [schedule] = await db
      .update(showSchedules)
      .set(updateData)
      .where(eq(showSchedules.id, id))
      .returning();
    return schedule || undefined;
  }

  async getPastShows(): Promise<PastShow[]> {
    return await db.select().from(pastShows);
  }

  async getCurrentTrack(): Promise<NowPlaying | undefined> {
    const [track] = await db
      .select()
      .from(nowPlaying)
      .orderBy(desc(nowPlaying.id))
      .limit(1);
    return track || undefined;
  }

  async updateNowPlaying(track: InsertNowPlaying): Promise<NowPlaying> {
    const existingTrack = await this.getCurrentTrack();
    if (existingTrack) {
      const [updated] = await db
        .update(nowPlaying)
        .set({
          title: track.title,
          artist: track.artist,
          album: track.album,
          artwork: track.artwork,
          isAd: track.isAd,
          duration: track.duration,
          currentTime: track.currentTime,
          isLive: track.isLive,
          updatedAt: new Date(),
        } as any)
        .where(eq(nowPlaying.id, existingTrack.id))
        .returning();
      return updated;
    } else {
      const [newTrack] = await db.insert(nowPlaying).values({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.artwork,
        isAd: track.isAd,
        duration: track.duration,
        currentTime: track.currentTime,
        isLive: track.isLive,
      } as any).returning();
      return newTrack;
    }
  }

  async getStreamStats(): Promise<StreamStats | undefined> {
    const [stats] = await db
      .select()
      .from(streamStats)
      .orderBy(desc(streamStats.id))
      .limit(1);
    return stats || undefined;
  }

  async updateStreamStats(stats: Partial<StreamStats>): Promise<StreamStats> {
    const existingStats = await this.getStreamStats();
    if (existingStats) {
      const [updatedStats] = await db
        .update(streamStats)
        .set(stats)
        .where(eq(streamStats.id, existingStats.id))
        .returning();
      return updatedStats;
    } else {
      const [newStats] = await db
        .insert(streamStats)
        .values(stats as any)
        .returning();
      return newStats;
    }
  }

  async getSubscriptions(): Promise<Subscription[]> {
    return await db
      .select()
      .from(subscriptions)
      .orderBy(desc(subscriptions.createdAt));
  }

  async createSubscription(
    insertSubscription: InsertSubscription,
  ): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(insertSubscription as any)
      .returning();
    return subscription;
  }

  async scheduleUserDeletion(id: string): Promise<User | undefined> {
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30); // Schedule deletion 30 days from now

    const [user] = await db
      .update(users)
      .set({
        accountDeletionScheduled: true,
        accountDeletionDate: deletionDate,
      } as any)
      .where(eq(users.id, id))
      .returning();

    return user || undefined;
  }

  async deleteUserAccount(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Radio stations
  async getRadioStations(): Promise<RadioStation[]> {
    return await db.select().from(radioStations).orderBy(radioStations.sortOrder);
  }

  async getActiveRadioStations(): Promise<RadioStation[]> {
    return await db.select().from(radioStations).where(eq(radioStations.isActive, true)).orderBy(radioStations.sortOrder);
  }

  async getRadioStationById(id: number): Promise<RadioStation | undefined> {
    const [station] = await db.select().from(radioStations).where(eq(radioStations.id, id));
    return station;
  }

  async getRadioStationByStationId(stationId: string): Promise<RadioStation | undefined> {
    const [station] = await db.select().from(radioStations).where(eq(radioStations.stationId, stationId));
    return station;
  }

  async createRadioStation(insertStation: InsertRadioStation): Promise<RadioStation> {
    const [station] = await db.insert(radioStations).values(insertStation as any).returning();
    return station;
  }

  async updateRadioStation(id: number, updates: Partial<InsertRadioStation>): Promise<RadioStation | undefined> {
    const [station] = await db.update(radioStations)
      .set(updates)
      .where(eq(radioStations.id, id))
      .returning();
    return station;
  }

  async deleteRadioStation(id: number): Promise<void> {
    await db.delete(radioStations).where(eq(radioStations.id, id));
  }

  async updateStationSortOrder(id: number, sortOrder: number): Promise<RadioStation | undefined> {
    const [station] = await db.update(radioStations)
      .set({
        sortOrder: sortOrder,
      } as any)
      .where(eq(radioStations.id, id))
      .returning();
    return station;
  }

  // Merchandise
  async getMerchandise(): Promise<Merchandise[]> {
    return await db.select().from(merchandise).orderBy(merchandise.name);
  }

  async getActiveMerchandise(): Promise<Merchandise[]> {
    return await db.select().from(merchandise).where(eq(merchandise.isActive, true)).orderBy(merchandise.name);
  }

  async getMerchandiseById(id: number): Promise<Merchandise | undefined> {
    const [merch] = await db.select().from(merchandise).where(eq(merchandise.id, id));
    return merch;
  }

  async createMerchandise(insertMerch: InsertMerchandise): Promise<Merchandise> {
    const [merch] = await db.insert(merchandise).values(insertMerch as any).returning();
    return merch;
  }

  async updateMerchandise(id: number, updates: Partial<InsertMerchandise>): Promise<Merchandise | undefined> {
    const [merch] = await db.update(merchandise)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(merchandise.id, id))
      .returning();
    return merch;
  }

  async deleteMerchandise(id: number): Promise<void> {
    await db.delete(merchandise).where(eq(merchandise.id, id));
  }

  // Settings
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings).orderBy(settings.key);
  }

  async getSettingByKey(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async upsertSetting(insertSetting: InsertSetting): Promise<Setting> {
    const [setting] = await db
      .insert(settings)
      .values({ ...insertSetting, updatedAt: new Date() } as any)
      .onConflictDoUpdate({
        target: settings.key,
        set: { 
          value: insertSetting.value,
          description: insertSetting.description,
          updatedBy: insertSetting.updatedBy,
          updatedAt: new Date()
        },
      })
      .returning();
    return setting;
  }

  async updateSetting(key: string, value: string, updatedBy?: string): Promise<Setting | undefined> {
    const [setting] = await db.update(settings)
      .set({ 
        value,
        updatedBy,
        updatedAt: new Date()
      } as any)
      .where(eq(settings.key, key))
      .returning();
    return setting;
  }

  // User management (admin)
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserAdminStatus(id: string, isAdmin: boolean): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        isAdmin,
        updatedAt: new Date()
      } as any)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

export const storage = new DatabaseStorage();
