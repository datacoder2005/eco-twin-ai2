import { 
  UserProfile, 
  CarbonHistoryLog, 
  SavingsWallet, 
  EcoMission, 
  ReceiptAnalysis, 
  LeaderboardEntry, 
  CommunityForest, 
  NotificationItem, 
  WeeklyReport,
  CoachMessage
} from '../types/sustainability';

// Check if Firebase env variables exist (for production configuration)
export const isFirebaseConfigured = typeof window !== 'undefined' && (
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

// --- SEED DATA FOR DEMO PURPOSES ---
const SEED_USERS: LeaderboardEntry[] = [
  { userId: 'leader1', displayName: 'Aarav Sharma', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60', ecoScore: 92, co2SavedKg: 420, level: 8 },
  { userId: 'leader2', displayName: 'Diya Patel', photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60', ecoScore: 88, co2SavedKg: 350, level: 7 },
  { userId: 'leader3', displayName: 'Rohan Gupta', photoURL: 'https://images.unsplash.com/photo-1397018380411-d1a21f67e85c?w=100&auto=format&fit=crop&q=60', ecoScore: 85, co2SavedKg: 310, level: 6 },
  { userId: 'leader4', displayName: 'Ananya Iyer', photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60', ecoScore: 79, co2SavedKg: 240, level: 5 },
  { userId: 'leader5', displayName: 'Kabir Mehta', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60', ecoScore: 76, co2SavedKg: 190, level: 4 }
];

const SEED_MISSIONS: EcoMission[] = [
  { id: 'mission_no_cab', title: 'Zero Cab Commutes', description: 'Walk, cycle, or use public transit instead of ride-hailing cabs for 5 trips this week.', xpReward: 250, progress: 2, target: 5, status: 'active', deadline: '' },
  { id: 'mission_meat_free', title: 'Green Diet Hero', description: 'Choose 10 consecutive meat-free (vegan or vegetarian) meals.', xpReward: 300, progress: 6, target: 10, status: 'active', deadline: '' },
  { id: 'mission_unplug', title: 'Standby Slayer', description: 'Unplug major home electronics when sleeping or not in use for 5 days.', xpReward: 150, progress: 4, target: 5, status: 'active', deadline: '' },
  { id: 'mission_eco_wash', title: 'Cold-Water Laundry', description: 'Run 4 laundry cycles using cold water settings.', xpReward: 200, progress: 1, target: 4, status: 'active', deadline: '' }
];

const SEED_HISTORY = (userId: string): CarbonHistoryLog[] => {
  const dates = ['2026-05-30', '2026-06-06', '2026-06-13', '2026-06-20'];
  return [
    { id: 'hist_1', date: dates[0], categories: { transportation: 75, energy: 90, food: 45, shopping: 30, waste: 18 }, totalEmissions: 258, ecoScore: 68 },
    { id: 'hist_2', date: dates[1], categories: { transportation: 60, energy: 85, food: 35, shopping: 20, waste: 15 }, totalEmissions: 215, ecoScore: 74 },
    { id: 'hist_3', date: dates[2], categories: { transportation: 45, energy: 80, food: 30, shopping: 15, waste: 12 }, totalEmissions: 182, ecoScore: 81 },
    { id: 'hist_4', date: dates[3], categories: { transportation: 25, energy: 72, food: 30, shopping: 10, waste: 10 }, totalEmissions: 147, ecoScore: 89 },
  ];
};

const MOCK_STORAGE_KEY = 'ecotwin_mock_db';

interface MockStorageSchema {
  users: Record<string, UserProfile>;
  carbonHistory: Record<string, CarbonHistoryLog[]>;
  savings: Record<string, SavingsWallet>;
  missions: Record<string, EcoMission[]>;
  receiptAnalyses: Record<string, ReceiptAnalysis[]>;
  coachChats: Record<string, Record<string, CoachMessage[]>>;
  notifications: Record<string, NotificationItem[]>;
  weeklyReports: Record<string, WeeklyReport[]>;
  globalForest: CommunityForest;
}

// Initial Mock storage builder
function getMockDb(): MockStorageSchema {
  if (typeof window === 'undefined') {
    return {
      users: {},
      carbonHistory: {},
      savings: {},
      missions: {},
      receiptAnalyses: {},
      coachChats: {},
      notifications: {},
      weeklyReports: {},
      globalForest: { totalTreesEquivalent: 1284, totalCo2SavedKg: 28248, milestoneLevel: 3 }
    };
  }
  const data = localStorage.getItem(MOCK_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // JSON syntax error, rebuild
    }
  }

  const initial: MockStorageSchema = {
    users: {},
    carbonHistory: {},
    savings: {},
    missions: {},
    receiptAnalyses: {},
    coachChats: {},
    notifications: {},
    weeklyReports: {},
    globalForest: {
      totalTreesEquivalent: 1284,
      totalCo2SavedKg: 28248,
      milestoneLevel: 3
    }
  };
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveMockDb(db: MockStorageSchema) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  }
}

// --- MOCK FIREBASE CONTROLLER IMPLEMENTATION ---
export const mockFirebase = {
  // --- AUTH SERVICE ---
  auth: {
    getCurrentUser: (): UserProfile | null => {
      const db = getMockDb();
      const activeUid = typeof window !== 'undefined' ? sessionStorage.getItem('ecotwin_active_uid') : null;
      if (!activeUid) return null;
      return db.users[activeUid] || null;
    },

    signUp: (email: string, name: string): UserProfile => {
      const db = getMockDb();
      const uid = 'user_' + Math.random().toString(36).substring(2, 9);
      
      const newUser: UserProfile = {
        id: uid,
        email,
        displayName: name || email.split('@')[0],
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || email)}`,
        createdAt: new Date().toISOString(),
        ecoScore: 0,
        xp: 0,
        level: 1,
        badges: [],
        currentStreak: 0,
        longestStreak: 0,
      };

      db.users[uid] = newUser;
      
      // Initialize savings wallet
      db.savings[uid] = {
        userId: uid,
        co2SavedKg: 0,
        fuelSavedLiters: 0,
        electricitySavedKwh: 0,
        waterSavedLiters: 0,
        moneySavedInr: 0
      };

      // Initialize missions with deadlined seed missions
      const now = new Date();
      const deadline = new Date(now.setDate(now.getDate() + 7)).toISOString();
      db.missions[uid] = SEED_MISSIONS.map(m => ({ ...m, deadline }));

      // Initialize notifications
      db.notifications[uid] = [
        {
          id: 'notif_welcome',
          title: 'Welcome to EcoTwin AI! 🌍',
          body: 'Create your sustainability digital twin by completing the onboarding habits questionnaire.',
          type: 'streak',
          read: false,
          createdAt: new Date().toISOString()
        }
      ];

      saveMockDb(db);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ecotwin_active_uid', uid);
      }
      return newUser;
    },

    signIn: (email: string): UserProfile => {
      const db = getMockDb();
      // Try to find matching user by email
      let user = Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        // Create auto profile on signIn if missing for simpler hackathon onboarding
        user = mockFirebase.auth.signUp(email, email.split('@')[0]);
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('ecotwin_active_uid', user.id);
        }
      }
      return user;
    },

    signOut: () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ecotwin_active_uid');
      }
    }
  },

  // --- FIRESTORE DATABASE SERVICE ---
  db: {
    getUserProfile: (uid: string): UserProfile | null => {
      const db = getMockDb();
      return db.users[uid] || null;
    },

    updateUserProfile: (uid: string, updates: Partial<UserProfile>): UserProfile => {
      const db = getMockDb();
      if (!db.users[uid]) {
        throw new Error('User not found');
      }
      db.users[uid] = { ...db.users[uid], ...updates };
      saveMockDb(db);
      return db.users[uid];
    },

    // Carbon History
    getCarbonHistory: (uid: string): CarbonHistoryLog[] => {
      const db = getMockDb();
      if (!db.carbonHistory[uid] || db.carbonHistory[uid].length === 0) {
        db.carbonHistory[uid] = SEED_HISTORY(uid);
        saveMockDb(db);
      }
      return db.carbonHistory[uid];
    },

    addCarbonLog: (uid: string, categories: CarbonHistoryLog['categories'], score: number): CarbonHistoryLog => {
      const db = getMockDb();
      const logs = db.carbonHistory[uid] || SEED_HISTORY(uid);
      
      const total = parseFloat(Object.values(categories).reduce((a, b) => a + b, 0).toFixed(1));
      const newLog: CarbonHistoryLog = {
        id: 'hist_' + Math.random().toString(36).substring(2, 9),
        date: new Date().toISOString().split('T')[0],
        categories,
        totalEmissions: total,
        ecoScore: score
      };

      logs.push(newLog);
      db.carbonHistory[uid] = logs;
      
      // Update User EcoScore
      if (db.users[uid]) {
        db.users[uid].ecoScore = score;
      }

      saveMockDb(db);
      return newLog;
    },

    // Wallet Savings
    getSavingsWallet: (uid: string): SavingsWallet => {
      const db = getMockDb();
      if (!db.savings[uid]) {
        db.savings[uid] = {
          userId: uid,
          co2SavedKg: 0,
          fuelSavedLiters: 0,
          electricitySavedKwh: 0,
          waterSavedLiters: 0,
          moneySavedInr: 0
        };
        saveMockDb(db);
      }
      return db.savings[uid];
    },

    updateSavingsWallet: (uid: string, updates: Partial<SavingsWallet>): SavingsWallet => {
      const db = getMockDb();
      const wallet = db.savings[uid] || {
        userId: uid,
        co2SavedKg: 0,
        fuelSavedLiters: 0,
        electricitySavedKwh: 0,
        waterSavedLiters: 0,
        moneySavedInr: 0
      };
      
      db.savings[uid] = { ...wallet, ...updates };
      
      // Also sync global community forest
      if (updates.co2SavedKg) {
        const delta = (updates.co2SavedKg - (wallet.co2SavedKg || 0));
        if (delta > 0) {
          db.globalForest.totalCo2SavedKg += delta;
          // 22kg per tree
          db.globalForest.totalTreesEquivalent = Math.round(db.globalForest.totalCo2SavedKg / 22);
          db.globalForest.milestoneLevel = Math.floor(db.globalForest.totalTreesEquivalent / 400) + 1;
        }
      }

      saveMockDb(db);
      return db.savings[uid];
    },

    // Gamified Missions
    getMissions: (uid: string): EcoMission[] => {
      const db = getMockDb();
      if (!db.missions[uid] || db.missions[uid].length === 0) {
        const now = new Date();
        const deadline = new Date(now.setDate(now.getDate() + 7)).toISOString();
        db.missions[uid] = SEED_MISSIONS.map(m => ({ ...m, deadline }));
        saveMockDb(db);
      }
      return db.missions[uid];
    },

    updateMissionProgress: (uid: string, missionId: string, increment: number): EcoMission => {
      const db = getMockDb();
      const userMissions = db.missions[uid] || [];
      const index = userMissions.findIndex(m => m.id === missionId);
      
      if (index === -1) {
        throw new Error('Mission not found');
      }

      const mission = userMissions[index];
      const newProgress = Math.min(mission.target, mission.progress + increment);
      const newStatus = newProgress >= mission.target ? 'completed' : 'active';
      
      const updated = {
        ...mission,
        progress: newProgress,
        status: newStatus as 'active' | 'completed'
      };

      userMissions[index] = updated;
      db.missions[uid] = userMissions;

      // Award XP on completion
      if (newStatus === 'completed' && mission.status !== 'completed') {
        const user = db.users[uid];
        if (user) {
          user.xp += mission.xpReward;
          // Level up math (every 1000 XP)
          const newLevel = Math.floor(user.xp / 1000) + 1;
          if (newLevel > user.level) {
            user.level = newLevel;
            user.badges.push(`Level ${newLevel} Specialist`);
            
            // Add notification
            db.notifications[uid].unshift({
              id: 'notif_lvl_' + Date.now(),
              title: 'Level Up! 🎉',
              body: `Congratulations! You reached Level ${newLevel} and earned a new Badge.`,
              type: 'streak',
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      }

      saveMockDb(db);
      return updated;
    },

    // Receipt Analyzer
    getReceiptAnalyses: (uid: string): ReceiptAnalysis[] => {
      const db = getMockDb();
      return db.receiptAnalyses[uid] || [];
    },

    addReceiptAnalysis: (uid: string, analysis: Omit<ReceiptAnalysis, 'id' | 'uploadedAt'>): ReceiptAnalysis => {
      const db = getMockDb();
      const list = db.receiptAnalyses[uid] || [];
      
      const newAnalysis: ReceiptAnalysis = {
        ...analysis,
        id: 'rcpt_' + Math.random().toString(36).substring(2, 9),
        uploadedAt: new Date().toISOString()
      };

      list.unshift(newAnalysis);
      db.receiptAnalyses[uid] = list;

      saveMockDb(db);
      return newAnalysis;
    },

    // Global Collections
    getLeaderboard: (): LeaderboardEntry[] => {
      const db = getMockDb();
      // Convert users profile into entries and mix with seeds for populated visual UI
      const userEntries: LeaderboardEntry[] = Object.values(db.users).map(u => ({
        userId: u.id,
        displayName: u.displayName,
        photoURL: u.photoURL,
        ecoScore: u.ecoScore || 70,
        co2SavedKg: db.savings[u.id]?.co2SavedKg || 0,
        level: u.level || 1
      }));

      const all = [...userEntries, ...SEED_USERS];
      // Sort by ecoScore descending
      return all.sort((a, b) => b.ecoScore - a.ecoScore);
    },

    getGlobalCommunityForest: (): CommunityForest => {
      const db = getMockDb();
      return db.globalForest;
    },

    // Weekly Reports
    getWeeklyReports: (uid: string): WeeklyReport[] => {
      const db = getMockDb();
      return db.weeklyReports[uid] || [];
    },

    addWeeklyReport: (uid: string, report: Omit<WeeklyReport, 'id' | 'generatedAt'>): WeeklyReport => {
      const db = getMockDb();
      const list = db.weeklyReports[uid] || [];
      
      const newReport: WeeklyReport = {
        ...report,
        id: 'rep_' + Math.random().toString(36).substring(2, 9),
        generatedAt: new Date().toISOString()
      };

      list.unshift(newReport);
      db.weeklyReports[uid] = list;

      // Add Notification
      const listNotif = db.notifications[uid] || [];
      listNotif.unshift({
        id: 'notif_rep_' + Date.now(),
        title: 'Weekly Carbon Report Ready 📊',
        body: `Your sustainability score changed by ${report.scoreChange > 0 ? '+' : ''}${report.scoreChange} points! Check detailed tips.`,
        type: 'report',
        read: false,
        createdAt: new Date().toISOString()
      });
      db.notifications[uid] = listNotif;

      saveMockDb(db);
      return newReport;
    },

    // Notification Hub
    getNotifications: (uid: string): NotificationItem[] => {
      const db = getMockDb();
      return db.notifications[uid] || [];
    },

    addNotification: (uid: string, title: string, body: string, type: NotificationItem['type']): NotificationItem => {
      const db = getMockDb();
      const list = db.notifications[uid] || [];
      
      const newItem: NotificationItem = {
        id: 'notif_' + Math.random().toString(36).substring(2, 9),
        title,
        body,
        type,
        read: false,
        createdAt: new Date().toISOString()
      };

      list.unshift(newItem);
      db.notifications[uid] = list;
      saveMockDb(db);
      return newItem;
    },

    markNotificationAsRead: (uid: string, notificationId: string) => {
      const db = getMockDb();
      const list = db.notifications[uid] || [];
      const item = list.find(n => n.id === notificationId);
      if (item) {
        item.read = true;
        saveMockDb(db);
      }
    }
  },

  // --- STORAGE SERVICE ---
  storage: {
    uploadReceiptImage: async (uid: string, file: File): Promise<string> => {
      // Simulating a Firebase Storage upload delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return URL.createObjectURL(file); // Direct client url for local image preview
    }
  }
};
