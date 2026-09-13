'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sun,
  Layers,
  CheckCircle2,
  Shield,
  LogOut,
  WifiOff,
  Building2,
  ChevronDown,
  CreditCard,
  Plus,
  Sparkles,
} from 'lucide-react';
import { getPendingOfflineEntries } from '../lib/offline/sync-queue';
import { clearAuthToken, getActiveOrganization, setActiveOrganization } from '../lib/api';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeOrg, setActiveOrgState] = useState<any>(null);
  const [userOrgs, setUserOrgs] = useState<any[]>([]);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
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

    const org = getActiveOrganization();
    if (org) {
      setActiveOrgState(org);
    } else {
      // Fallback default organization
      setActiveOrgState({
        id: '1a2b3c4d-org1-4a2b-971a-03b05cfc5a01',
        name: 'PT Karsa Solar Nusantara',
        currentPlan: 'PRO (Trial)',
      });
    }

    const orgsStr = localStorage.getItem('karsa_user_orgs');
    if (orgsStr) {
      try {
        setUserOrgs(JSON.parse(orgsStr));
      } catch {
        // no-op
      }
    }

    // Check offline entries
    getPendingOfflineEntries().then((entries) => {
      setPendingCount(entries.length);
    });
  }, [pathname]);

  const handleSwitchOrg = (org: any) => {
    setActiveOrganization(org);
    setActiveOrgState(org);
    setShowOrgDropdown(false);
    window.location.reload();
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    router.push('/login');
  };

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Organization Switcher */}
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
                SaaS
              </span>
            </Link>
          </div>

          {/* Organization Switcher Dropdown */}
          {currentUser && (
            <div className="relative hidden md:block pl-3 border-l border-slate-800">
              <button
                type="button"
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-medium max-w-[140px] truncate">
                  {activeOrg?.name || 'Pilih Perusahaan'}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 font-mono border border-sky-800/80">
                  {activeOrg?.currentPlan?.includes('PRO') ? 'PRO' : 'STARTER'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showOrgDropdown && (
                <div className="absolute left-3 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
                    Perusahaan Saya
                  </p>
                  {userOrgs.length > 0 ? (
                    userOrgs.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => handleSwitchOrg(o)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          o.id === activeOrg?.id
                            ? 'bg-sky-950 text-sky-300 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{o.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{o.myRole}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-2.5 py-1.5 text-xs text-slate-300 font-semibold">
                      {activeOrg?.name}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <Link
                      href="/register"
                      onClick={() => setShowOrgDropdown(false)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-sky-400 hover:bg-slate-800 flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Buat Perusahaan Baru</span>
                    </Link>
                    <Link
                      href="/settings/billing"
                      onClick={() => setShowOrgDropdown(false)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-amber-300 hover:bg-slate-800 flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Kelola Langganan (Billing)</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-3">
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

          <Link
            href="/settings/billing"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname.startsWith('/settings/billing')
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Langganan</span>
          </Link>

          <Link
            href="/pricing"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === '/pricing'
                ? 'bg-slate-800 text-sky-400 border border-slate-700'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Paket Harga</span>
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
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-md shadow-sky-500/20"
              >
                Mulai Trial
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
