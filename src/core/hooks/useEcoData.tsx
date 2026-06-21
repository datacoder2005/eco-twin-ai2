'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  CarbonHistoryLog, 
  SavingsWallet, 
  EcoMission, 
  ReceiptAnalysis, 
  NotificationItem, 
  WeeklyReport,
  CoachMessage,
  CommunityForest
} from '../types/sustainability';
import { mockFirebase } from '../services/firebase';
import { generateWeeklyReport } from '../services/gemini';

interface EcoDataContextType {
  carbonHistory: CarbonHistoryLog[];
  savingsWallet: SavingsWallet | null;
  missions: EcoMission[];
  receipts: ReceiptAnalysis[];
  notifications: NotificationItem[];
  weeklyReports: WeeklyReport[];
  globalForest: CommunityForest | null;
  loading: boolean;
  refreshData: () => void;
  recordCarbonLog: (categories: CarbonHistoryLog['categories'], score: number) => Promise<CarbonHistoryLog>;
  triggerMissionProgress: (missionId: string, increment: number) => Promise<EcoMission>;
  uploadAndAnalyzeReceipt: (file: File) => Promise<ReceiptAnalysis>;
  markNotificationRead: (notifId: string) => void;
  runWeeklyAIEvaluation: () => Promise<WeeklyReport>;
  addManualSavings: (co2: number, electricity: number, fuel: number, water: number) => Promise<SavingsWallet>;
}

const EcoDataContext = createContext<EcoDataContextType | undefined>(undefined);

