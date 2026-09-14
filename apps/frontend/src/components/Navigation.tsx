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
  BookOpen,
  DollarSign,
  Users,
  Menu,
  X,
  UserCheck,
  Database,
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
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('karsa_user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {
        // no-op
      }
    } else {
      // Default demo user role
      const defaultUser = {
        id: 'usr-demo-admin',
        name: 'Dwiki Nugraha',
        email: 'dwiki@karsapantau.id',
        role: 'admin',
      };
      setCurrentUser(defaultUser);
      localStorage.setItem('karsa_user', JSON.stringify(defaultUser));
    }

    const org = getActiveOrganization();
    if (org) {
      setActiveOrgState(org);
    } else {
      setActiveOrgState({
        id: '1a2b3c4d-org1-4a2b-971a-03b05cfc5a01',
        name: 'PT Karsa Konstruksi Nusantara',
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

  const handleSwitchRole = (newRole: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    localStorage.setItem('karsa_user', JSON.stringify(updated));
    setShowRoleDropdown(false);
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
    router.push('/login');
  };

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const role = (currentUser?.role || 'admin').toLowerCase();

  // RBAC Navigation Links Matrix
  const navItems = [
    {
      href: '/projects',
      label: 'Portofolio Proyek',
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
      label: 'Portal Keuangan',
      icon: DollarSign,
      color: 'text-emerald-400',
      allowed: ['admin', 'pm', 'finance', 'approver'],
    },
    {
      href: '/team',
      label: 'Tim & Anggota',
      icon: Users,
      color: 'text-amber-400',
      allowed: ['admin', 'pm'],
    },
    {
      href: '/docs',
      label: 'Dokumentasi',
      icon: BookOpen,
      color: 'text-sky-400',
      allowed: ['admin', 'pm', 'estimator', 'supervisor', 'mandor', 'finance', 'approver'],
    },
    {
      href: '/settings/billing',
      label: 'Langganan',
      icon: CreditCard,
      color: 'text-amber-400',
      allowed: ['admin', 'pm'],
    },
  ];

  const visibleNavItems = navItems.filter((item) => item.allowed.includes(role));

  const availableRoles = [
    { key: 'admin', label: 'Administrator (Akses Penuh)', badgeColor: 'bg-rose-950 text-rose-300 border-rose-800' },
    { key: 'pm', label: 'Project Manager (PM)', badgeColor: 'bg-purple-950 text-purple-300 border-purple-800' },
    { key: 'estimator', label: 'Estimator Biaya & RAB', badgeColor: 'bg-amber-950 text-amber-300 border-amber-800' },
    { key: 'supervisor', label: 'Site Supervisor / Mandor', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    { key: 'finance', label: 'Finance & Akuntansi', badgeColor: 'bg-blue-950 text-blue-300 border-blue-800' },
    { key: 'approver', label: 'Owner / Approver', badgeColor: 'bg-teal-950 text-teal-300 border-teal-800' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Organization Switcher */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-sky-500 p-0.5 shadow-lg shadow-sky-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <Link 
              href={currentUser ? "/projects" : "/"} 
              className="text-lg font-bold tracking-tight text-white hover:text-sky-400 flex items-center gap-1.5"
            >
              <span>Karsa</span>
              <span className="text-sky-400">Pantau</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 uppercase font-mono">
                SaaS
              </span>
            </Link>
          </div>

          {/* Organization Switcher Dropdown (Desktop) */}
          {currentUser && (
            <div className="relative hidden lg:block pl-3 border-l border-slate-800">
              <button
                type="button"
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-medium max-w-[130px] truncate">
                  {activeOrg?.name || 'Perusahaan'}
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

        {/* Desktop Navigation Links (RBAC Filtered) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {currentUser ? (
            visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/projects'
                  ? pathname.startsWith('/projects')
                  : item.href === '/finance'
                  ? pathname.startsWith('/finance')
                  : item.href === '/team'
                  ? pathname.startsWith('/team')
                  : item.href === '/catalog'
                  ? pathname.startsWith('/catalog')
                  : pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 text-sky-400 border border-slate-700'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? item.color : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })
          ) : (
            <>
              <Link
                href="/#features"
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
              >
                Fitur
              </Link>
              <Link
                href="/#demo"
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo</span>
              </Link>
              <Link
                href="/docs"
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  pathname === '/docs'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>Dokumentasi</span>
              </Link>
              <Link
                href="/pricing"
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
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

        {/* User Info, Role Switcher, Offline Badge & Mobile Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {pendingCount > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 animate-bounce">
              <WifiOff className="w-3 h-3" />
              <span>{pendingCount} Offline</span>
            </div>
          )}

          {currentUser ? (
            <div className="flex items-center space-x-2 border-l border-slate-800 pl-2 sm:pl-3">
              {/* Role Switcher Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-right cursor-pointer flex items-center gap-1.5 transition-all"
                  title="Klik untuk ganti peran (RBAC Demo)"
                >
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-white hidden sm:block leading-tight">
                      {currentUser.name.split(' ')[0]}
                    </p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider bg-sky-950 text-sky-400 border border-sky-800/80 flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" />
                      <span>{currentUser.role}</span>
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                    <div className="px-2 py-1 border-b border-slate-800 mb-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Ganti Peran Aktif (RBAC)
                      </p>
                      <p className="text-[9px] text-slate-500">
                        Ubah peran untuk menguji perbedaan menu & hak akses.
                      </p>
                    </div>
                    {availableRoles.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => handleSwitchRole(r.key)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          role === r.key
                            ? 'bg-sky-950 text-sky-300 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{r.label}</span>
                        {role === r.key && <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
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
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-4 space-y-3 animate-fade-in shadow-2xl">
          {currentUser && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mb-2">
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

          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
              Menu Navigasi ({role.toUpperCase()})
            </p>
            {currentUser ? (
              visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/projects'
                    ? pathname.startsWith('/projects')
                    : item.href === '/finance'
                    ? pathname.startsWith('/finance')
                    : item.href === '/team'
                    ? pathname.startsWith('/team')
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
                        ? 'bg-slate-800 text-sky-400 border border-slate-700'
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

          {/* Quick Role Switcher on Mobile */}
          {currentUser && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
                Ganti Peran Uji Coba (RBAC Switcher)
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {availableRoles.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleSwitchRole(r.key)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] text-left truncate transition-colors ${
                      role === r.key
                        ? 'bg-sky-950 text-sky-300 font-bold border border-sky-800'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {r.key.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
