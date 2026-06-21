'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/hooks/useAuth';
import { useEcoData } from '@/core/hooks/useEcoData';
import { WeeklyReport } from '@/core/types/sustainability';
import { FileText, Calendar, Sparkles, RefreshCw, ChevronDown, ChevronUp, AlertCircle, TrendingUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import canvasConfetti from 'canvas-confetti';

export default function WeeklyReports() {
  const { user } = useAuth();
  const { weeklyReports, runWeeklyAIEvaluation, loading } = useEcoData();
  const router = useRouter();

  const [generating, setGenerating] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) return null;

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const newReport = await runWeeklyAIEvaluation();
      setExpandedReportId(newReport.id);
      canvasConfetti({
        particleCount: 100,
        spread: 50,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedReportId(expandedReportId === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
            <FileText className="w-7 h-7 mr-2 text-emerald-400" />
            <span>AI Weekly Carbon Reports</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Review historic weekly carbon audits and advice compiled by Gemini 2.5 models.</p>
        </div>

        {/* Generate Trigger */}
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 focus:outline-none"
        >
          {generating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing History...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Weekly AI Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Reports Stack */}
      <div className="space-y-4">
        {weeklyReports.length === 0 ? (
          <div className="glass-panel border border-border rounded-2xl p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">No Reports Compiled</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Weekly reports are generated automatically by Cloud Scheduler cron triggers. Click "Run Weekly AI Audit" above to compile your first report.
              </p>
            </div>
          </div>
        ) : (
          weeklyReports.map((report) => {
            const isExpanded = expandedReportId === report.id;
            const isPositive = report.scoreChange >= 0;
            return (
              <div 
                key={report.id}
                className={`glass-panel border rounded-2xl transition-colors duration-200 overflow-hidden ${
                  isExpanded ? 'border-emerald-500/30' : 'border-border hover:border-slate-800'
                }`}
              >
                {/* Header card info */}
                <button
                  type="button"
                  onClick={() => toggleExpand(report.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-9 w-9 bg-slate-900 border border-border rounded-xl flex items-center justify-center shrink-0 text-emerald-400">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        Carbon Audit for week of {new Date(report.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </h4>
                      <p className="text-[10px] text-muted-foreground truncate max-w-sm sm:max-w-md mt-0.5">{report.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 pl-2">
                    {/* Score change badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isPositive 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {isPositive ? '+' : ''}{report.scoreChange} Score
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-border bg-slate-900/40"
                    >
                      <div className="p-6 space-y-4 text-xs sm:text-sm text-gray-300">
                        {/* Analytical Summary */}
                        <div className="space-y-1">
                          <h5 className="font-extrabold text-white text-xs uppercase tracking-wider">Executive Summary:</h5>
                          <p className="leading-relaxed">{report.summary}</p>
                        </div>

                        {/* Trends */}
                        {report.trends && (
                          <div className="space-y-1 pt-2">
                            <h5 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center">
                              <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                              <span>Emission Trajectory Trends:</span>
                            </h5>
                            <p className="leading-relaxed">{report.trends}</p>
                          </div>
                        )}

                        {/* Recommendations */}
                        <div className="space-y-2 pt-2">
                          <h5 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                            <span>Tailored Action Recommendations:</span>
                          </h5>
                          <ul className="space-y-2">
                            {report.recommendations.map((rec) => (
                              <li key={rec} className="flex items-start space-x-2 leading-relaxed">
                                <span className="h-4.5 w-4.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
