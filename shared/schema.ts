import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
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
  location: jsonb("location"), // { lat: number, lng: number, address?: string }
  isActiveListening: boolean("is_active_listening").default(false),
  activeSubscription: boolean("active_subscription").default(false),
  renewalDate: timestamp("renewal_date"),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  showVerifiedBadge: boolean("show_verified_badge").default(false),
  accountDeletionScheduled: boolean("account_deletion_scheduled").default(false),
  accountDeletionDate: timestamp("account_deletion_date"),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  resetPasswordToken: varchar("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  isAdmin: boolean("is_admin").default(false),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status"), // active, canceled, past_due, etc.
  subscriptionTier: varchar("subscription_tier"), // rebel, legend, icon
  lastLoginAt: timestamp("last_login_at"),
  isFirstLogin: boolean("is_first_login").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  duration: integer("duration"), // in seconds
  currentTime: integer("current_time").default(0),
  isLive: boolean("is_live").default(true),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  emailVerificationToken: true,
});

export const registerUserSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

export const loginUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
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

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  songTitle: true,
  artistName: true,
  albumTitle: true,
  releaseYear: true,
  submitterName: true,
  message: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  firstName: true,
  lastName: true,
  email: true,
  subject: true,
  message: true,
});

export const insertShowScheduleSchema = createInsertSchema(showSchedules).pick({
  title: true,
  description: true,
  host: true,
  dayOfWeek: true,
  time: true,
  duration: true,
});

export const insertNowPlayingSchema = createInsertSchema(nowPlaying).pick({
  title: true,
  artist: true,
  album: true,
  duration: true,
  currentTime: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  email: true,
  plan: true,
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