export function EcoDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [carbonHistory, setCarbonHistory] = useState<CarbonHistoryLog[]>([]);
  const [savingsWallet, setSavingsWallet] = useState<SavingsWallet | null>(null);
  const [missions, setMissions] = useState<EcoMission[]>([]);
  const [receipts, setReceipts] = useState<ReceiptAnalysis[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [globalForest, setGlobalForest] = useState<CommunityForest | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(() => {
    if (!user) {
      setCarbonHistory([]);
      setSavingsWallet(null);
      setMissions([]);
      setReceipts([]);
      setNotifications([]);
      setWeeklyReports([]);
      setGlobalForest(null);
      setLoading(false);
      return;
    }

    try {
      setCarbonHistory(mockFirebase.db.getCarbonHistory(user.id));
      setSavingsWallet(mockFirebase.db.getSavingsWallet(user.id));
      setMissions(mockFirebase.db.getMissions(user.id));
      setReceipts(mockFirebase.db.getReceiptAnalyses(user.id));
      setNotifications(mockFirebase.db.getNotifications(user.id));
      setWeeklyReports(mockFirebase.db.getWeeklyReports(user.id));
      setGlobalForest(mockFirebase.db.getGlobalCommunityForest());
    } catch (err) {
      console.error('Error fetching data from Firestore mock:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const recordCarbonLog = async (categories: CarbonHistoryLog['categories'], score: number): Promise<CarbonHistoryLog> => {
    if (!user) throw new Error('Unauthenticated user');
    const log = mockFirebase.db.addCarbonLog(user.id, categories, score);
    refreshData();
    return log;
  };

  const triggerMissionProgress = async (missionId: string, increment: number): Promise<EcoMission> => {
    if (!user) throw new Error('Unauthenticated user');
    const m = mockFirebase.db.updateMissionProgress(user.id, missionId, increment);
    refreshData();
    return m;
  };

  const uploadAndAnalyzeReceipt = async (file: File): Promise<ReceiptAnalysis> => {
    if (!user) throw new Error('Unauthenticated user');
    setLoading(true);
    try {
      const url = await mockFirebase.storage.uploadReceiptImage(user.id, file);
      
      // Call mock Gemini Vision analyzer
      // In dynamic mock generator, we import analyzeReceiptImage
      const { analyzeReceiptImage } = await import('../services/gemini');
      const analysisResult = await analyzeReceiptImage(url);
      
      const savedAnalysis = mockFirebase.db.addReceiptAnalysis(user.id, {
        imageUrl: url,
        estimatedCarbonKg: analysisResult.estimatedCarbonKg,
        detectedProducts: analysisResult.detectedProducts,
        recommendations: analysisResult.recommendations
      });
      
      // Update carbon savings (receipt shopping audit saves e.g. 5kg CO2 on average)
      const wallet = mockFirebase.db.getSavingsWallet(user.id);
      mockFirebase.db.updateSavingsWallet(user.id, {
        co2SavedKg: wallet.co2SavedKg + analysisResult.estimatedCarbonKg,
        moneySavedInr: wallet.moneySavedInr + (analysisResult.estimatedCarbonKg * 15) // savings value ₹15 per kg CO2
      });

      // Increment receipt active missions progress
      const userMissions = mockFirebase.db.getMissions(user.id);
      const isUnplugMission = userMissions.find(m => m.id === 'mission_unplug');
      if (isUnplugMission) {
        mockFirebase.db.updateMissionProgress(user.id, 'mission_unplug', 1);
      }

      // Record FCM/Notification alert
      mockFirebase.db.addNotification(
        user.id,
        'Receipt Analyzed successfully! 📸',
        `Parsed ${analysisResult.detectedProducts.length} items. Estimated Carbon Saved: ${analysisResult.estimatedCarbonKg}kg.`,
        'mission'
      );

      refreshData();
      return savedAnalysis;
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = (notifId: string) => {
    if (!user) return;
    mockFirebase.db.markNotificationAsRead(user.id, notifId);
    refreshData();
  };

  const runWeeklyAIEvaluation = async (): Promise<WeeklyReport> => {
    if (!user) throw new Error('Unauthenticated user');
    setLoading(true);
    try {
      const hist = mockFirebase.db.getCarbonHistory(user.id);
      const report = await generateWeeklyReport(user, hist);
      
      const savedReport = mockFirebase.db.addWeeklyReport(user.id, {
        summary: report.summary,
        scoreChange: report.scoreChange,
        trends: report.trends,
        recommendations: report.recommendations
      });

      refreshData();
      return savedReport;
    } finally {
      setLoading(false);
    }
  };

  const addManualSavings = async (co2: number, electricity: number, fuel: number, water: number): Promise<SavingsWallet> => {
    if (!user) throw new Error('Unauthenticated user');
    const wallet = mockFirebase.db.getSavingsWallet(user.id);
    
    // Derived money saved formula
    const electricityCost = electricity * 8.00;
    const fuelCost = fuel * 103.00;
    const waterCost = water * 0.02;
    const co2SwapsVal = co2 * 10.0; // ₹10 per kg CO2 general swap

    const moneyDelta = electricityCost + fuelCost + waterCost + co2SwapsVal;

    const updated = mockFirebase.db.updateSavingsWallet(user.id, {
      co2SavedKg: wallet.co2SavedKg + co2,
      electricitySavedKwh: (wallet.electricitySavedKwh || 0) + electricity,
      fuelSavedLiters: (wallet.fuelSavedLiters || 0) + fuel,
      waterSavedLiters: (wallet.waterSavedLiters || 0) + water,
      moneySavedInr: wallet.moneySavedInr + moneyDelta
    });

    refreshData();
    return updated;
  };

  return (
    <EcoDataContext.Provider value={{
      carbonHistory,
      savingsWallet,
      missions,
      receipts,
      notifications,
      weeklyReports,
      globalForest,
      loading,
      refreshData,
      recordCarbonLog,
      triggerMissionProgress,
      uploadAndAnalyzeReceipt,
      markNotificationRead,
      runWeeklyAIEvaluation,
      addManualSavings
    }}>
      {children}
    </EcoDataContext.Provider>
  );
}

export function useEcoData() {
  const context = useContext(EcoDataContext);
  if (context === undefined) {
    throw new Error('useEcoData must be used within an EcoDataProvider');
  }
  return context;
}
