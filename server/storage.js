import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { generateUserKey } from "./firebase";
import { users, submissions, contacts, showSchedules, pastShows, nowPlaying, streamStats, subscriptions, radioStations, } from "@shared/schema";
export class DatabaseStorage {
    // User operations
    // (IMPORTANT) these user operations are mandatory for Replit Auth.
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }
    async upsertUser(userData) {
        const existingUser = await this.getUser(userData.id);
        if (existingUser) {
            return await this.updateUser(userData.id, userData);
        }
        else {
            // Generate a unique user key for new users
            let userKey = generateUserKey();
            let attempts = 0;
            // Ensure the user key is unique
            while (attempts < 10) {
                const existingUserWithKey = await db.query.users.findFirst({
                    where: eq(users.userKey, userKey),
                });
                if (!existingUserWithKey) {
                    break;
                }
                userKey = generateUserKey();
                attempts++;
            }
            return await this.createUser({ ...userData, userKey });
        }
    }
    async getUserByEmail(email) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
        return user;
    }
    async getUserByUsername(username) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, username));
        return user;
    }
    async getUserByGoogleId(googleId) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.googleId, googleId));
        return user;
    }
    async updateListeningStatus(id, isActiveListening) {
        const [user] = await db
            .update(users)
            .set({ [users.isActiveListening.name]: isActiveListening })
            .where(eq(users.id, id))
            .returning();
        return user;
    }
    async createUser(userData) {
        const [user] = await db.insert(users).values(userData).returning();
        return user;
    }
    async updateUser(id, updates) {
        const [user] = await db
            .update(users)
            .set(updates)
            .where(eq(users.id, id))
            .returning();
        return user;
    }
    async updateUserLocation(id, location) {
        const [user] = await db
            .update(users)
            .set({ [users.location.name]: location })
            .where(eq(users.id, id))
            .returning();
        return user;
    }
    async getActiveListeners() {
        return await db
            .select()
            .from(users)
            .where(eq(users.isActiveListening, true));
    }
    async verifyPhone(userId, code) {
        const [user] = await db
            .select()
            .from(users)
            .where(and(eq(users.id, userId), eq(users.phoneVerificationCode, code)));
        if (user) {
            const [updatedUser] = await db
                .update(users)
                .set({ [users.isPhoneVerified.name]: true })
                .where(eq(users.id, userId))
                .returning();
            return updatedUser;
        }
        return undefined;
    }
    async verifyEmail(token) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.emailVerificationToken, token));
        if (user) {
            const [updatedUser] = await db
                .update(users)
                .set({ [users.isEmailVerified.name]: true })
                .where(eq(users.id, user.id))
                .returning();
            return updatedUser;
        }
        return undefined;
    }
    async updatePassword(id, hashedPassword) {
        const [user] = await db
            .update(users)
            .set({ [users.passwordHash.name]: hashedPassword })
            .where(eq(users.id, id))
            .returning();
        return user;
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
        return user;
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
        return submission;
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
            .where(eq(submissions.userId, userId))
            .orderBy(desc(submissions.createdAt));
    }
    async updateSubmissionStatus(id, status) {
        const [submission] = await db
            .update(submissions)
            .set({ [submissions.status.name]: status })
            .where(eq(submissions.id, id))
            .returning();
        return submission;
    }
    async getContacts() {
        return await db.select().from(contacts);
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
        return schedule;
    }
    async getPastShows() {
        return await db.select().from(pastShows);
    }
    async getCurrentTrack() {
        const [track] = await db
            .select()
            .from(nowPlaying)
            .orderBy(desc(nowPlaying.createdAt))
            .limit(1);
        return track;
    }
    async updateNowPlaying(track) {
        const [newTrack] = await db
            .insert(nowPlaying)
            .values(track)
            .returning();
        return newTrack;
    }
    async getStreamStats() {
        const [stats] = await db
            .select()
            .from(streamStats)
            .orderBy(desc(streamStats.updatedAt))
            .limit(1);
        return stats;
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
