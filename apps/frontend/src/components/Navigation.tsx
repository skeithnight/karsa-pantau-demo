'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sun, Layers, CheckCircle2, Shield, LogOut, WifiOff, Cloud } from 'lucide-react';
import { getPendingOfflineEntries } from '../lib/offline/sync-queue';
import { clearAuthToken } from '../lib/api';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('karsa_user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {
        // no-op
      }
    }

    // Check offline entries
    getPendingOfflineEntries().then((entries) => {
      setPendingCount(entries.length);
    });
  }, [pathname]);

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    router.push('/login');
  };

  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-sky-500 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <Link href="/projects" className="text-lg font-bold tracking-tight text-white hover:text-sky-400 flex items-center gap-1.5">
              <span>Karsa</span>
              <span className="text-sky-400">Pantau</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 uppercase font-mono">
                PLTS EPC
              </span>
            </Link>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-4">
          <Link
            href="/projects"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname.startsWith('/projects')
                ? 'bg-slate-800 text-sky-400 border border-slate-700'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Portofolio Proyek</span>
          </Link>

          <Link
            href="/approvals"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === '/approvals'
                ? 'bg-slate-800 text-sky-400 border border-slate-700'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approvals</span>
          </Link>
        </nav>

        {/* User Info & Offline Sync Badge */}
        <div className="flex items-center space-x-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 animate-bounce">
              <WifiOff className="w-3.5 h-3.5" />
              <span>{pendingCount} Entri Offline</span>
            </div>
          )}

          {currentUser ? (
            <div className="flex items-center space-x-3 border-l border-slate-800 pl-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                <div className="flex items-center gap-1 justify-end">
                  <Shield className="w-3 h-3 text-sky-400" />
                  <span className="text-[10px] text-sky-400 uppercase font-mono tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-md shadow-sky-500/20"
            >
              Login Demo
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
