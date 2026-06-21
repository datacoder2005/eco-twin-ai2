'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/hooks/useAuth';
import { useEcoData } from '@/core/hooks/useEcoData';
import { motion } from 'framer-motion';
import { 
  Leaf, Zap, Droplet, Flame, ShieldCheck, Compass, ArrowRight,
  TrendingDown, Sparkles, RefreshCw, Upload, AlertCircle, Award
} from 'lucide-react';
import Link from 'next/link';
import canvasConfetti from 'canvas-confetti';

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    carbonHistory, 
    savingsWallet, 
    missions, 
    globalForest,
    runWeeklyAIEvaluation,
    triggerMissionProgress,
    addManualSavings,
    loading 
  } = useEcoData();
  const router = useRouter();

  const [activeHistoryIndex, setActiveHistoryIndex] = useState(3);
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);


  // Guard routing
  useEffect(() => {
    if (!user) {
      router.push('/');
    } else if (!user.sustainabilityProfile) {
      router.push('/onboarding');
    }
  }, [user, router]);

  if (!user || carbonHistory.length === 0 || !savingsWallet) return null;

  const activeLog = carbonHistory[activeHistoryIndex] || carbonHistory[carbonHistory.length - 1];

  const handleTriggerScheduler = async () => {
    setSchedulerRunning(true);
    setReportSuccess(false);
    try {
      await runWeeklyAIEvaluation();
      setReportSuccess(true);
      canvasConfetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.8 }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSchedulerRunning(false);
    }
  };

  const handleIncrementMission = async (missionId: string) => {
    await triggerMissionProgress(missionId, 1);
    canvasConfetti({
      particleCount: 50,
      colors: ['#10b981', '#06b6d4', '#ffffff'],
      origin: { y: 0.7 }
    });
  };



  // SVG Chart points computation
  const chartHeight = 140;
  const chartWidth = 520;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 20;

  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...carbonHistory.map(h => h.totalEmissions)) * 1.15;
  
  const points = carbonHistory.map((h, i) => {
    const x = paddingLeft + (i / (carbonHistory.length - 1)) * usableWidth;
    const y = chartHeight - paddingBottom - (h.totalEmissions / maxVal) * usableHeight;
    return { x, y, data: h };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
    : '';

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Sustainability Dashboard</h1>
          <p className="text-sm text-gray-400">Welcome back, {user.displayName}! Track your carbon twin analytics below.</p>
        </div>

        {/* Streaks Banner */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-border px-4 py-2.5 rounded-xl">
          <div className="h-9 w-9 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
            <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Current Streak</span>
            <span className="text-sm font-bold text-white">{user.currentStreak || 0} Days Active</span>
          </div>
        </div>
      </div>

      {/* Grid: EcoScore & Savings Wallet */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* EcoScore card */}
        <div className="md:col-span-4 glass-panel border border-border p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">EcoScore Indicator</h3>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold">Active</span>
            </div>
            
            {/* Visual Circular ring */}
            <div className="flex items-center justify-center my-6">
              <div className="relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.04)" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    stroke="url(#emeraldGradient)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={301.6} 
                    strokeDashoffset={301.6 - (301.6 * (user.ecoScore || 70)) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black text-white">{user.ecoScore || 0}</span>
                  <span className="text-[10px] text-muted-foreground block">/ 100</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-4 text-center">
            <p className="text-[11px] text-gray-300">
              Your carbon emissions are <span className="text-emerald-400 font-semibold">41% below</span> the national average in India. Great job!
            </p>
          </div>
        </div>

        {/* Savings Wallet card */}
        <div className="md:col-span-8 glass-panel border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground flex items-center">
                <Compass className="w-4 h-4 mr-1 text-emerald-400" />
                <span>Carbon Savings Wallet</span>
              </h3>
              <span className="text-xs font-extrabold text-gradient-emerald">₹{savingsWallet.moneySavedInr.toLocaleString(undefined, { maximumFractionDigits: 1 })} Saved</span>
            </div>

            {/* Savings Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-border text-left">
                <Leaf className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">CO₂ Saved</span>
                <span className="text-lg font-black text-white block mt-0.5">{savingsWallet.co2SavedKg} <span className="text-[10px] font-normal text-gray-400">kg</span></span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-border text-left">
                <Zap className="w-4 h-4 text-yellow-400 mb-1" />
                <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Power Saved</span>
                <span className="text-lg font-black text-white block mt-0.5">{savingsWallet.electricitySavedKwh || 0} <span className="text-[10px] font-normal text-gray-400">kWh</span></span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-border text-left">
                <Droplet className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Water Saved</span>
                <span className="text-lg font-black text-white block mt-0.5">{savingsWallet.waterSavedLiters} <span className="text-[10px] font-normal text-gray-400">Liters</span></span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-border text-left">
                <Compass className="w-4 h-4 text-orange-400 mb-1" />
                <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Fuel Saved</span>
                <span className="text-lg font-black text-white block mt-0.5">{savingsWallet.fuelSavedLiters} <span className="text-[10px] font-normal text-gray-400">Liters</span></span>
              </div>
            </div>
          </div>

          {/* Quick Manual Carbon Offsets */}
          <div className="border-t border-border pt-4 mt-4 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-gray-300">Quick log daily saving offset:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  await addManualSavings(5, 10, 0, 0);
                  canvasConfetti({ particleCount: 40, spread: 30, origin: { y: 0.8 } });
                }}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                ⚡ +10 kWh Power
              </button>
              <button
                onClick={async () => {
                  await addManualSavings(15, 0, 5, 0);
                  canvasConfetti({ particleCount: 40, spread: 30, origin: { y: 0.8 } });
                }}
                className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                🚗 +5L Petrol (Walk)
              </button>
              <button
                onClick={async () => {
                  await addManualSavings(1, 0, 0, 50);
                  canvasConfetti({ particleCount: 40, spread: 30, origin: { y: 0.8 } });
                }}
                className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                💧 +50L Water
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Graph Trends vs Active Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Chart Card (8 cols) */}
        <div className="lg:col-span-8 glass-panel border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Carbon Footprint Trend</h3>
              <p className="text-xs text-muted-foreground">Select a week log point to view emission splits below.</p>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-950/60 p-1 border border-border rounded-lg text-xs text-gray-300">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-semibold">Weekly</span>
            </div>
          </div>

          {/* SVG Graph Drawing */}
          <div className="relative mt-6 h-[140px] w-full">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              {/* Grids */}
              <line x1={paddingLeft} y1={paddingTop} x2={chartWidth - paddingRight} y2={paddingTop} stroke="rgba(255,255,255,0.03)" />
              <line x1={paddingLeft} y1={chartHeight / 2} x2={chartWidth - paddingRight} y2={chartHeight / 2} stroke="rgba(255,255,255,0.03)" />
              <line x1={paddingLeft} y1={chartHeight - paddingBottom} x2={chartWidth - paddingRight} y2={chartHeight - paddingBottom} stroke="rgba(255,255,255,0.08)" />

              {/* Area fill */}
              {areaD && (
                <path 
                  d={areaD} 
                  fill="url(#areaGradient)" 
                  opacity="0.25"
                />
              )}

              {/* Path outline */}
              {pathD && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Data Node dots */}
              {points.map((pt, i) => {
                const isActive = activeHistoryIndex === i;
                return (
                  <g key={pt.data.id} className="cursor-pointer" onClick={() => setActiveHistoryIndex(i)}>
                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r={isActive ? 6 : 4} 
                      fill={isActive ? '#10b981' : '#0f172a'} 
                      stroke="#10b981" 
                      strokeWidth={isActive ? 3 : 2} 
                    />
                    {/* X-Axis labels */}
                    <text 
                      x={pt.x} 
                      y={chartHeight - 4} 
                      fill="rgba(255,255,255,0.4)" 
                      fontSize="9" 
                      textAnchor="middle"
                    >
                      {new Date(pt.data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </text>
                  </g>
                );
              })}

              {/* Gradient defs */}
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Log point splits */}
          <div className="border-t border-border pt-4 mt-4 grid grid-cols-5 gap-2 text-center">
            {[
              { label: 'Travel', value: activeLog.categories.transportation, color: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5' },
              { label: 'Energy', value: activeLog.categories.energy, color: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5' },
              { label: 'Food', value: activeLog.categories.food, color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
              { label: 'Shopping', value: activeLog.categories.shopping, color: 'border-purple-500/20 text-purple-400 bg-purple-500/5' },
              { label: 'Waste', value: activeLog.categories.waste, color: 'border-orange-500/20 text-orange-400 bg-orange-500/5' },
            ].map(cat => (
              <div key={cat.label} className={`border p-2 rounded-xl ${cat.color}`}>
                <span className="text-[9px] uppercase tracking-wider font-bold block opacity-85">{cat.label}</span>
                <span className="text-xs font-black block mt-0.5">{cat.value} <span className="text-[9px] font-normal">kg</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Missions Panel (4 cols) */}
        <div className="lg:col-span-4 glass-panel border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Flame className="w-4 h-4 mr-1.5 text-orange-400 fill-orange-400" />
                <span>Active Missions</span>
              </h3>
              <span className="text-[10px] text-muted-foreground">{missions.filter(m => m.status === 'completed').length} / {missions.length} completed</span>
            </div>

            {/* List */}
            <div className="space-y-3 mt-4">
              {missions.slice(0, 3).map((mission) => {
                const isComplete = mission.status === 'completed';
                return (
                  <div key={mission.id} className="p-3 bg-slate-900/60 rounded-xl border border-border flex flex-col justify-between space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`text-xs font-semibold ${isComplete ? 'line-through text-gray-500' : 'text-white'}`}>{mission.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{mission.description}</p>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 shrink-0">+{mission.xpReward} XP</span>
                    </div>

                    {/* Progress Slider */}
                    <div className="flex items-center space-x-3 pt-1">
                      <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-border">
                        <div 
                          className="bg-emerald-500 h-1.5 rounded-full" 
                          style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 shrink-0">{mission.progress}/{mission.target}</span>
                      
                      {!isComplete && (
                        <button
                          onClick={() => handleIncrementMission(mission.id)}
                          className="text-[9px] font-bold bg-slate-800 hover:bg-slate-700 text-white px-2 py-0.5 rounded border border-border"
                        >
                          +1
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            href="/missions"
            className="w-full text-center block bg-slate-900 border border-border text-xs text-gray-300 font-semibold py-2 rounded-xl hover:bg-slate-800/80 transition-colors mt-4"
          >
            Manage Challenges & Badges
          </Link>
        </div>

      </div>

      {/* Grid: Virtual Forest Progress & Cloud Run Scheduler Simulation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Global Virtual Forest Status */}
        {globalForest && (
          <div className="glass-panel border border-border p-6 rounded-2xl flex items-center justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                Community Forest
              </div>
              <h3 className="text-lg font-extrabold text-white">Collective Environmental Impact</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Every carbon savings wallet update contributes to our global community forest milestones. 
                Currently at <strong className="text-emerald-400">Milestone Level {globalForest.milestoneLevel}</strong>!
              </p>
              <div className="pt-2 text-xs text-white">
                🌳 Virtual Trees Planted: <span className="font-black text-emerald-400">{globalForest.totalTreesEquivalent.toLocaleString()}</span>
              </div>
            </div>

            {/* Tree visual graphic */}
            <div className="text-right shrink-0">
              <span className="text-5xl block animate-float">🌲</span>
              <span className="text-[10px] text-muted-foreground block mt-1">Level {globalForest.milestoneLevel} Tree</span>
            </div>
          </div>
        )}

        {/* Mock Cloud Scheduler Cron Simulator */}
        <div className="glass-panel border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center">
              <RefreshCw className={`w-4 h-4 mr-1.5 text-cyan-400 ${schedulerRunning ? 'animate-spin' : ''}`} />
              <span>Simulate Cloud Scheduler Cron</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Trigger a mock weekly cron workflow. Cloud Scheduler runs a Cloud Run endpoint to retrieve user histories, generate weekly analytical reports using Gemini, save to reports, and trigger push alerts.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
            {reportSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1" />
                <span>Weekly report saved & push notification sent!</span>
              </span>
            ) : (
              <div />
            )}
            <button
              onClick={handleTriggerScheduler}
              disabled={schedulerRunning}
              className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-800 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              {schedulerRunning ? 'Processing Cloud Run Job...' : 'Run Weekly Report Job'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
