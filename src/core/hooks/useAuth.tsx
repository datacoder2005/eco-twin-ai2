'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, OnboardingProfile } from '../types/sustainability';
import { mockFirebase } from '../services/firebase';
import { calculateEcoScore, calculateMonthlyEmissions } from '../utils/carbon';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string) => Promise<UserProfile>;
  signUp: (email: string, name: string) => Promise<UserProfile>;
  signOut: () => void;
  submitOnboarding: (profile: OnboardingProfile) => Promise<UserProfile>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    const currentUser = mockFirebase.auth.getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    refreshUser();
    setLoading(false);
  }, []);

  const signIn = async (email: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const u = mockFirebase.auth.signIn(email);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, name: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const u = mockFirebase.auth.signUp(email, name);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    mockFirebase.auth.signOut();
    setUser(null);
  };

  const submitOnboarding = async (profile: OnboardingProfile): Promise<UserProfile> => {
    if (!user) throw new Error('No authenticated user');
    setLoading(true);
    try {
      const score = calculateEcoScore(profile);
      const emissions = calculateMonthlyEmissions(profile);
      
      // Update profile and score
      const updatedUser = mockFirebase.db.updateUserProfile(user.id, {
        sustainabilityProfile: profile,
        ecoScore: score,
        xp: 150, // Onboarding completion bonus
        level: 1
      });

      // Add initial carbon log based on onboarding estimates
      mockFirebase.db.addCarbonLog(user.id, emissions, score);

      // Trigger welcome notifications
      mockFirebase.db.addNotification(
        user.id,
        'Sustainability Profile Active! 📈',
        `Welcome to your Carbon Twin! Your initial EcoScore is ${score}/100. Let's start saving.`,
        'streak'
      );

      setUser(updatedUser);
      return updatedUser;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, submitOnboarding, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
