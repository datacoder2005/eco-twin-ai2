'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/hooks/useAuth';
import { useEcoData } from '@/core/hooks/useEcoData';
import { calculateGlobalScaleImpact } from '@/core/utils/carbon';
import { Compass, Sparkles, Award, Globe, Leaf, Zap, Droplet, Fuel } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

export default function CarbonSimulator() {
  const { user } = useAuth();
  const { savingsWallet, addManualSavings } = useEcoData();
  const router = useRouter();

  // Slider inputs state
  const [electricCommutePct, setElectricCommutePct] = useState(20);
  const [meatFreeMealsWeek, setMeatFreeMealsWeek] = useState(3);
  const [energySavingKwh, setEnergySavingKwh] = useState(40);
  const [shoppingReductionPct, setShoppingReductionPct] = useState(15);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) return null;

  // Real-time calculations:
  // Let's derive individual savings from sliders
  // 1. Commute: Electric vs Combustion savings. Combustion baseline is 220kg CO2/mo. Replacing it saves CO2.
  // 1% electric commute saves ~1.5kg CO2 and ~0.2 Liters fuel.
  const individualCo2SavedCommute = (electricCommutePct / 100) * 120; // max 120kg CO2 saved
  const individualFuelSaved = (electricCommutePct / 100) * 45; // max 45 Liters petrol saved

  // 2. Diet: Swapping meals to vegetarian saves ~2.5kg CO2 per meal.
  const individualCo2SavedDiet = meatFreeMealsWeek * 2.5 * 4.3; // meals * kg * weeks/mo (max 225kg CO2)
  const individualWaterSavedDiet = meatFreeMealsWeek * 150 * 4.3; // 150 Liters saved per meatless meal

  // 3. Electricity: 1 kWh = 0.82kg CO2
  const individualCo2SavedEnergy = energySavingKwh * 0.82;
  const individualElectricitySaved = energySavingKwh;

  // 4. Shopping: 1% reduction saves ~1.5kg CO2
  const individualCo2SavedShopping = (shoppingReductionPct / 100) * 80;

  // Totals
  const totalCo2Saved = parseFloat((individualCo2SavedCommute + individualCo2SavedDiet + individualCo2SavedEnergy + individualCo2SavedShopping).toFixed(1));
  const totalWaterSaved = Math.round(individualWaterSavedDiet);
  const totalFuelSaved = Math.round(individualFuelSaved);

  // Derived financial savings formula (INR)
  // fuel: ₹103/L, electricity: ₹8/kWh, water: ₹0.02/L, shopping/diet: ₹150 per swap (derived by calculations)
  const moneyCommute = totalFuelSaved * 103.00;
  const moneyElectricity = individualElectricitySaved * 8.00;
  const moneyWater = totalWaterSaved * 0.02;
  const moneySwaps = (meatFreeMealsWeek * 4.3 + (shoppingReductionPct / 10)) * 150; // swappings value
  
  const totalMoneySavedInr = Math.round(moneyCommute + moneyElectricity + moneyWater + moneySwaps);

  // Global Scale Multiplier (1 Million Citizens!)
  const globalImpact = calculateGlobalScaleImpact(totalCo2Saved, totalWaterSaved);

  // Milestone check for visual earth glow
  // Level 1: <100k Tons, Level 2: 100k-200k, Level 3: 200k+
  const milestoneLevel = globalImpact.co2SavedTons < 100000 
    ? 1 
    : globalImpact.co2SavedTons < 220000 
      ? 2 
      : 3;

  const handleApplySimulatorToWallet = async () => {
    // Record current simulator savings to active wallet
    await addManualSavings(
      totalCo2Saved,
      individualElectricitySaved,
      totalFuelSaved,
      totalWaterSaved
    );
    canvasConfetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
          <Globe className="w-7 h-7 mr-2 text-emerald-400 animate-pulse" />
          <span>Future Earth Simulator</span>
        </h1>
        <p className="text-sm text-gray-400">Simulate changes to your lifestyle habits. View your individual savings in INR and project the planetary impact if 1 million citizens followed your plan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Interactive Sliders (7 cols) */}
        <div className="lg:col-span-7 glass-panel border border-border p-6 rounded-2xl space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border pb-3">Lifestyle Adjustments</h3>

          {/* Electric commute */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-300 flex items-center">
                <Fuel className="w-4 h-4 mr-1.5 text-orange-400" />
                <span>EV / Electric Commuting Ratio</span>
              </span>
              <span className="font-extrabold text-emerald-400">{electricCommutePct}% of commutes</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={electricCommutePct}
              onChange={(e) => setElectricCommutePct(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg appearance-none"
            />
          </div>

          {/* Meat-free meals */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-300 flex items-center">
                <Leaf className="w-4 h-4 mr-1.5 text-emerald-400" />
                <span>Meat-free Meals</span>
              </span>
              <span className="font-extrabold text-emerald-400">{meatFreeMealsWeek} meals / week</span>
            </div>
            <input
              type="range"
              min="0"
              max="21"
              step="1"
              value={meatFreeMealsWeek}
              onChange={(e) => setMeatFreeMealsWeek(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg appearance-none"
            />
          </div>

          {/* Electricity saving */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-300 flex items-center">
                <Zap className="w-4 h-4 mr-1.5 text-yellow-400" />
                <span>Home Power Reduction</span>
              </span>
              <span className="font-extrabold text-emerald-400">{energySavingKwh} kWh saved / mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="5"
              value={energySavingKwh}
              onChange={(e) => setEnergySavingKwh(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg appearance-none"
            />
          </div>

          {/* Shopping reduction */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-300 flex items-center">
                <Compass className="w-4 h-4 mr-1.5 text-purple-400" />
                <span>Shopping Consumption Cut</span>
              </span>
              <span className="font-extrabold text-emerald-400">{shoppingReductionPct}% reduction</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={shoppingReductionPct}
              onChange={(e) => setShoppingReductionPct(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg appearance-none"
            />
          </div>

          {/* Action buttons */}
          <div className="border-t border-border pt-4 flex justify-between items-center">
            <div className="text-left">
              <span className="text-[10px] text-muted-foreground uppercase block font-bold">Individual Savings</span>
              <span className="text-base font-black text-white">₹{totalMoneySavedInr.toLocaleString()}/mo</span>
            </div>
            <button
              onClick={handleApplySimulatorToWallet}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <span>Add Savings to My Wallet</span>
              <Award className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Planetary Scale Global Impact & Visual Earth (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          {/* Earth rendering container card */}
          <div className="glass-panel border border-border p-6 rounded-2xl text-center relative overflow-hidden flex-1 flex flex-col justify-center items-center">
            
            {/* Visual Globe that grows greener based on milestoneLevel */}
            <div className="relative flex items-center justify-center my-4">
              {/* Globe animation background glow */}
              <div className={`absolute w-32 h-32 rounded-full blur-3xl opacity-35 transition-colors duration-1000 ${
                milestoneLevel === 1 
                  ? 'bg-blue-500' 
                  : milestoneLevel === 2 
                    ? 'bg-cyan-500' 
                    : 'bg-emerald-500 animate-glow'
              }`} />
              <span className="text-7xl block animate-float">🌍</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Planetary Impact Level {milestoneLevel}</h3>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                If 1,000,000 citizens in India committed to your exact settings, we would achieve these collective outcomes annually:
              </p>
            </div>

            {/* Global statistics splits */}
            <div className="grid grid-cols-3 gap-2 w-full mt-6 text-left">
              <div className="bg-slate-900/60 border border-border p-2.5 rounded-xl">
                <Leaf className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-[8px] uppercase tracking-wider font-bold text-muted-foreground block">CO₂ Reduced</span>
                <span className="text-xs font-black text-white">{globalImpact.co2SavedTons.toLocaleString()} <span className="text-[9px] font-normal text-emerald-400">t/yr</span></span>
              </div>
              <div className="bg-slate-900/60 border border-border p-2.5 rounded-xl">
                <Leaf className="w-4 h-4 text-green-400 mb-1" />
                <span className="text-[8px] uppercase tracking-wider font-bold text-muted-foreground block">Trees Planted</span>
                <span className="text-xs font-black text-white">{globalImpact.treesEquivalent.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900/60 border border-border p-2.5 rounded-xl">
                <Droplet className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="text-[8px] uppercase tracking-wider font-bold text-muted-foreground block">Water Saved</span>
                <span className="text-xs font-black text-white">{(globalImpact.waterSavedLiters / 1000000).toFixed(1)} <span className="text-[9px] font-normal text-cyan-400">ML</span></span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
