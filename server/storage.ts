import { 
  users, 
  submissions, 
  contacts, 
  showSchedules, 
  pastShows, 
  nowPlaying, 
  streamStats, 
  subscriptions,
  type User, 
  type InsertUser,
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
  type InsertSubscription
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private submissions: Map<number, Submission> = new Map();
  private contacts: Map<number, Contact> = new Map();
  private showSchedules: Map<number, ShowSchedule> = new Map();
  private pastShows: Map<number, PastShow> = new Map();
  private nowPlaying: NowPlaying | undefined;
  private streamStats: StreamStats | undefined;
  private subscriptions: Map<number, Subscription> = new Map();
  
  private currentUserId = 1;
  private currentSubmissionId = 1;
  private currentContactId = 1;
  private currentScheduleId = 1;
  private currentShowId = 1;
  private currentStatsId = 1;
  private currentSubscriptionId = 1;

  constructor() {
    // Initialize with default admin user
    this.users.set(1, {
      id: 1,
      username: "admin",
      password: "admin123", // In production, this should be hashed
      isAdmin: true,
      createdAt: new Date(),
    });
    this.currentUserId = 2;

    // Initialize current track
    this.nowPlaying = {
      id: 1,
      title: "Youth Gone Wild",
      artist: "Skid Row",
      album: "Skid Row",
      duration: 252,
      currentTime: 154,
      isLive: true,
      updatedAt: new Date(),
    };

    // Initialize stream stats
    this.streamStats = {
      id: 1,
      currentListeners: 1247,
      totalListeners: 45200,
      countries: 52,
      uptime: "99.9%",
      updatedAt: new Date(),
    };

    // Initialize sample show schedules
    this.showSchedules.set(1, {
      id: 1,
      title: "Metal Monday Madness",
      description: "Kick off the week with the heaviest hits from the 80s and 90s metal scene.",
      host: "Metal Mike",
      dayOfWeek: "Monday",
      time: "8:00 PM EST",
      duration: 120,
      isActive: true,
    });

    this.showSchedules.set(2, {
      id: 2,
      title: "Throwback Thursday",
      description: "Deep cuts and rare gems from legendary metal bands you haven't heard in years.",
      host: "Rockin' Rachel",
      dayOfWeek: "Thursday",
      time: "7:00 PM EST",
      duration: 90,
      isActive: true,
    });

    this.showSchedules.set(3, {
      id: 3,
      title: "Weekend Metal Mayhem",
      description: "Two hours of non-stop metal anthems to fuel your weekend rebellion.",
      host: "Headbanger Harry",
      dayOfWeek: "Saturday",
      time: "9:00 PM EST",
      duration: 120,
      isActive: true,
    });

    this.currentScheduleId = 4;

    // Initialize past shows
    this.pastShows.set(1, {
      id: 1,
      title: "Best of Skid Row",
      description: "A comprehensive look at Skid Row's greatest hits and deep cuts.",
      host: "Metal Mike",
      date: new Date("2025-06-10"),
      duration: 135,
      audioUrl: null,
    });

    this.pastShows.set(2, {
      id: 2,
      title: "80s Metal Legends",
      description: "Celebrating the pioneers of 80s metal music.",
      host: "Rockin' Rachel",
      date: new Date("2025-06-08"),
      duration: 105,
      audioUrl: null,
    });

    this.pastShows.set(3, {
      id: 3,
      title: "Hair Metal Classics",
      description: "The biggest hair metal anthems of all time.",
      host: "Headbanger Harry",
      date: new Date("2025-06-05"),
      duration: 150,
      audioUrl: null,
    });

    this.currentShowId = 4;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Submission methods
  async getSubmissions(): Promise<Submission[]> {
    return Array.from(this.submissions.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getSubmissionById(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = this.currentSubmissionId++;
    const submission: Submission = {
      ...insertSubmission,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.submissions.set(id, submission);
    return submission;
  }

  async updateSubmissionStatus(id: number, status: string): Promise<Submission | undefined> {
    const submission = this.submissions.get(id);
    if (!submission) return undefined;
    
    const updated = { ...submission, status };
    this.submissions.set(id, updated);
    return updated;
  }

  // Contact methods
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  // Show schedule methods
  async getShowSchedules(): Promise<ShowSchedule[]> {
    return Array.from(this.showSchedules.values());
  }

  async getActiveShowSchedules(): Promise<ShowSchedule[]> {
    return Array.from(this.showSchedules.values()).filter(schedule => schedule.isActive);
  }

  async createShowSchedule(insertSchedule: InsertShowSchedule): Promise<ShowSchedule> {
    const id = this.currentScheduleId++;
    const schedule: ShowSchedule = {
      ...insertSchedule,
      id,
      isActive: true,
    };
    this.showSchedules.set(id, schedule);
    return schedule;
  }

  async updateShowSchedule(id: number, updateData: Partial<InsertShowSchedule>): Promise<ShowSchedule | undefined> {
    const schedule = this.showSchedules.get(id);
    if (!schedule) return undefined;
    
    const updated = { ...schedule, ...updateData };
    this.showSchedules.set(id, updated);
    return updated;
  }

  // Past shows methods
  async getPastShows(): Promise<PastShow[]> {
    return Array.from(this.pastShows.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // Now playing methods
  async getCurrentTrack(): Promise<NowPlaying | undefined> {
    return this.nowPlaying;
  }

  async updateNowPlaying(track: InsertNowPlaying): Promise<NowPlaying> {
    this.nowPlaying = {
      ...track,
      id: 1,
      isLive: true,
      updatedAt: new Date(),
    };
    return this.nowPlaying;
  }

  // Stream stats methods
  async getStreamStats(): Promise<StreamStats | undefined> {
    return this.streamStats;
  }

  async updateStreamStats(stats: Partial<StreamStats>): Promise<StreamStats> {
    this.streamStats = {
      ...this.streamStats!,
      ...stats,
      updatedAt: new Date(),
    };
    return this.streamStats;
  }

  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentSubscriptionId++;
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      status: "active",
      createdAt: new Date(),
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }
}

export const storage = new MemStorage();
