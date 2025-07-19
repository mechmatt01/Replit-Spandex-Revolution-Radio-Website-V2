import { users, submissions, contacts, showSchedules, pastShows, nowPlaying, streamStats, subscriptions, radioStations, } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
export class DatabaseStorage {
    // User operations
    // (IMPORTANT) these user operations are mandatory for Replit Auth.
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }
    async upsertUser(userData) {
        const [user] = await db
            .insert(users)
            .values(userData)
            .onConflictDoUpdate({
            target: users.id,
            set: userData,
        })
            .returning();
        return user;
    }
    // Other operations
    async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || undefined;
    }
    async getUserByUsername(username) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, username));
        return user || undefined;
    }
    async getUserByGoogleId(googleId) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.googleId, googleId));
        return user || undefined;
    }
    async updateListeningStatus(id, isActiveListening) {
        const [user] = await db
            .update(users)
            .set({ isActiveListening })
            .where(eq(users.id, id))
            .returning();
        return user;
    }
    async createUser(userData) {
        const [user] = await db
            .insert(users)
            .values({
            ...userData,
        })
            .returning();
        return user;
    }
    async updateUser(id, updates) {
        const [user] = await db
            .update(users)
            .set(updates)
            .where(eq(users.id, id))
            .returning();
        return user || undefined;
    }
    async updateUserLocation(id, location) {
        const [user] = await db
            .update(users)
            .set({
            location,
        })
            .where(eq(users.id, id))
            .returning();
        return user || undefined;
    }
    async getActiveListeners() {
        return await db
            .select()
            .from(users)
            .where(eq(users.isActiveListening, true));
    }
    async verifyPhone(userId, code) {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) {
            return undefined;
        }
        const [updatedUser] = await db
            .update(users)
            .set({
            isPhoneVerified: true,
        })
            .where(eq(users.id, userId))
            .returning();
        return updatedUser || undefined;
    }
    async verifyEmail(token) {
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
        })
            .where(eq(users.id, user.id))
            .returning();
        return updatedUser || undefined;
    }
    async updatePassword(id, hashedPassword) {
        const [user] = await db
            .update(users)
            .set({
            passwordHash: hashedPassword,
        })
            .where(eq(users.id, id))
            .returning();
        return user || undefined;
    }
    async updateStripeInfo(id, stripeCustomerId, stripeSubscriptionId) {
        const [user] = await db
            .update(users)
            .set({
            stripeCustomerId,
            stripeSubscriptionId,
        })
            .where(eq(users.id, id))
            .returning();
        return user || undefined;
    }
    async getSubmissions() {
        return await db
            .select()
            .from(submissions)
            .orderBy(desc(submissions.createdAt));
    }
    async getSubmissionById(id) {
        const [submission] = await db
            .select()
            .from(submissions)
            .where(eq(submissions.id, id));
        return submission || undefined;
    }
    async createSubmission(insertSubmission) {
        const [submission] = await db
            .insert(submissions)
            .values(insertSubmission)
            .returning();
        return submission;
    }
    async getUserSubmissions(userId) {
        return await db
            .select()
            .from(submissions)
            .where(eq(submissions.userId, userId));
    }
    async updateSubmissionStatus(id, status) {
        const [submission] = await db
            .update(submissions)
            .set({ status })
            .where(eq(submissions.id, id))
            .returning();
        return submission || undefined;
    }
    async getContacts() {
        return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    }
    async createContact(insertContact) {
        const [contact] = await db
            .insert(contacts)
            .values(insertContact)
            .returning();
        return contact;
    }
    async getShowSchedules() {
        return await db.select().from(showSchedules);
    }
    async getActiveShowSchedules() {
        return await db
            .select()
            .from(showSchedules)
            .where(eq(showSchedules.isActive, true));
    }
    async createShowSchedule(insertSchedule) {
        const [schedule] = await db
            .insert(showSchedules)
            .values(insertSchedule)
            .returning();
        return schedule;
    }
    async updateShowSchedule(id, updateData) {
        const [schedule] = await db
            .update(showSchedules)
            .set(updateData)
            .where(eq(showSchedules.id, id))
            .returning();
        return schedule || undefined;
    }
    async getPastShows() {
        return await db.select().from(pastShows);
    }
    async getCurrentTrack() {
        const [track] = await db
            .select()
            .from(nowPlaying)
            .orderBy(desc(nowPlaying.id))
            .limit(1);
        return track || undefined;
    }
    async updateNowPlaying(track) {
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
            })
                .where(eq(nowPlaying.id, existingTrack.id))
                .returning();
            return updated;
        }
        else {
            const [newTrack] = await db.insert(nowPlaying).values({
                title: track.title,
                artist: track.artist,
                album: track.album,
                artwork: track.artwork,
                isAd: track.isAd,
                duration: track.duration,
                currentTime: track.currentTime,
                isLive: track.isLive,
            }).returning();
            return newTrack;
        }
    }
    async getStreamStats() {
        const [stats] = await db
            .select()
            .from(streamStats)
            .orderBy(desc(streamStats.id))
            .limit(1);
        return stats || undefined;
    }
    async updateStreamStats(stats) {
        const existingStats = await this.getStreamStats();
        if (existingStats) {
            const [updatedStats] = await db
                .update(streamStats)
                .set(stats)
                .where(eq(streamStats.id, existingStats.id))
                .returning();
            return updatedStats;
        }
        else {
            const [newStats] = await db
                .insert(streamStats)
                .values(stats)
                .returning();
            return newStats;
        }
    }
    async getSubscriptions() {
        return await db
            .select()
            .from(subscriptions)
            .orderBy(desc(subscriptions.createdAt));
    }
    async createSubscription(insertSubscription) {
        const [subscription] = await db
            .insert(subscriptions)
            .values(insertSubscription)
            .returning();
        return subscription;
    }
    async scheduleUserDeletion(id) {
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + 30); // Schedule deletion 30 days from now
        const [user] = await db
            .update(users)
            .set({
            accountDeletionScheduled: true,
            accountDeletionDate: deletionDate,
        })
            .where(eq(users.id, id))
            .returning();
        return user || undefined;
    }
    async deleteUserAccount(id) {
        await db.delete(users).where(eq(users.id, id));
    }
    // Radio stations
    async getRadioStations() {
        return await db.select().from(radioStations).orderBy(radioStations.sortOrder);
    }
    async getActiveRadioStations() {
        return await db.select().from(radioStations).where(eq(radioStations.isActive, true)).orderBy(radioStations.sortOrder);
    }
    async getRadioStationById(id) {
        const [station] = await db.select().from(radioStations).where(eq(radioStations.id, id));
        return station;
    }
    async getRadioStationByStationId(stationId) {
        const [station] = await db.select().from(radioStations).where(eq(radioStations.stationId, stationId));
        return station;
    }
    async createRadioStation(insertStation) {
        const [station] = await db.insert(radioStations).values(insertStation).returning();
        return station;
    }
    async updateRadioStation(id, updates) {
        const [station] = await db.update(radioStations)
            .set(updates)
            .where(eq(radioStations.id, id))
            .returning();
        return station;
    }
    async deleteRadioStation(id) {
        await db.delete(radioStations).where(eq(radioStations.id, id));
    }
    async updateStationSortOrder(id, sortOrder) {
        const [station] = await db.update(radioStations)
            .set({
            sortOrder: sortOrder,
        })
            .where(eq(radioStations.id, id))
            .returning();
        return station;
    }
}
export const storage = new DatabaseStorage();
