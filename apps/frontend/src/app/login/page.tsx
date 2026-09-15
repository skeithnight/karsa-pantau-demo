'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Lock, Mail, UserCheck } from 'lucide-react';
import { KarsaLogo } from '../../components/KarsaLogo';
import { apiRequest, setAuthToken, setActiveOrganization } from '../../lib/api';
import Link from 'next/link';

const DEMO_ACCOUNTS = [
  { role: 'Project Manager (PM)', email: 'pm@karsapantau.id', name: 'Budi Santoso' },
  { role: 'Estimator (RAB)', email: 'estimator@karsapantau.id', name: 'Siti Rahma' },
  { role: 'Approver (Direktur)', email: 'approver@karsapantau.id', name: 'Ir. Hendra' },
  { role: 'Site Supervisor', email: 'supervisor@karsapantau.id', name: 'Agus Pratama' },
  { role: 'System Admin', email: 'admin@karsapantau.id', name: 'Admin Karsa' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return '/projects';
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || '/projects';
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('karsa_token') : null;
    const user = typeof window !== 'undefined' ? localStorage.getItem('karsa_user') : null;
    if (token && user) {
      router.replace(getRedirectUrl());
    }
  }, [router]);

  const handleLogin = async (loginEmail = email, loginPass = password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      setAuthToken(res.accessToken);
      localStorage.setItem('karsa_user', JSON.stringify(res.user));
      if (res.activeOrganization) {
        setActiveOrganization(res.activeOrganization);
      }
      if (res.organizations) {
        localStorage.setItem('karsa_user_orgs', JSON.stringify(res.organizations));
      }
      window.dispatchEvent(new Event('karsa_auth_change'));
      router.push(getRedirectUrl());
    } catch (err) {
      // Fallback untuk demo jika backend belum running
      const matched = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === loginEmail.toLowerCase());
      if (matched) {
        setAuthToken('demo-token');
        localStorage.setItem(
          'karsa_user',
          JSON.stringify({
            id: 'demo-user-id',
            name: matched.name,
            email: matched.email,
            role: matched.role.toLowerCase().includes('pm')
              ? 'pm'
              : matched.role.toLowerCase().includes('estimator')
                ? 'estimator'
                : matched.role.toLowerCase().includes('approver')
                  ? 'approver'
                  : matched.role.toLowerCase().includes('supervisor')
                    ? 'supervisor'
                    : 'admin',
          }),
        );
        window.dispatchEvent(new Event('karsa_auth_change'));
        router.push(getRedirectUrl());
      } else {
        setError((err as Error).message || 'Gagal login, periksa email & password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center">
          <KarsaLogo size={56} className="mx-auto mb-4 drop-shadow-xl" />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Karsa <span className="text-sky-400">Pantau</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Platform Manajemen Anggaran & Kontrol Realisasi Konstruksi (General EPC)
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-950/60 border border-rose-800/80 rounded-lg text-rose-300">
            {error}
          </div>
        )}

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Karyawan</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="nama@perusahaan.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Kata Sandi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 font-semibold text-sm text-white transition-colors shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2"
          >
            {loading ? 'Memproses...' : 'Masuk ke Sistem'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            Quick Demo Login (Sekali Klik)
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword('Password123!');
                  handleLogin(acc.email, 'Password123!');
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs flex items-center justify-between group transition-all"
              >
                <div>
                  <span className="font-semibold text-slate-200 group-hover:text-sky-400">
                    {acc.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{acc.role}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:bg-sky-950 group-hover:text-sky-300 font-mono">
                  Login
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* B2B SaaS Onboarding Link */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Perusahaan kontraktor baru?{' '}
            <Link href="/register" className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4">
              Daftar & Mulai Trial 14 Hari
            </Link>
          </p>
          <p className="text-[11px] text-slate-500">
            Ingin melihat rincian fitur?{' '}
            <Link href="/pricing" className="text-slate-400 hover:text-slate-300 underline">
              Lihat Paket & Harga
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
