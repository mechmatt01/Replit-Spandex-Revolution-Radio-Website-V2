import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index, } from "drizzle-orm/pg-core";
// import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// Firebase User Profile Schema
export const UserProfileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    userProfileImage: z.string().url().optional(),
    emailAddress: z.string().email("Valid email is required"),
    phoneNumber: z.string().optional(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }).optional(),
    isActiveListening: z.boolean().default(false),
    activeSubscription: z.boolean().default(false),
    renewalDate: z.date().optional(),
    lastLogin: z.date(),
    userID: z.string().length(10, "User ID must be exactly 10 characters"),
    isEmailVerified: z.boolean().default(false),
    isPhoneVerified: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
});
// Session storage table for authentication
export const sessions = pgTable("sessions", {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
}, (table) => [index("IDX_session_expire").on(table.expire)]);
// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
    id: varchar("id").primaryKey().notNull(), // Firebase UID
    userKey: varchar("user_key").unique().notNull(), // 10-character alphanumeric key
    email: varchar("email").unique(),
    passwordHash: varchar("password_hash"), // Hashed password for authentication
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    profileImageUrl: varchar("profile_image_url"),
    username: varchar("username").unique(),
    phoneNumber: varchar("phone_number"),
    googleId: varchar("google_id").unique(), // Google OAuth ID
    location: jsonb("location"), // { lat: number, lng: number, address?: string }
    isActiveListening: boolean("is_active_listening").default(false),
    activeSubscription: boolean("active_subscription").default(false),
    renewalDate: timestamp("renewal_date"),
    isPhoneVerified: boolean("is_phone_verified").default(false),
    showVerifiedBadge: boolean("show_verified_badge").default(false),
    accountDeletionScheduled: boolean("account_deletion_scheduled").default(false),
    accountDeletionDate: timestamp("account_deletion_date"),
    isEmailVerified: boolean("is_email_verified").default(false).notNull(),
    emailVerificationToken: varchar("email_verification_token"),
    phoneVerificationCode: varchar("phone_verification_code"),
    resetPasswordToken: varchar("reset_password_token"),
    resetPasswordExpires: timestamp("reset_password_expires"),
    isAdmin: boolean("is_admin").default(false).notNull(),
    stripeCustomerId: varchar("stripe_customer_id"),
    stripeSubscriptionId: varchar("stripe_subscription_id"),
    subscriptionStatus: varchar("subscription_status"), // active, canceled, past_due, etc.
    subscriptionTier: varchar("subscription_tier"), // rebel, legend, icon
    lastLoginAt: timestamp("last_login_at"),
    isFirstLogin: boolean("is_first_login").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const submissions = pgTable("submissions", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id),
    songTitle: text("song_title").notNull(),
    artistName: text("artist_name").notNull(),
    albumTitle: text("album_title"),
    releaseYear: integer("release_year"),
    submitterName: text("submitter_name"),
    message: text("message"),
    status: text("status").default("pending"), // pending, approved, rejected
    createdAt: timestamp("created_at").defaultNow(),
});
export const contacts = pgTable("contacts", {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
export const showSchedules = pgTable("show_schedules", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    host: text("host"),
    dayOfWeek: text("day_of_week").notNull(),
    time: text("time").notNull(),
    duration: integer("duration"), // in minutes
    isActive: boolean("is_active").default(true),
});
export const pastShows = pgTable("past_shows", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    host: text("host"),
    date: timestamp("date").notNull(),
    duration: integer("duration"), // in minutes
    audioUrl: text("audio_url"),
});
export const nowPlaying = pgTable("now_playing", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    album: text("album"),
    artwork: varchar("artwork", { length: 500 }),
    isAd: boolean("is_ad").default(false),
    duration: integer("duration"),
    currentTime: integer("current_time"),
    isLive: boolean("is_live").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const streamStats = pgTable("stream_stats", {
    id: serial("id").primaryKey(),
    currentListeners: integer("current_listeners").default(0),
    totalListeners: integer("total_listeners").default(0),
    countries: integer("countries").default(0),
    uptime: text("uptime").default("99.9%"),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const subscriptions = pgTable("subscriptions", {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    plan: text("plan").notNull(), // rebel, legend, icon
    status: text("status").default("active"), // active, cancelled, expired
    createdAt: timestamp("created_at").defaultNow(),
});
export const radioStations = pgTable("radio_stations", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    description: text("description"),
    streamUrl: text("stream_url").notNull(),
    apiUrl: text("api_url"), // For metadata fetching
    apiType: varchar("api_type").notNull(), // 'triton', 'streamtheworld', 'somafm', 'custom'
    stationId: varchar("station_id").notNull().unique(), // Internal ID for selection
    frequency: varchar("frequency"), // e.g., "95.5 FM", "Hot 97"
    location: varchar("location"), // e.g., "Dallas", "New York"
    genre: varchar("genre"), // e.g., "Hip Hop", "Metal"
    website: varchar("website"),
    logo: text("logo"), // URL to station logo
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Countdown settings table
export const countdownSettings = pgTable("countdown_settings", {
    id: serial("id").primaryKey(),
    countdownText: text("countdown_text").notNull().default("LIVE IN"),
    countdownDate: timestamp("countdown_date").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Countdown history table for undo/redo functionality
export const countdownHistory = pgTable("countdown_history", {
    id: serial("id").primaryKey(),
    countdownText: text("countdown_text").notNull(),
    countdownDate: timestamp("countdown_date").notNull(),
    changedBy: text("changed_by").notNull().default("admin"),
    changeReason: text("change_reason"),
    createdAt: timestamp("created_at").defaultNow(),
});
// Insert schemas
export const insertUserSchema = z.object({
    username: z.string().optional(),
    email: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    profileImageUrl: z.string().optional(),
    password: z.string().optional(),
    phoneNumber: z.string().optional(),
    googleId: z.string().optional(),
    location: z.any().optional(),
    isActiveListening: z.boolean().optional(),
    activeSubscription: z.boolean().optional(),
    isPhoneVerified: z.boolean().optional(),
    isEmailVerified: z.boolean().optional(),
    emailVerificationToken: z.string().optional(),
    phoneVerificationCode: z.string().optional(), // <-- Add this line
    stripeCustomerId: z.string().optional(),
    stripeSubscriptionId: z.string().optional(),
    accountDeletionScheduled: z.boolean().optional(),
});
export const registerUserSchema = z
    .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    username: z.string().min(3).max(32),
    phoneNumber: z.string().min(10, "Phone number is required"),
    phoneVerificationCode: z.string().optional(), // <-- Add this line
});
export const loginUserSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});
export const upsertUserSchema = z.object({
    id: z.string(),
    email: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    profileImageUrl: z.string().optional(),
    googleId: z.string().optional(),
});
export const updateLocationSchema = z.object({
    location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional(),
    }),
});
export const updateListeningStatusSchema = z.object({
    isActiveListening: z.boolean(),
});
// Additional schema definitions
export const insertShowScheduleSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    host: z.string().optional(),
    dayOfWeek: z.string().min(1, "Day of week is required"),
    time: z.string().min(1, "Time is required"),
    duration: z.number().optional(),
    isActive: z.boolean().default(true),
});
export const insertPastShowSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    host: z.string().optional(),
    date: z.date(),
    duration: z.number().optional(),
    audioUrl: z.string().url().optional(),
});
export const insertCountdownSettingsSchema = z.object({
    countdownText: z.string(),
    countdownDate: z.date(),
    isActive: z.boolean().optional(),
});
export const insertCountdownHistorySchema = z.object({
    countdownText: z.string(),
    countdownDate: z.date(),
    changedBy: z.string().optional(),
    changeReason: z.string().optional(),
});
// Radio Station Schema
export const insertRadioStationSchema = z.object({
    stationId: z.string().min(1, "Station ID is required"),
    name: z.string().min(1, "Station name is required"),
    streamUrl: z.string().url("Valid stream URL is required"),
    website: z.string().url("Valid website URL is required").optional(),
    description: z.string().optional(),
    genre: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    sortOrder: z.number().default(0),
    isActive: z.boolean().default(true),
    apiUrl: z.string().url().optional(),
    apiType: z.string().optional(),
    frequency: z.string().optional(),
    location: z.string().optional(),
});
// Contact Form Schema
export const insertContactSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});
// Subscription Schema
export const insertSubscriptionSchema = z.object({
    userID: z.string().min(1, "User ID is required"),
    packageType: z.enum(["Icon", "Legend", "Rebel"]),
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().default("USD"),
    status: z.enum(["active", "cancelled", "expired"]).default("active"),
    startDate: z.date(),
    endDate: z.date(),
});
// Now Playing Schema
export const insertNowPlayingSchema = z.object({
    stationId: z.string().min(1, "Station ID is required"),
    artist: z.string().optional(),
    title: z.string().optional(),
    album: z.string().optional(),
    artwork: z.string().url().optional(),
    timestamp: z.date(),
});
// Submission Schema
export const insertSubmissionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    songTitle: z.string().min(1, "Song title is required"),
    artist: z.string().min(1, "Artist is required"),
    genre: z.string().optional(),
    message: z.string().optional(),
    status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});
