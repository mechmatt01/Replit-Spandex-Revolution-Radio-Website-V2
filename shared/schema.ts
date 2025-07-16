import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  varchar,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
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
  accountDeletionScheduled: boolean("account_deletion_scheduled").default(
    false,
  ),
  accountDeletionDate: timestamp("account_deletion_date"),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  emailVerificationToken: varchar("email_verification_token"),
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
  phoneNumber: z.string().optional(),
  googleId: z.string().optional(),
  location: z.any().optional(),
  isActiveListening: z.boolean().optional(),
  activeSubscription: z.boolean().optional(),
  isPhoneVerified: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  emailVerificationToken: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  accountDeletionScheduled: z.boolean().optional(),
});

export const registerUserSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    },
  );

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

export const insertSubmissionSchema = z.object({
  userId: z.string().optional(),
  songTitle: z.string(),
  artistName: z.string(),
  albumTitle: z.string().optional(),
  releaseYear: z.number().optional(),
  submitterName: z.string().optional(),
  message: z.string().optional(),
  status: z.string().optional(),
});

export const insertContactSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  subject: z.string(),
  message: z.string(),
});

export const insertShowScheduleSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  host: z.string().optional(),
  dayOfWeek: z.string(),
  time: z.string(),
  duration: z.string().optional(),
});

export const insertNowPlayingSchema = z.object({
  title: z.string(),
  artist: z.string(),
  album: z.string().optional(),
  artwork: z.string().optional(),
  isAd: z.boolean().optional(),
  duration: z.number().optional(),
  currentTime: z.number().optional(),
  isLive: z.boolean().optional(),
});

export const insertSubscriptionSchema = z.object({
  email: z.string(),
  plan: z.string(),
  status: z.string().optional(),
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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type ShowSchedule = typeof showSchedules.$inferSelect;
export type InsertShowSchedule = z.infer<typeof insertShowScheduleSchema>;

export type PastShow = typeof pastShows.$inferSelect;

export type NowPlaying = typeof nowPlaying.$inferSelect;
export type InsertNowPlaying = z.infer<typeof insertNowPlayingSchema>;

export type StreamStats = typeof streamStats.$inferSelect;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export const insertRadioStationSchema = z.object({
  name: z.string().min(1, "Station name is required"),
  description: z.string().optional(),
  streamUrl: z.string().url("Valid stream URL required"),
  apiUrl: z.string().optional(),
  apiType: z.enum(["triton", "streamtheworld", "somafm", "custom", "auto"]).default("auto"),
  stationId: z.string().min(1, "Station ID is required"),
  frequency: z.string().optional(),
  location: z.string().optional(),
  genre: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export type RadioStation = typeof radioStations.$inferSelect;
export type InsertRadioStation = z.infer<typeof insertRadioStationSchema>;