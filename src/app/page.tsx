'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/hooks/useAuth';
import { motion } from 'framer-motion';
import { ShieldCheck, Leaf, Sparkles, TrendingDown, ArrowRight, Eye, ShieldAlert, Cpu } from 'lucide-react';

export default function Home() {
  const { user, signIn, signUp, loading } = useAuth();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // If already logged in, redirect straight to dashboard (or onboarding)
  useEffect(() => {
    if (user) {
      if (user.sustainabilityProfile) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg('');
    setAuthLoading(true);

    try {
      if (isSignUp) {
        if (!name) {
          setErrorMsg('Please enter your name.');
          setAuthLoading(false);
          return;
        }
        const newUser = await signUp(email, name);
        router.push('/onboarding');
      } else {
        const existingUser = await signIn(email);
        if (existingUser.sustainabilityProfile) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center relative px-4 py-12 md:py-24 max-w-7xl mx-auto w-full z-10">
      {/* Background ambient lighting */}
      <div className="absolute top-24 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-24 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left side: Value Pitch */}
        <div className="lg:col-span-7 flex flex-col text-left space-y-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-400 w-fit">
            <Sparkles className="w-4 h-4 animate-glow" />
            <span>AI-Powered Sustainability Digital Twin</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Predict & Track Your <br />
            <span className="text-gradient-emerald">Carbon Trajectory</span>
          </h1>

          <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
            Meet <strong className="text-emerald-400">EcoTwin AI</strong>. Go beyond manual logs. Visualize your daily resource footprints, forecast monthly trajectories via Vertex AI models, and run simulation offsets in real time.
          </p>

          {/* Innovation Section: Why Different */}
          <div className="glass-panel border border-border p-5 rounded-xl space-y-4 max-w-xl">
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Why EcoTwin AI is Different</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Traditional carbon trackers tell users what happened in the past. 
              <strong> EcoTwin AI predicts what will happen in the future</strong>. 
              By simulating a carbon digital twin powered by Gemini, you compare your current trajectory against optimized futures, project community-wide impacts, and deploy customized actions.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground block">Twin Trajectory</span>
                <span className="text-sm font-bold text-emerald-400">Predictive</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground block">Global Scale</span>
                <span className="text-sm font-bold text-cyan-400">1M Simulator</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground block">Receipt Vision</span>
                <span className="text-sm font-bold text-purple-400">Gemini scan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Login Card */}
        <div className="lg:col-span-5 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md glass-panel-glow p-8 rounded-2xl relative"
          >
            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-extrabold text-white">
                {isSignUp ? 'Create your Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isSignUp ? 'Get started with EcoTwin AI by creating a profile.' : 'Sign in using your account credentials.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-bold text-gray-300">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/80 border border-border focus:border-emerald-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-bold text-gray-300">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-border focus:border-emerald-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center space-x-1.5 text-xs text-red-400 bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading || loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all font-bold text-sm text-slate-950 py-2.5 rounded-lg flex items-center justify-center space-x-1 shadow-lg shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <span>{authLoading ? 'Signing In...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Google Authentication Demonstration Notice */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <span className="relative bg-slate-950/80 border border-border px-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider rounded">
                Or Sandbox Sign In
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setEmail('demo@ecotwin.ai');
                setName('Demo User');
                setIsSignUp(false);
                signIn('demo@ecotwin.ai');
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-border text-xs font-semibold text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>🌱 Auto-fill & Launch Demo Account</span>
            </button>

            {/* Toggle footer */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                }}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
