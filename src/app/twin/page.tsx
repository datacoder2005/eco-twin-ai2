'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/hooks/useAuth';
import { useEcoData } from '@/core/hooks/useEcoData';
import { generateDigitalTwinForecast } from '@/core/services/gemini';
import { motion } from 'framer-motion';
import { Eye, ShieldAlert, Cpu, Award, Zap, Compass, Leaf, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CarbonTwin() {
  const { user } = useAuth();
  const { carbonHistory } = useEcoData();
  const router = useRouter();

  const [loadingForecast, setLoadingForecast] = useState(true);
  const [forecast, setForecast] = useState<{
    currentFuture: number[];
    optimizedFuture: number[];
    differenceKg: number;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    async function loadForecast() {
      if (!user) return;
      try {
        const data = await generateDigitalTwinForecast(user, carbonHistory);
        setForecast(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingForecast(false);
      }
    }

    loadForecast();
  }, [user, carbonHistory, router]);

  if (!user || carbonHistory.length === 0) return null;

  // Chart variables
  const chartHeight = 160;
  const chartWidth = 560;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 25;

  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Points computation
  const makePoints = (data: number[]) => {
    const maxVal = Math.max(...(forecast?.currentFuture || [300])) * 1.15;
    return data.map((val, i) => {
      const x = paddingLeft + (i / 11) * usableWidth;
      const y = chartHeight - paddingBottom - (val / maxVal) * usableHeight;
      return { x, y, val };
    });
  };

  const currentPoints = forecast ? makePoints(forecast.currentFuture) : [];
  const optimizedPoints = forecast ? makePoints(forecast.optimizedFuture) : [];

  const currentD = currentPoints.length > 0 
    ? `M ${currentPoints[0].x} ${currentPoints[0].y} ` + currentPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const optimizedD = optimizedPoints.length > 0
    ? `M ${optimizedPoints[0].x} ${optimizedPoints[0].y} ` + optimizedPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
          <Eye className="w-7 h-7 mr-2 text-emerald-400" />
          <span>My AI Carbon Twin</span>
        </h1>
        <p className="text-sm text-gray-400">Compare your Current Future trajectory against your Optimized Future trajectory based on Vertex AI model models.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Twin Forecast Charts (8 cols) */}
        <div className="lg:col-span-8 glass-panel border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">12-Month Projected Trajectory</h3>
            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center text-red-400">
                <span className="w-2.5 h-2.5 bg-red-400 rounded-full mr-1.5" />
                Current Future
              </span>
              <span className="flex items-center text-emerald-400">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full mr-1.5" />
                Optimized Future
              </span>
            </div>
          </div>

          {loadingForecast ? (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center space-y-2">
                <RefreshCwIcon className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground">Running digital twin predictive models...</p>
              </div>
            </div>
          ) : (
            <div className="relative mt-6 h-[180px] w-full">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                {/* Horizontal grid lines */}
                <line x1={paddingLeft} y1={paddingTop} x2={chartWidth - paddingRight} y2={paddingTop} stroke="rgba(255,255,255,0.03)" />
                <line x1={paddingLeft} y1={chartHeight / 2} x2={chartWidth - paddingRight} y2={chartHeight / 2} stroke="rgba(255,255,255,0.03)" />
                <line x1={paddingLeft} y1={chartHeight - paddingBottom} x2={chartWidth - paddingRight} y2={chartHeight - paddingBottom} stroke="rgba(255,255,255,0.08)" />

                {/* Current Future Path */}
                {currentD && (
                  <path d={currentD} fill="none" stroke="#f87171" strokeWidth="2.5" strokeDasharray="4 3" strokeLinecap="round" />
                )}

                {/* Optimized Future Path */}
                {optimizedD && (
                  <path d={optimizedD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                )}

                {/* Month labels */}
                {months.map((m, i) => {
                  const x = paddingLeft + (i / 11) * usableWidth;
                  return (
                    <text 
                      key={m} 
                      x={x} 
                      y={chartHeight - 4} 
                      fill="rgba(255,255,255,0.4)" 
                      fontSize="9" 
                      textAnchor="middle"
                    >
                      {m}
                    </text>
                  );
                })}
              </svg>
            </div>
          )}

          <div className="border-t border-border pt-4 mt-4 text-xs text-gray-300">
            💡 **How the prediction works**: The **Current Future** model projects your carbon trend if you maintain your onboarding habits. The **Optimized Future** model assumes gradual adoption of active missions and simulator offsets.
          </div>
        </div>

        {/* Right Side: Projections and Risk Cards (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
          
          {/* Savings potential card */}
          {forecast && (
            <div className="glass-panel border border-border p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl" />
              <Cpu className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">CO₂ Savings Potential</h3>
              <span className="text-2xl font-black text-white block mt-1">
                {forecast.differenceKg.toLocaleString()} <span className="text-xs font-normal text-emerald-400">kg CO₂e/yr</span>
              </span>
              <p className="text-[11px] text-gray-400 mt-2">
                By aligning your habits with the EcoTwin optimization plan, you save equivalent carbon emissions of planting **{Math.round(forecast.differenceKg / 22)} trees** this year.
              </p>
            </div>
          )}

          {/* Risk Indicator Card */}
          <div className="glass-panel border border-border p-6 rounded-2xl bg-gradient-to-br from-red-500/5 to-transparent flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-xs uppercase tracking-wider font-bold text-red-400">Carbon Risk Indicators</h3>
              </div>
              <ul className="space-y-2 mt-4 text-[11px] text-gray-300">
                <li className="flex items-start space-x-1.5">
                  <span className="text-red-400 font-bold shrink-0">•</span>
                  <span><strong>Transportation Peak</strong>: Combustion commutes currently drive 68% of your transportation risk index.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-red-400 font-bold shrink-0">•</span>
                  <span><strong>Vampire Power Loss</strong>: Inactive devices left connected in standby contribute an estimated 25kg/mo of waste.</span>
                </li>
              </ul>
            </div>

            <Link
              href="/simulator"
              className="w-full text-center bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-colors mt-6"
            >
              <span>Optimize Twin via Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
