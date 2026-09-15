'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  Sparkles,
  BookOpen,
  DollarSign,
  Users,
  Menu,
  X,
  UserCheck,
  Database,
  Settings,
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
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const accountRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setShowAccountDropdown(false);
      }
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setShowOrgDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const PROTECTED_PREFIXES = [
    '/projects',
    '/approvals',
    '/catalog',
    '/finance',
    '/team',
    '/settings',
  ];

  const syncAuthState = () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('karsa_token');
    const userStr = localStorage.getItem('karsa_user');

    if (token && userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {
        setCurrentUser(null);
      }
      const org = getActiveOrganization();
      if (org) {
        setActiveOrgState(org);
      } else {
        setActiveOrgState(null);
      }
      const orgsStr = localStorage.getItem('karsa_user_orgs');
      if (orgsStr) {
        try {
          setUserOrgs(JSON.parse(orgsStr));
        } catch {
          setUserOrgs([]);
        }
      }
    } else {
      // User is completely logged out
      setCurrentUser(null);
      setActiveOrgState(null);
      setUserOrgs([]);

      // Route Guard: If attempting to access a protected dashboard route, bounce to /login
      const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
      if (isProtected) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  };

  useEffect(() => {
    syncAuthState();

    const handleAuthChange = () => {
      syncAuthState();
    };

    window.addEventListener('karsa_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    // Check offline entries
    getPendingOfflineEntries().then((entries) => {
      setPendingCount(entries.length);
    });

    return () => {
      window.removeEventListener('karsa_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [pathname, router]);

  const handleSwitchRole = (newRole: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    localStorage.setItem('karsa_user', JSON.stringify(updated));
    setShowAccountDropdown(false);
    setMobileMenuOpen(false);
  };

  const handleSwitchOrg = (org: any) => {
    setActiveOrganization(org);
    setActiveOrgState(org);
    setShowOrgDropdown(false);
    window.location.reload();
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    setActiveOrgState(null);
    setUserOrgs([]);
    setShowAccountDropdown(false);
    setShowOrgDropdown(false);
    setMobileMenuOpen(false);
    window.location.href = '/';
  };

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const role = (currentUser?.role || 'admin').toLowerCase();

  // Core Operational Navigation Links (Streamlined & Clean)
  const coreNavItems = [
    {
      href: '/projects',
      label: 'Proyek',
      icon: Layers,
      color: 'text-sky-400',
      allowed: ['admin', 'pm', 'estimator', 'supervisor', 'mandor', 'finance', 'approver'],
    },
    {
      href: '/approvals',
      label: 'Approvals',
      icon: CheckCircle2,
      color: 'text-purple-400',
      allowed: ['admin', 'pm', 'approver', 'finance'],
    },
    {
      href: '/catalog',
      label: 'Katalog Harga',
      icon: Database,
      color: 'text-sky-400',
      allowed: ['admin', 'pm', 'estimator', 'finance'],
    },
    {
      href: '/finance',
      label: 'Keuangan',
      icon: DollarSign,
      color: 'text-emerald-400',
      allowed: ['admin', 'pm', 'finance', 'approver'],
    },
    {
      href: '/docs',
      label: 'Dokumentasi',
      icon: BookOpen,
      color: 'text-amber-400',
      allowed: ['admin', 'pm', 'estimator', 'supervisor', 'mandor', 'finance', 'approver'],
    },
  ];

  const visibleNavItems = coreNavItems.filter((item) => item.allowed.includes(role));

  const availableRoles = [
    { key: 'admin', label: 'Administrator', badgeColor: 'bg-rose-950 text-rose-300 border-rose-800' },
    { key: 'pm', label: 'Project Manager (PM)', badgeColor: 'bg-purple-950 text-purple-300 border-purple-800' },
    { key: 'estimator', label: 'Estimator Biaya & RAB', badgeColor: 'bg-amber-950 text-amber-300 border-amber-800' },
    { key: 'supervisor', label: 'Site Supervisor / Mandor', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    { key: 'finance', label: 'Finance & Akuntansi', badgeColor: 'bg-blue-950 text-blue-300 border-blue-800' },
    { key: 'approver', label: 'Owner / Approver', badgeColor: 'bg-teal-950 text-teal-300 border-teal-800' },
  ];

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'KP';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Organization Switcher */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-sky-500 p-0.5 shadow-md shadow-sky-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <Link 
              href={currentUser ? "/projects" : "/"} 
              className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-sky-400 flex items-center gap-1.5 transition-colors"
            >
              <span>Karsa</span>
              <span className="text-sky-400">Pantau</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950/90 text-sky-400 border border-sky-800/80 uppercase font-mono font-semibold">
                SaaS
              </span>
            </Link>
          </div>

          {/* Organization Switcher Dropdown (Desktop) */}
          {currentUser && (
            <div ref={orgRef} className="relative hidden xl:block pl-3 border-l border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all cursor-pointer"
                title="Ganti Organisasi / Perusahaan"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-medium max-w-[120px] truncate">
                  {activeOrg?.name || 'Perusahaan'}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 font-mono border border-sky-800/80">
                  {activeOrg?.currentPlan?.includes('PRO') ? 'PRO' : 'STARTER'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showOrgDropdown && (
                <div className="absolute left-3 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <p className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
                    Perusahaan Aktif
                  </p>
                  {userOrgs.length > 0 ? (
                    userOrgs.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => handleSwitchOrg(o)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          o.id === activeOrg?.id
                            ? 'bg-sky-950 text-sky-300 font-semibold border border-sky-800/60'
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
                      href="/team"
                      onClick={() => setShowOrgDropdown(false)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-sky-400 hover:bg-slate-800 flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Kelola Tim & Hak Akses</span>
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

        {/* Center: Clean Operational Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 shrink-0">
          {currentUser ? (
            visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/projects'
                  ? pathname.startsWith('/projects')
                  : item.href === '/finance'
                  ? pathname.startsWith('/finance')
                  : item.href === '/catalog'
                  ? pathname.startsWith('/catalog')
                  : pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? item.color : 'text-slate-400'} shrink-0`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })
          ) : (
            <>
              <Link
                href="/#features"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Fitur
              </Link>
              <Link
                href="/#demo"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Demo</span>
              </Link>
              <Link
                href="/docs"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  pathname === '/docs'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Dokumentasi</span>
              </Link>
              <Link
                href="/pricing"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  pathname === '/pricing'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                Paket & Pilot
              </Link>
            </>
          )}
        </nav>

        {/* Right: Offline Indicator, Account Dropdown & Mobile Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {pendingCount > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 animate-bounce">
              <WifiOff className="w-3 h-3" />
              <span>{pendingCount} Offline</span>
            </div>
          )}

          {currentUser ? (
            /* Integrated Account & Settings Popover */
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm group"
                title="Menu Akun, Peran & Pengaturan"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  {userInitials}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider bg-sky-950 text-sky-400 border border-sky-800/80 flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" />
                      <span>{currentUser.role}</span>
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform ${showAccountDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Account & Settings Popover Content */}
              {showAccountDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                  {/* User Profile Header */}
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>

                  {/* Company & Organization Context */}
                  <div className="px-2.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="text-slate-300 truncate font-medium">{activeOrg?.name}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-mono border border-sky-800/80 shrink-0 font-bold">
                      {activeOrg?.currentPlan?.includes('PRO') ? 'PRO' : 'STARTER'}
                    </span>
                  </div>

                  {/* Organization & Team Quick Links */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500 px-1 tracking-wider">
                      Pengaturan & Akun
                    </p>
                    <Link
                      href="/team"
                      onClick={() => setShowAccountDropdown(false)}
                      className="w-full px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span>Tim & Hak Akses</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Kelola</span>
                    </Link>
                    <Link
                      href="/settings/billing"
                      onClick={() => setShowAccountDropdown(false)}
                      className="w-full px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                        <span>Paket & Billing</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Upgrade</span>
                    </Link>
                  </div>

                  {/* RBAC Role Switcher Section */}
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Ganti Peran Aktif (RBAC)
                      </p>
                      <span className="text-[9px] text-sky-400 font-mono">Demo Mode</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {availableRoles.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => handleSwitchRole(r.key)}
                          className={`px-2 py-1.5 rounded-lg text-[11px] text-left truncate transition-all flex items-center justify-between ${
                            role === r.key
                              ? 'bg-sky-950 text-sky-300 font-bold border border-sky-800 shadow-sm'
                              : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                          }`}
                        >
                          <span className="truncate">{r.label.split(' ')[0]}</span>
                          {role === r.key && <UserCheck className="w-3 h-3 text-sky-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-2.5 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 flex items-center gap-2 transition-colors font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar dari Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/demo"
                className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-800/60 transition-all items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Demo</span>
              </Link>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                Masuk
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-2xl">
          {currentUser && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider bg-sky-950 text-sky-400 border border-sky-800">
                  {currentUser.role}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Perusahaan:</span>
                <span className="text-white font-medium">{activeOrg?.name}</span>
              </div>
            </div>
          )}

          {/* Operational Links */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
              Menu Operasional Proyek
            </p>
            {currentUser ? (
              visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/projects'
                    ? pathname.startsWith('/projects')
                    : item.href === '/finance'
                    ? pathname.startsWith('/finance')
                    : item.href === '/catalog'
                    ? pathname.startsWith('/catalog')
                    : pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })
            ) : (
              <>
                <Link
                  href="/#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-900"
                >
                  Fitur
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-900"
                >
                  Paket & Pilot
                </Link>
                <Link
                  href="/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-900"
                >
                  Dokumentasi
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs text-sky-400 hover:bg-slate-900 font-semibold"
                >
                  Masuk Akun
                </Link>
              </>
            )}
          </div>

          {/* Account & Organization Links in Mobile Drawer */}
          {currentUser && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
                Pengaturan Perusahaan & Akun
              </p>
              <Link
                href="/team"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>Tim & Hak Akses Anggota</span>
              </Link>
              <Link
                href="/settings/billing"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-sky-400" />
                <span>Paket Langganan & Billing</span>
              </Link>
            </div>
          )}

          {/* Quick Role Switcher in Mobile Drawer */}
          {currentUser && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
                Ganti Peran Uji Coba (RBAC Switcher)
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {availableRoles.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleSwitchRole(r.key)}
                    className={`px-2.5 py-2 rounded-lg text-[11px] text-left truncate transition-colors flex items-center justify-between ${
                      role === r.key
                        ? 'bg-sky-950 text-sky-300 font-bold border border-sky-800'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{r.label.split(' ')[0]}</span>
                    {role === r.key && <UserCheck className="w-3 h-3 text-sky-400 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

