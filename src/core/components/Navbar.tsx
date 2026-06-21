'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/core/hooks/useAuth';
import { useEcoData } from '@/core/hooks/useEcoData';
import { Bell, Flame, User, LogOut, Menu, X, Award, BarChart3, MessageSquare, Compass, Eye, ShieldAlert, FileText } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { notifications, markNotificationRead } = useEcoData();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/twin', label: 'Carbon Twin', icon: Eye },
    { href: '/coach', label: 'AI Coach', icon: MessageSquare },
    { href: '/receipt', label: 'Receipt Vision', icon: Compass },
    { href: '/simulator', label: 'Simulator', icon: Award },
    { href: '/missions', label: 'Missions', icon: Flame },
    { href: '/leaderboard', label: 'Leaderboard', icon: Award },
    { href: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-border" role="navigation" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2" aria-label="EcoTwin AI Homepage">
              <span className="text-2xl animate-float">🌱</span>
              <span className="text-xl font-bold tracking-tight text-gradient-emerald">EcoTwin AI</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500'
                      : 'text-gray-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Widgets */}
          <div className="flex items-center space-x-4">
            {/* Streak Widget */}
            {user.currentStreak > 0 && (
              <div 
                className="flex items-center space-x-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse-slow"
                title={`${user.currentStreak} Day Green Streak`}
              >
                <Flame className="w-4 h-4 fill-orange-400" />
                <span>{user.currentStreak} Day Streak</span>
              </div>
            )}

            {/* Notification Center */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-1.5 rounded-full text-gray-300 hover:bg-slate-800/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label={`Open notifications, ${unreadCount} unread`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black ring-2 ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-md bg-slate-900 border border-border shadow-2xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                  </div>
                  <div className="divide-y divide-border">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-muted-foreground">No notifications yet.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-800/50 ${!notif.read ? 'bg-emerald-500/5' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-semibold text-white">{notif.title}</h4>
                            {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{notif.body}</p>
                          <span className="text-[9px] text-muted-foreground mt-1 block">
                            {new Date(notif.createdAt).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-expanded={profileOpen}
                aria-label="User menu"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="h-8 w-8 rounded-full border border-emerald-500/30"
                  src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                  alt={user.displayName}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-slate-900 border border-border shadow-2xl py-1 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    
                    {/* XP & Level Indicator */}
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] font-bold text-emerald-400">
                        <span>Level {user.level}</span>
                        <span>{user.xp % 1000} / 1000 XP</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${(user.xp % 1000) / 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={signOut}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-800/80 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-800 focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Links Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/95 border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
