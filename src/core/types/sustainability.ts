export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  ecoScore: number; // 0 - 100
  xp: number;
  level: number;
  badges: string[];
  currentStreak: number;
  longestStreak: number;
  sustainabilityProfile?: OnboardingProfile;
}

export interface OnboardingProfile {
  transportation: 'none' | 'electric' | 'hybrid' | 'combustion' | 'public_transit';
  diet: 'vegan' | 'vegetarian' | 'pescatarian' | 'flexitarian' | 'meat_heavy';
  electricityMonthlyKwh: number;
  waterMonthlyLiters: number;
  shoppingFrequency: 'minimal' | 'average' | 'frequent';
  wasteRecyclePercentage: number;
}

export interface SavingsWallet {
  userId: string;
  co2SavedKg: number;
  fuelSavedLiters: number;
  electricitySavedKwh: number;
  waterSavedLiters: number;
  moneySavedInr: number;
}

export interface CarbonHistoryLog {
  id: string;
  date: string; // YYYY-MM-DD
  categories: {
    transportation: number; // kg CO2e
    energy: number;
    food: number;
    shopping: number;
    waste: number;
  };
  totalEmissions: number;
  ecoScore: number;
}

export interface WeeklyReport {
  id: string;
  generatedAt: string;
  summary: string;
  scoreChange: number;
  trends: string;
  recommendations: string[];
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface EcoMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  status: 'active' | 'completed';
  deadline: string;
}

export interface ReceiptAnalysis {
  id: string;
  imageUrl: string;
  uploadedAt: string;
  estimatedCarbonKg: number;
  detectedProducts: string[];
  recommendations: string[];
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string;
  ecoScore: number;
  co2SavedKg: number;
  level: number;
}

export interface CommunityForest {
  totalTreesEquivalent: number;
  totalCo2SavedKg: number;
  milestoneLevel: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'report' | 'mission' | 'streak';
  read: boolean;
  createdAt: string;
}
