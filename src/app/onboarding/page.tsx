'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/hooks/useAuth';
import { OnboardingProfile } from '@/core/types/sustainability';
import { calculateEcoScore, calculateMonthlyEmissions } from '@/core/utils/carbon';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Fuel, Leaf, ArrowLeft, ArrowRight, Zap, Droplet, ShoppingBag, Trash2, Award } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

type Step = 'transport' | 'diet' | 'electricity' | 'water' | 'shopping' | 'waste' | 'complete';

export default function Onboarding() {
  const { user, submitOnboarding } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('transport');
  
  // Onboarding answers state
  const [profile, setProfile] = useState<OnboardingProfile>({
    transportation: 'combustion',
    diet: 'flexitarian',
    electricityMonthlyKwh: 180,
    waterMonthlyLiters: 6000,
    shoppingFrequency: 'average',
    wasteRecyclePercentage: 30,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/');
    } else if (user.sustainabilityProfile) {
      // If already has profile, bypass directly to dashboard
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) return null;

  // Real-time calculations as sliders update
  const currentEmissions = calculateMonthlyEmissions(profile);
  const totalMonthlyCo2 = Object.values(currentEmissions).reduce((a, b) => a + b, 0);
  const currentScore = calculateEcoScore(profile);

  const stepsList: Step[] = ['transport', 'diet', 'electricity', 'water', 'shopping', 'waste', 'complete'];
  const currentStepIndex = stepsList.indexOf(step);
  const progressPercent = Math.round((currentStepIndex / (stepsList.length - 1)) * 100);

  const handleNext = () => {
    const nextStepMap: Record<Step, Step> = {
      transport: 'diet',
      diet: 'electricity',
      electricity: 'water',
      water: 'shopping',
      shopping: 'waste',
      waste: 'complete',
      complete: 'complete'
    };
    
    const next = nextStepMap[step];
    setStep(next);

    if (next === 'complete') {
      canvasConfetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleBack = () => {
    const prevStepMap: Record<Step, Step> = {
      transport: 'transport',
      diet: 'transport',
      electricity: 'diet',
      water: 'electricity',
      shopping: 'water',
      waste: 'shopping',
      complete: 'waste'
    };
    setStep(prevStepMap[step]);
  };

  const handleFinish = async () => {
    await submitOnboarding(profile);
    router.push('/dashboard');
  };

  // Render question card contents based on active step
  const renderStepContent = () => {
    switch (step) {
      case 'transport':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Car className="w-5 h-5 mr-2 text-emerald-400" />
              <span>How do you usually commute?</span>
            </h2>
            <p className="text-xs text-muted-foreground">Select your primary mode of transportation.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {[
                { value: 'combustion', label: 'Petrol/Diesel Car', desc: 'Single commuter fossil fuel vehicle', icon: Fuel, color: 'text-red-400' },
                { value: 'hybrid', label: 'Hybrid Car', desc: 'Partial electric vehicle with combustion engine', icon: Car, color: 'text-orange-400' },
                { value: 'electric', label: 'Electric Vehicle (EV)', desc: 'Charged via standard electric grid', icon: Zap, color: 'text-emerald-400' },
                { value: 'public_transit', label: 'Public Transit / Bus / Metro', desc: 'Shared train, metro, or local bus systems', icon: Leaf, color: 'text-cyan-400' },
                { value: 'none', label: 'Walking / Bicycling / Work from Home', desc: 'Zero direct fuel burning or operations emissions', icon: Leaf, color: 'text-green-500' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setProfile({ ...profile, transportation: opt.value as any })}
                  className={`p-4 rounded-xl text-left border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    profile.transportation === opt.value
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-900/60 border-border hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <opt.icon className={`w-5 h-5 shrink-0 ${opt.color}`} />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{opt.label}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'diet':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Leaf className="w-5 h-5 mr-2 text-emerald-400" />
              <span>What best describes your diet habits?</span>
            </h2>
            <p className="text-xs text-muted-foreground">Food production accounts for up to 30% of global emissions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {[
                { value: 'meat_heavy', label: 'Meat Heavy', desc: 'Beef, pork, or poultry with almost every meal', color: 'text-red-400' },
                { value: 'flexitarian', label: 'Flexitarian / Balanced Diet', desc: 'Vegetables with occasional poultry or fish meals', color: 'text-orange-400' },
                { value: 'pescatarian', label: 'Pescatarian', desc: 'Seafood and fish based vegetarian diets', color: 'text-yellow-400' },
                { value: 'vegetarian', label: 'Vegetarian', desc: 'No meat, includes dairy and vegetable meals', color: 'text-cyan-400' },
                { value: 'vegan', label: 'Strict Vegan', desc: 'Completely plant-based, no animal products', color: 'text-emerald-400' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setProfile({ ...profile, diet: opt.value as any })}
                  className={`p-4 rounded-xl text-left border transition-all duration-200 focus:outline-none ${
                    profile.diet === opt.value
                      ? 'bg-emerald-500/10 border-emerald-500'
                      : 'bg-slate-900/60 border-border hover:bg-slate-800/60'
                  }`}
                >
                  <h4 className="text-sm font-semibold text-white">{opt.label}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'electricity':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-emerald-400" />
              <span>Electricity Consumption</span>
            </h2>
            <p className="text-xs text-muted-foreground">Estimate your typical monthly household electricity bill usage in Kilowatt-hours (kWh).</p>
            <div className="bg-slate-900/60 border border-border p-6 rounded-xl space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Monthly Usage:</span>
                <span className="font-extrabold text-emerald-400">{profile.electricityMonthlyKwh} kWh</span>
              </div>
              <input
                type="range"
                min="30"
                max="800"
                step="10"
                value={profile.electricityMonthlyKwh}
                onChange={(e) => setProfile({ ...profile, electricityMonthlyKwh: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>30 kWh (Studio)</span>
                <span>300 kWh (Medium House)</span>
                <span>800+ kWh (Luxury AC Villa)</span>
              </div>
            </div>
          </div>
        );

      case 'water':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Droplet className="w-5 h-5 mr-2 text-cyan-400" />
              <span>Water Consumption</span>
            </h2>
            <p className="text-xs text-muted-foreground">Typical water consumed per month. A typical family consumes around 6,000 to 12,000 Liters.</p>
            <div className="bg-slate-900/60 border border-border p-6 rounded-xl space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Monthly Water:</span>
                <span className="font-extrabold text-cyan-400">{profile.waterMonthlyLiters.toLocaleString()} Liters</span>
              </div>
              <input
                type="range"
                min="1000"
                max="30000"
                step="500"
                value={profile.waterMonthlyLiters}
                onChange={(e) => setProfile({ ...profile, waterMonthlyLiters: parseInt(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1,000 Liters</span>
                <span>12,000 Liters</span>
                <span>30,000+ Liters (Swimming pool)</span>
              </div>
            </div>
          </div>
        );

      case 'shopping':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-emerald-400" />
              <span>How frequently do you buy retail products?</span>
            </h2>
            <p className="text-xs text-muted-foreground">This estimates packaging and carbon transportation overheads.</p>
            <div className="grid grid-cols-1 gap-3 pt-2">
              {[
                { value: 'minimal', label: 'Minimalist (Rare Shopping)', desc: 'Only purchase essential food and clothing; repair items before replacement.' },
                { value: 'average', label: 'Moderate / Average', desc: 'Standard retail patterns, buying clothing or electronic accessories once or twice monthly.' },
                { value: 'frequent', label: 'Avid Consumer (Frequent Shopping)', desc: 'Regular shopping deliveries, buying the latest gadgets, fast fashion, and imports frequently.' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setProfile({ ...profile, shoppingFrequency: opt.value as any })}
                  className={`p-4 rounded-xl text-left border transition-all duration-200 focus:outline-none ${
                    profile.shoppingFrequency === opt.value
                      ? 'bg-emerald-500/10 border-emerald-500'
                      : 'bg-slate-900/60 border-border hover:bg-slate-800/60'
                  }`}
                >
                  <h4 className="text-sm font-semibold text-white">{opt.label}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'waste':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-emerald-400" />
              <span>Waste Segregation & Recycling</span>
            </h2>
            <p className="text-xs text-muted-foreground">What percentage of your recyclable garbage (paper, plastic, metal, composting) is actively segregated?</p>
            <div className="bg-slate-900/60 border border-border p-6 rounded-xl space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Recycled / Segregated:</span>
                <span className="font-extrabold text-emerald-400">{profile.wasteRecyclePercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={profile.wasteRecyclePercentage}
                onChange={(e) => setProfile({ ...profile, wasteRecyclePercentage: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0% (All to bin)</span>
                <span>50% (Eco-conscious)</span>
                <span>100% (Zero-Waste Ninja)</span>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-6 space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Award className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Sustainability Digital Twin Created!</h2>
              <p className="text-sm text-gray-300 max-w-sm mx-auto">
                We have generated your baseline. Your carbon trajectory is compiled based on standard Indian resource models.
              </p>
            </div>

            {/* Calculations Card */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="bg-slate-900 border border-border p-3.5 rounded-xl">
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">Estimated Baseline</span>
                <span className="text-xl font-black text-white">{Math.round(totalMonthlyCo2)} <span className="text-xs font-normal">kg CO₂e/mo</span></span>
              </div>
              <div className="bg-slate-900 border border-border p-3.5 rounded-xl">
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">Initial EcoScore</span>
                <span className="text-xl font-black text-emerald-400">{currentScore}<span className="text-xs text-gray-400 font-normal"> /100</span></span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-2xl mx-auto w-full">
      {/* Progress header */}
      <div className="w-full mb-8">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Sustainability Questionnaire</span>
          <span>Step {currentStepIndex + 1} of {stepsList.length}</span>
        </div>
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-border">
          <div 
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Form container */}
      <div className="w-full glass-panel border border-border p-8 rounded-2xl relative min-h-[420px] flex flex-col justify-between">
        {/* Animated Slide container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Buttons footer */}
        <div className="flex items-center justify-between border-t border-border pt-6 mt-6">
          {step !== 'transport' && step !== 'complete' ? (
            <button
              onClick={handleBack}
              className="flex items-center space-x-1.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step !== 'complete' ? (
            <button
              onClick={handleNext}
              className="bg-emerald-500 hover:bg-emerald-600 font-bold text-sm text-slate-950 px-5 py-2 rounded-lg flex items-center space-x-1 transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold text-sm text-slate-950 py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
            >
              <span>Activate Carbon Twin Dashboard</span>
              <Award className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
