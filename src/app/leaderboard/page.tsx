'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/hooks/useAuth';
import { useEcoData } from '@/core/hooks/useEcoData';
import { mockFirebase } from '@/core/services/firebase';
import { LeaderboardEntry } from '@/core/types/sustainability';
import { Award, ShieldCheck, Star, ArrowUpRight, Flame, Leaf } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const { refreshData } = useEcoData();
  const router = useRouter();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filterMode, setFilterMode] = useState<'score' | 'co2'>('score');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Load leaderboard entries
    const entries = mockFirebase.db.getLeaderboard();
    setLeaderboard(entries);
  }, [user, router]);

  if (!user) return null;

  // Sorting
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (filterMode === 'score') {
      return b.ecoScore - a.ecoScore;
    } else {
      return b.co2SavedKg - a.co2SavedKg;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
            <Award className="w-7 h-7 mr-2 text-emerald-400" />
            <span>Global Leaderboard</span>
          </h1>
          <p className="text-sm text-gray-400">See how you rank against other eco-citizens in India based on sustainability scores and carbon offsets.</p>
        </div>

        {/* Filter Toggles */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 border border-border rounded-xl w-fit">
          <button
            onClick={() => setFilterMode('score')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'score' 
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sort by EcoScore
          </button>
          <button
            onClick={() => setFilterMode('co2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'co2' 
                ? 'bg-emerald-500 text-slate-950' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sort by CO₂ Saved
          </button>
        </div>
      </div>

      {/* Leaderboard Table Grid */}
      <div className="glass-panel border border-border rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-6 py-4 bg-slate-950 border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
          <div className="col-span-2">Rank</div>
          <div className="col-span-5">Citizen</div>
          <div className="col-span-2 text-center">User Level</div>
          <div className="col-span-3 text-right">
            {filterMode === 'score' ? 'EcoScore' : 'CO₂ Saved'}
          </div>
        </div>

        {/* List entries */}
        <div className="divide-y divide-border">
          {sortedLeaderboard.map((entry, index) => {
            const isCurrentUser = entry.userId === user.id;
            const rank = index + 1;
            
            return (
              <div 
                key={entry.userId}
                className={`grid grid-cols-12 gap-2 px-6 py-4 items-center text-xs sm:text-sm transition-colors ${
                  isCurrentUser 
                    ? 'bg-emerald-500/5 border-l-4 border-l-emerald-500' 
                    : 'hover:bg-slate-900/40'
                }`}
              >
                {/* Rank */}
                <div className="col-span-2 flex items-center space-x-1">
                  {rank === 1 && <span className="text-lg">🥇</span>}
                  {rank === 2 && <span className="text-lg">🥈</span>}
                  {rank === 3 && <span className="text-lg">🥉</span>}
                  {rank > 3 && <span className="font-bold text-gray-400 pl-1">{rank}</span>}
                </div>

                {/* Profile */}
                <div className="col-span-5 flex items-center space-x-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="h-8 w-8 rounded-full border border-border"
                    src={entry.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                    alt={entry.displayName}
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-white truncate block flex items-center">
                      <span>{entry.displayName}</span>
                      {isCurrentUser && (
                        <span className="ml-1.5 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold uppercase">
                          You
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Level */}
                <div className="col-span-2 text-center font-semibold text-gray-300">
                  Level {entry.level}
                </div>

                {/* Value */}
                <div className="col-span-3 text-right font-black">
                  {filterMode === 'score' ? (
                    <span className="text-emerald-400">{entry.ecoScore} <span className="text-[10px] text-gray-500 font-normal">/100</span></span>
                  ) : (
                    <span className="text-cyan-400">{entry.co2SavedKg} <span className="text-[10px] text-gray-500 font-normal">kg CO₂</span></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
