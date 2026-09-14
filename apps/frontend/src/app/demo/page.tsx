'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Sun, ArrowRight } from 'lucide-react';
import { apiRequest, setAuthToken, setActiveOrganization } from '@/lib/api';

export default function DemoLauncherPage() {
  const router = useRouter();
  const [statusText, setStatusText] = useState('Menyiapkan sesi demo interaktif...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initDemo() {
      try {
        setStatusText('Mengautentikasi akun guest demo...');
        let token = 'demo_guest_token';
        let org = {
          id: '0bffc122-3a58-4e1b-9f7b-105053886aa8',
          name: 'PT Karsa Konstruksi Nusantara (Demo)',
          currentPlan: 'PRO (Demo Mode)',
        };
        let userId = '864424d9-c552-4f30-8982-29ec6dfb71bb';

        // 1. Coba login API resmi
        try {
          const loginRes = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              email: 'admin@karsapantau.id',
              password: 'Password123!',
            }),
          });
          if (loginRes?.accessToken) {
            token = loginRes.accessToken;
            userId = loginRes.user?.id || userId;
            org = loginRes.organizations?.[0] || loginRes.activeOrganization || org;
          }
        } catch (apiErr) {
          console.warn('API login skipped, using resilient demo mode session:', apiErr);
        }

        setAuthToken(token);
        setActiveOrganization(org);

        localStorage.setItem(
          'karsa_user',
          JSON.stringify({
            id: userId,
            name: 'Pengunjung Demo (Guest PM)',
            email: 'demo@karsapantau.id',
            role: 'pm',
          }),
        );
        localStorage.setItem('karsa_demo_mode', 'true');

        setStatusText('Memuat data proyek konstruksi contoh...');
        // 2. Cari proyek demo yang tersedia atau fallback langsung ke default demo project ID
        let targetProjectId = 'de300000-0000-0000-0000-000000000500';
        try {
          const projectsRes = await apiRequest<{ data: any[]; total: number }>('/projects?limit=5');
          const demoProj = projectsRes.data?.find((p) => p.id === targetProjectId) || projectsRes.data?.[0];
          if (demoProj?.id) {
            targetProjectId = demoProj.id;
          }
        } catch {
          // fallback to targetProjectId
        }

        setStatusText('Membuka Dashboard Proyek...');
        router.push(`/projects/${targetProjectId}`);
      } catch (err: any) {
        console.error('Demo initialization error:', err);
        // Fallback langsung ke demo project page
        router.push('/projects/de300000-0000-0000-0000-000000000500');
      }
    }

    initDemo();
  }, [router]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-sky-500 p-0.5 mx-auto shadow-lg shadow-sky-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sun className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Mode Demo Karsa Pantau</span>
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Menyiapkan lingkungan simulasi proyek konstruksi & EPC dengan Kurva S, RAB AHSP, dan metrik EVM lengkap.
          </p>
        </div>

        {error ? (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs space-y-3">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
            <span className="text-xs font-mono text-slate-300">{statusText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
