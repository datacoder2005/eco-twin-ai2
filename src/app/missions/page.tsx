'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/hooks/useAuth';
import { useEcoData } from '@/core/hooks/useEcoData';
import { Award, Flame, Leaf, Compass, ArrowRight, Zap, Target, Star } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

export default function EcoMissions() {
  const { user } = useAuth();
  const { missions, triggerMissionProgress } = useEcoData();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) return null;

  const handleIncrement = async (missionId: string) => {
    await triggerMissionProgress(missionId, 1);
    canvasConfetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.6 }
    });
  };

  // Mock list of all potential badges
  const badgeDatabase = [
    { name: 'Onboarding Graduate', desc: 'Completed the baseline habits questionnaire.', icon: Star, unlocked: !!user.sustainabilityProfile, color: 'text-yellow-400 bg-yellow-500/10' },
    { name: '7-Day Eco Warrior', desc: 'Maintained a 7-day sustainability streak.', icon: Flame, unlocked: user.currentStreak >= 7, color: 'text-orange-400 bg-orange-500/10' },
    { name: 'First Audit', desc: 'Uploaded and analyzed your first retail checkout receipt.', icon: Compass, unlocked: user.xp > 150, color: 'text-purple-400 bg-purple-500/10' },
    { name: 'Level 2 Specialist', desc: 'Reached user level 2 or above.', icon: Award, unlocked: user.level >= 2, color: 'text-cyan-400 bg-cyan-500/10' },
    { name: 'Level 5 Commander', desc: 'Reached user level 5 or above.', icon: Award, unlocked: user.level >= 5, color: 'text-emerald-400 bg-emerald-500/10' },
    { name: 'Zero-Waste Champion', desc: 'Maintained a waste recycling profile above 80%.', icon: Leaf, unlocked: (user.sustainabilityProfile?.wasteRecyclePercentage || 0) >= 80, color: 'text-green-400 bg-green-500/10' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
          <Award className="w-7 h-7 mr-2 text-emerald-400 animate-glow" />
          <span>Eco Missions & Badges</span>
        </h1>
        <p className="text-sm text-gray-400">Complete AI-generated challenges, unlock achievement badges, and level up your sustainability ranking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: XP Rank and Missions List (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* XP Rank Tracker */}
          <div className="glass-panel border border-border p-6 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Current Standing</span>
                <h3 className="text-xl font-extrabold text-white">Level {user.level} Sustainability Specialist</h3>
                <p className="text-xs text-gray-400 mt-1">Earn XP by completing missions and scanning store receipts.</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-white">{user.xp} <span className="text-xs font-normal text-muted-foreground">Total XP</span></span>
              </div>
            </div>
            
            {/* XP progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs font-bold text-emerald-400 mb-1.5">
                <span>XP Progress</span>
                <span>{user.xp % 1000} / 1000 XP</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-border">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${(user.xp % 1000) / 10}%` }}
                />
              </div>
            </div>
          </div>

          {/* Missions List */}
          <div className="glass-panel border border-border p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border pb-3 flex items-center">
              <Target className="w-4.5 h-4.5 mr-1.5 text-emerald-400" />
              <span>Active Challenges</span>
            </h3>

            <div className="space-y-4">
              {missions.map((mission) => {
                const isComplete = mission.status === 'completed';
                return (
                  <div key={mission.id} className="p-4 bg-slate-900/60 rounded-xl border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-bold ${isComplete ? 'line-through text-gray-500' : 'text-white'}`}>{mission.title}</h4>
                        {isComplete && (
                          <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-bold uppercase">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 leading-snug">{mission.description}</p>
                    </div>

                    {/* Progress Slider */}
                    <div className="flex items-center space-x-4 w-full md:w-fit shrink-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-muted-foreground">{mission.progress} / {mission.target}</span>
                        <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden border border-border">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      {!isComplete ? (
                        <button
                          onClick={() => handleIncrement(mission.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-border"
                        >
                          Log Progress
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">
                          +{mission.xpReward} XP Awarded
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Badges Grid (4 cols) */}
        <div className="lg:col-span-4 glass-panel border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border pb-3">Sustainability Badges</h3>
            <div className="grid grid-cols-1 gap-3 mt-4">
              {badgeDatabase.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={badge.name} 
                    className={`p-3 rounded-xl border flex items-center space-x-3 transition-opacity ${
                      badge.unlocked ? 'opacity-100 border-border bg-slate-900/60' : 'opacity-40 border-dashed border-border'
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center border ${
                      badge.unlocked ? badge.color : 'text-gray-500 bg-slate-950 border-border'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{badge.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
