'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/hooks/useAuth';
import { useEcoData } from '@/core/hooks/useEcoData';
import { ReceiptAnalysis } from '@/core/types/sustainability';
import { Compass, Camera, Sparkles, Upload, FileText, ChevronRight, Award, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReceiptScanner() {
  const { user } = useAuth();
  const { receipts, uploadAndAnalyzeReceipt, loading } = useEcoData();
  const router = useRouter();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReceiptAnalysis | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setScanning(true);
    setAnalysisResult(null);

    try {
      // Call mock/real backend upload & vision pipeline
      const result = await uploadAndAnalyzeReceipt(file);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
          <Camera className="w-7 h-7 mr-2 text-purple-400" />
          <span>Receipt Carbon Analyzer</span>
        </h1>
        <p className="text-sm text-gray-400">Scan supermarket shopping receipts or fuel invoices. Gemini Vision parses items to calculate CO₂ footprints and recommend greener alternatives.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Drag & Drop Scanner Uploader (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`glass-panel border-2 border-dashed rounded-2xl p-8 text-center flex flex-col justify-center items-center min-h-[300px] transition-colors relative overflow-hidden ${
              dragActive ? 'border-purple-500 bg-purple-500/5' : 'border-border hover:border-slate-800'
            }`}
          >
            {/* Visual Scanning Glowing Line overlay */}
            {scanning && (
              <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent z-10 shadow-lg shadow-purple-500/50"
              />
            )}

            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleChange}
              disabled={scanning}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="h-12 w-12 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20 mx-auto text-purple-400 animate-float">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Drag & drop receipt image here</p>
                <p className="text-xs text-muted-foreground">Supports JPEG, PNG up to 5MB</p>
              </div>
              
              <label 
                htmlFor="file-upload"
                className="inline-flex items-center space-x-1.5 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-800 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors focus:outline-none"
              >
                <span>Select Invoice Image</span>
              </label>
            </div>
          </div>

          {/* Analysis Result Box */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass-panel border border-border p-6 rounded-2xl space-y-4 bg-gradient-to-br from-purple-500/5 to-transparent"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center">
                    <Sparkles className="w-4 h-4 mr-1.5 text-purple-400 animate-glow" />
                    <span>Gemini Vision Audit Summary</span>
                  </h3>
                  <span className="text-xs font-extrabold text-purple-400">-{analysisResult.estimatedCarbonKg} kg CO₂ offset logged</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Products */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Detected Items:</h4>
                    <ul className="space-y-1.5">
                      {analysisResult.detectedProducts.map(p => (
                        <li key={p} className="flex items-center space-x-1.5 text-xs text-gray-300">
                          <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Eco Alternatives:</h4>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map(rec => (
                        <li key={rec} className="flex items-start space-x-1.5 text-[11px] text-gray-300 leading-snug">
                          <span className="text-purple-400 shrink-0 font-bold">•</span>
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

        {/* Right Side: Log Archive (5 cols) */}
        <div className="lg:col-span-5 glass-panel border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-purple-400" />
                <span>Audited Invoices</span>
              </h3>
            </div>

            {/* List */}
            <div className="space-y-3 mt-4 max-h-[380px] overflow-y-auto pr-1">
              {receipts.length === 0 ? (
                <p className="text-xs text-center text-muted-foreground py-10">No receipt history found. Upload invoices to see logs.</p>
              ) : (
                receipts.map((rcpt) => (
                  <div key={rcpt.id} className="p-3 bg-slate-900/60 rounded-xl border border-border flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="h-8 w-8 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center shrink-0 text-purple-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">Receipt {rcpt.id.substring(5)}</h4>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(rcpt.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-purple-400 shrink-0">{rcpt.estimatedCarbonKg} kg</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
