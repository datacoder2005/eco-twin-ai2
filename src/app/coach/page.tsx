'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/hooks/useAuth';
import { useEcoData } from '@/core/hooks/useEcoData';
import { generateEcoCoachResponse } from '@/core/services/gemini';
import { CoachMessage } from '@/core/types/sustainability';
import { MessageSquare, Send, Sparkles, AlertCircle, RefreshCw, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EcoCoachChat() {
  const { user } = useAuth();
  const { refreshData } = useEcoData();
  const router = useRouter();

  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-seed welcome message
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const welcomeMsg: CoachMessage = {
      id: 'welcome',
      role: 'model',
      content: `Hello **${user.displayName}**! I'm your **EcoCoach AI Sustainability Assistant**.

I've analyzed your profile and current EcoScore of **${user.ecoScore || 70}/100**. Ask me anything about choosing sustainable travel alternatives, making energy-saving swaps, or adopting low-impact food diets in India.`,
      createdAt: new Date().toISOString()
    };
    setMessages([welcomeMsg]);
  }, [user, router]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || chatLoading) return;
    
    const userMsg: CoachMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setChatLoading(true);

    try {
      // Call Gemini Coach generator (which connects to Vertex AI or falls back to robust local mock)
      const aiReply = await generateEcoCoachResponse(user, messages, textToSend);
      
      const modelMsg: CoachMessage = {
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        role: 'model',
        content: aiReply,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: CoachMessage = {
        id: 'msg_error_' + Date.now(),
        role: 'model',
        content: 'Sorry, I encountered an issue compiling the sustainability advice. Please try again.',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full relative min-h-[500px]">
      
      {/* Background ambient lighting */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-purple-400" />
            <span>AI Sustainability Coach</span>
          </h1>
          <p className="text-xs text-muted-foreground">Conversational assistant powered by Gemini 2.5 models for personalized action plans.</p>
        </div>
        <div className="flex items-center space-x-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini AI Connected</span>
        </div>
      </div>

      {/* Messages list container */}
      <div className="flex-1 bg-slate-950/60 border border-border rounded-2xl p-6 min-h-[320px] max-h-[460px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center border ${
                isUser ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 animate-glow" />}
              </div>

              {/* Text box */}
              <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                isUser 
                  ? 'bg-emerald-500/10 text-white rounded-tr-none border border-emerald-500/20' 
                  : 'bg-slate-900 border border-border text-gray-200 rounded-tl-none shadow-md'
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}

        {/* Loading bubble */}
        {chatLoading && (
          <div className="flex items-start gap-3 max-w-[80%] mr-auto">
            <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center border bg-purple-500/10 border-purple-500/20 text-purple-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-border text-xs text-muted-foreground">
              EcoCoach is typing carbon recommendations...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested prompts buttons */}
      {messages.length === 1 && !chatLoading && (
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {[
            { label: '🚌 Local transit savings in India', prompt: 'Tell me about local transit savings and clean travel options in India.' },
            { label: '🥗 High-impact vegetarian food swaps', prompt: 'What are the highest impact vegetarian food swaps to save water and carbon?' },
            { label: '💡 Home energy AC optimizations', prompt: 'How do I optimize my home air conditioning and lighting to save power bills?' }
          ].map(btn => (
            <button
              key={btn.label}
              onClick={() => handleSendMessage(btn.prompt)}
              className="bg-slate-900 hover:bg-slate-800 border border-border text-xs font-semibold text-gray-300 px-3 py-1.5 rounded-full transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask EcoCoach a carbon footprint query..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={chatLoading}
          className="flex-1 bg-slate-950 border border-border focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
          aria-label="Sustainability chat input"
        />
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={chatLoading || !inputText.trim()}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-800 active:scale-95 transition-all text-slate-950 font-bold p-2.5 rounded-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
