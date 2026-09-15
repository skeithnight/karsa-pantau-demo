'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, ArrowRight, ShieldCheck, Mail, Lock, User, Sparkles } from 'lucide-react';
import { KarsaLogo } from '../../components/KarsaLogo';
import { apiRequest, setAuthToken, setActiveOrganization } from '../../lib/api';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'PRO';

  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Simpan user demo / login ke backend
      const loginRes = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@karsapantau.id', password: 'Password123!' }),
      });
      setAuthToken(loginRes.accessToken);

      // 2. Buat Organisasi Baru untuk Perusahaan ini
      const orgRes = await apiRequest('/organizations', {
        method: 'POST',
        body: JSON.stringify({
          name: companyName,
          slug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }),
      });

      // 3. Simpan state aktif
      setActiveOrganization(orgRes);
      localStorage.setItem('karsa_user', JSON.stringify({
        id: loginRes.user.id,
        name: adminName || loginRes.user.name,
        email: email || loginRes.user.email,
        role: 'admin',
      }));

      // 4. Redirect ke portofolio proyek
      router.push('/projects');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftarkan perusahaan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <KarsaLogo size={48} className="mx-auto mb-4 drop-shadow-xl" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Daftarkan Perusahaan Konstruksi & Kontraktor Anda
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Mulai trial 14 hari paket <span className="font-semibold text-sky-400">{selectedPlan}</span>. Tanpa kartu kredit.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Perusahaan / Kontraktor EPC
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Surya Pratama Energi"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Lengkap Administrator
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Anda"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Kantor / Bisnis
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@perusahaan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password Akun
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/50 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-sky-300 leading-relaxed">
                Anda mendapatkan akses penuh **Paket {selectedPlan}** selama 14 hari. Seluruh data RAB dan Kurva S diisolasi khusus untuk perusahaan Anda.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Menyiapkan Workspace...</span>
              ) : (
                <>
                  <span>Buat Workspace & Mulai Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4">
                Masuk di Sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Memuat formulir pendaftaran...</p>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
