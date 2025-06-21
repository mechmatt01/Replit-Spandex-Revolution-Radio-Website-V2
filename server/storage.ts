import { 
  User, InsertUser, RegisterUser, LoginUser, UpsertUser,
  Submission, InsertSubmission,
  Contact, InsertContact,
  ShowSchedule, InsertShowSchedule,
  PastShow,
  NowPlaying, InsertNowPlaying,
  StreamStats,
  Subscription, InsertSubscription,
  users, submissions, contacts, showSchedules, pastShows, nowPlaying, streamStats, subscriptions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: RegisterUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  verifyEmail(token: string): Promise<User | undefined>;
  updatePassword(id: number, hashedPassword: string): Promise<User | undefined>;
  updateStripeInfo(id: number, stripeCustomerId?: string, stripeSubscriptionId?: string): Promise<User | undefined>;
  getUserSubmissions(userId: number): Promise<Submission[]>;
  
  // Submissions
  getSubmissions(): Promise<Submission[]>;
  getSubmissionById(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmissionStatus(id: number, status: string): Promise<Submission | undefined>;
  
  // Contacts
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  
  // Show schedules
  getShowSchedules(): Promise<ShowSchedule[]>;
  getActiveShowSchedules(): Promise<ShowSchedule[]>;
  createShowSchedule(schedule: InsertShowSchedule): Promise<ShowSchedule>;
  updateShowSchedule(id: number, schedule: Partial<InsertShowSchedule>): Promise<ShowSchedule | undefined>;
  
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
  scheduleUserDeletion(id: number): Promise<User | undefined>;
  deleteUserAccount(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async createUser(userData: RegisterUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First try to find existing user by email or Google ID
    let existingUser;
    if (userData.email) {
      existingUser = await this.getUserByEmail(userData.email);
    }
    if (!existingUser && userData.googleId) {
      existingUser = await this.getUserByGoogleId(userData.googleId);
    }

    if (existingUser) {
      // Update existing user
      const [user] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return user;
    } else {
      // Create new user
      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      return user;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async verifyEmail(token: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        isEmailVerified: true, 
        emailVerificationToken: null,
        updatedAt: new Date()
      })
      .where(eq(users.emailVerificationToken, token))
      .returning();
    return user;
  }

  async updatePassword(id: number, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateStripeInfo(id: number, stripeCustomerId?: string, stripeSubscriptionId?: string): Promise<User | undefined> {
    const updates: Partial<User> = { updatedAt: new Date() };
    if (stripeCustomerId) updates.stripeCustomerId = stripeCustomerId;
    if (stripeSubscriptionId) updates.stripeSubscriptionId = stripeSubscriptionId;
    
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Submissions
  async getSubmissions(): Promise<Submission[]> {
    return await db.select().from(submissions).orderBy(desc(submissions.createdAt));
  }

  async getSubmissionById(id: number): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission || undefined;
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async getUserSubmissions(userId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.userId, userId));
  }

  async updateSubmissionStatus(id: number, status: string): Promise<Submission | undefined> {
    const [submission] = await db
      .update(submissions)
      .set({ status })
      .where(eq(submissions.id, id))
      .returning();
    return submission || undefined;
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  // Show schedules
  async getShowSchedules(): Promise<ShowSchedule[]> {
    return await db.select().from(showSchedules);
  }

  async getActiveShowSchedules(): Promise<ShowSchedule[]> {
    return await db.select().from(showSchedules).where(eq(showSchedules.isActive, true));
  }

  async createShowSchedule(insertSchedule: InsertShowSchedule): Promise<ShowSchedule> {
    const [schedule] = await db
      .insert(showSchedules)
      .values(insertSchedule)
      .returning();
    return schedule;
  }

  async updateShowSchedule(id: number, updateData: Partial<InsertShowSchedule>): Promise<ShowSchedule | undefined> {
    const [schedule] = await db
      .update(showSchedules)
      .set(updateData)
      .where(eq(showSchedules.id, id))
      .returning();
    return schedule || undefined;
  }

  // Past shows
  async getPastShows(): Promise<PastShow[]> {
    return await db.select().from(pastShows).orderBy(desc(pastShows.date));
  }

  // Now playing
  async getCurrentTrack(): Promise<NowPlaying | undefined> {
    const [track] = await db.select().from(nowPlaying).orderBy(desc(nowPlaying.updatedAt)).limit(1);
    return track || undefined;
  }

  async updateNowPlaying(track: InsertNowPlaying): Promise<NowPlaying> {
    // First, try to update the existing record
    const existing = await this.getCurrentTrack();
    if (existing) {
      const [updated] = await db
        .update(nowPlaying)
        .set({ ...track, updatedAt: new Date() })
        .where(eq(nowPlaying.id, existing.id))
        .returning();
      return updated;
    } else {
      // If no existing record, create a new one
      const [created] = await db
        .insert(nowPlaying)
        .values(track)
        .returning();
      return created;
    }
  }

  // Stream stats
  async getStreamStats(): Promise<StreamStats | undefined> {
    const [stats] = await db.select().from(streamStats).orderBy(desc(streamStats.updatedAt)).limit(1);
    return stats || undefined;
  }

  async updateStreamStats(stats: Partial<StreamStats>): Promise<StreamStats> {
    // First, try to update the existing record
    const existing = await this.getStreamStats();
    if (existing) {
      const [updated] = await db
        .update(streamStats)
        .set({ ...stats, updatedAt: new Date() })
        .where(eq(streamStats.id, existing.id))
        .returning();
      return updated;
    } else {
      // If no existing record, create a new one
      const [created] = await db
        .insert(streamStats)
        .values({
          currentListeners: 0,
          totalListeners: 0,
          countries: 0,
          uptime: "99.9%",
          ...stats
        })
        .returning();
      return created;
    }
  }

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }

  async scheduleUserDeletion(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    // Calculate deletion date based on subscription renewal
    let deletionDate = new Date();
    if (user.subscriptionStatus === 'active' && user.stripeSubscriptionId) {
      // In real implementation, you'd get the next billing date from Stripe
      // For now, we'll add 30 days as an example
      deletionDate.setDate(deletionDate.getDate() + 30);
    } else {
      // If no active subscription, delete immediately (or after 7 days grace period)
      deletionDate.setDate(deletionDate.getDate() + 7);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ 
        accountDeletionScheduled: true,
        accountDeletionDate: deletionDate,
        subscriptionStatus: 'cancelled', // Cancel subscription
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();

    // Schedule deletion in Firebase
    if (updatedUser) {
      try {
        const { scheduleFirebaseDeletion } = await import("./firebase-admin.js");
        await scheduleFirebaseDeletion(updatedUser.id.toString(), deletionDate);
      } catch (error) {
        console.error('Failed to schedule deletion in Firebase:', error);
      }
    }

    return updatedUser || undefined;
  }

  async deleteUserAccount(id: number): Promise<void> {
    try {
      // Delete from PostgreSQL
      await db.delete(users).where(eq(users.id, id));
      
      // Delete from Firebase
      const { deleteFirebaseUser } = await import("./firebase-admin.js");
      await deleteFirebaseUser(id.toString());
    } catch (error) {
      console.error('Failed to delete user account:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();