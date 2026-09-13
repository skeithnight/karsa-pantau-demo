'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sun,
  Zap,
  TrendingUp,
  ShieldCheck,
  Receipt,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Clock,
  ChevronRight,
  Building2,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  Send,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { setAuthToken, setActiveOrganization } from '../lib/api';

export default function LandingPage() {
  const router = useRouter();

  // State Feedback Modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    company: '',
    email: '',
    expectedBudget: '1-3jt',
    priorityFeatures: 'kurva_s_evm',
    notes: '',
  });

  // 1-Click Interactive Demo Launcher
  const handleLaunchDemo = async () => {
    try {
      // Simulasikan session login guest demo langsung ke backend
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@karsapantau.id', password: 'Password123!' }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuthToken(data.accessToken);
        const org = data.organizations?.[0] || data.activeOrganization || {
          id: '0bffc122-3a58-4e1b-9f7b-105053886aa8',
          name: 'PT Karsa Solar Nusantara (Demo)',
          currentPlan: 'PRO (Demo Mode)',
        };
        setActiveOrganization(org);
        localStorage.setItem(
          'karsa_user',
          JSON.stringify({
            id: data.user.id,
            name: 'Pengunjung Demo (Guest PM)',
            email: 'demo@karsapantau.id',
            role: 'pm',
          }),
        );
        localStorage.setItem('karsa_demo_mode', 'true');
      }
    } catch {
      // Fallback local persistence
      localStorage.setItem('karsa_demo_mode', 'true');
    }

    // Arahkan langsung ke proyek demo
    router.push('/demo');
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSubmitted(false);
      setFeedbackData({
        name: '',
        company: '',
        email: '',
        expectedBudget: '1-3jt',
        priorityFeatures: 'kurva_s_evm',
        notes: '',
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* 1. Announcement Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-emerald-500/20 border-b border-sky-500/20 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-medium text-slate-200">
          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 text-[10px] uppercase tracking-wider">
            Pilot Partner Program
          </span>
          <span className="hidden sm:inline">
            Karsa Pantau kini membuka akses Beta untuk kontraktor EPC PLTS Indonesia.
          </span>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="underline text-sky-400 hover:text-sky-300 font-semibold cursor-pointer ml-1"
          >
            Berikan Masukan Klien &rarr;
          </button>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 shadow-xl backdrop-blur-md">
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>Sistem Khusus Konstruksi PLTS (Rooftop & Ground-Mounted)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Kendalikan Anggaran & Kurva S Proyek PLTS{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400">
              Secara Presisi
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            Tinggalkan spreadsheet manual yang rentan rusak. Karsa Pantau mengintegrasikan penyusunan RAB standar AHSP, 
            kalkulasi Earned Value Management (EVM) otomatis, serta ekstraksi kuitansi lapangan berbasis AI OCR demi 
            mencegah pembengkakan biaya sedini mungkin.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-amber-500 hover:from-sky-400 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Coba Demo Interaktif (1-Klik)</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/80 transition-all flex items-center justify-center gap-2 shadow-lg backdrop-blur-md"
            >
              <span>Daftar Uji Coba Gratis (Free Trial)</span>
            </Link>
          </div>

          {/* Key Value Metric Badges */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xl font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>100% EVM</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Kalkulasi CPI & SPI deterministik tanpa asumsi halu AI</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xl font-bold text-white flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-sky-400" />
                <span>AI OCR Struk</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Ekstrak kuitansi toko material & alat lapangan instan</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xl font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Offline PWA</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Input aktual di remote area tetap tersimpan aman</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xl font-bold text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Multi-Tenant</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Isolasi data proyek per perusahaan kontraktor EPC</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Demo Showcase Section */}
      <section id="demo" className="py-16 bg-slate-900/30 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              Eksplorasi Langsung Tanpa Registrasi
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Coba Pengalaman Riil Proyek PLTS 500 kWp
            </h2>
            <p className="text-sm text-slate-400">
              Klik tombol di bawah untuk masuk ke mode simulasi live. Anda dapat menginspeksi rincian RAB AHSP, 
              menganalisis grafik Kurva S mingguan, dan melihat bagaimana deviasi biaya terdeteksi secara otomatis.
            </p>
          </div>

          {/* Interactive Preview Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <h3 className="text-lg font-bold text-white">PLTS Atap Industri 500 kWp (Demo Site)</h3>
                  <p className="text-xs text-slate-400">Kawasan Industri GIIC Cikarang &bull; Kapasitas: 500 kWp &bull; Status: Ongoing</p>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-sky-950 text-sky-400 border border-sky-800 font-mono">
                RAB: Rp 2.451.500.000
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Progress Fisik Aktual</span>
                <span className="text-xl font-black text-white mt-1 block">74.0%</span>
                <span className="text-emerald-400 text-[11px]">Sesuai Baseline Rencana (75%)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Cost Performance (CPI)</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">1.028</span>
                <span className="text-slate-400 text-[11px]">Hemat Anggaran (Under Budget)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Biaya Riil Terbayar (AC)</span>
                <span className="text-xl font-black text-white mt-1 block">Rp 1,76 M</span>
                <span className="text-slate-400 text-[11px]">Dari Earned Value Rp 1,81 M</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Item RAB Terverifikasi</span>
                <span className="text-xl font-black text-amber-400 mt-1 block">4 Paket</span>
                <span className="text-slate-400 text-[11px]">Modul, Inverter, Roof Rail, AC/DC</span>
              </div>
            </div>

            {/* Launch Banner Inside Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Siap Menjelajahi Dashboard Demo Lengkap?</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Data contoh sudah disiapkan lengkap dengan simulasi struk pembelian modul dan kurva S mingguan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLaunchDemo}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
              >
                Buka Mode Demo Sekarang &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Problem & Comparison: Excel vs Karsa Pantau */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Mengapa Kontraktor PLTS Beralih
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Tantangan Nyata di Lapangan Konstruksi PLTS
          </h2>
          <p className="text-sm text-slate-400">
            Sebagian besar deviasi biaya pada proyek surya terjadi karena lambatnya pelaporan pengeluaran lapangan dan rapuhnya formula spreadsheet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cara Lama (Spreadsheet) */}
          <div className="p-8 rounded-3xl bg-slate-900/30 border border-rose-950/60 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/50">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cara Konvensional (Spreadsheet Excel)</h3>
                <p className="text-xs text-rose-400">Rentan Galat & Sulit Dikontrol Bersama</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Kuitansi Fisik Hilang:</strong> Bukti pembelian baut, kabel, dan sewa crane sering terselip atau baru direkap akhir bulan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Formula Sering Rusak:</strong> Banyak versi file (RAB_final_v2_revisi.xlsx) membingungkan PM dan Direksi.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Deviasi Terlambat Diketahui:</strong> Overbudget baru disadari saat kas proyek sudah habis dan progres terhenti.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Data Tidak Terisolasi:</strong> Dokumen proyek antar-klien mudah tercecer dan tidak memiliki audit trail.</span>
              </li>
            </ul>
          </div>

          {/* Solusi Karsa Pantau */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-sky-800/50 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-950/80 text-sky-400 border border-sky-800/50">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Dengan Karsa Pantau SaaS</h3>
                <p className="text-xs text-emerald-400">Single Source of Truth & Otomatisasi AI</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>AI OCR Kuitansi Lapangan:</strong> Cukup foto struk lewat smartphone, sistem otomatis mengisi nominal dan toko.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Kurva S & EVM Finansial Otomatis:</strong> S-Curve terupdate otomatis setiap ada entri progres dan realisasi biaya.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Deteksi Dini Overbudget:</strong> Sistem memberikan peringatan dini ketika ada realisasi yang melampaui toleransi RAB.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Multi-Tenant Mandiri:</strong> Data setiap perusahaan terisolasi ketat dengan kontrol role (PM, Direksi, Estimator).</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. 4 Core Features Section */}
      <section id="features" className="py-20 bg-slate-900/40 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              Fitur Dirancang Khusus untuk PLTS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Semua yang Dibutuhkan Tim EPC dalam Satu Aplikasi
            </h2>
            <p className="text-sm text-slate-400">
              Mulai dari tahap estimasi pra-kontrak hingga serah terima proyek (COD) berjalan dalam alur yang rapi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-950 flex items-center justify-center text-sky-400 border border-sky-800">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">RAB & AHSP PLTS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Struktur WBS standar: pengadaan modul PV, inverter, mounting rooftop, pengkabelan DC/AC, hingga komisioning.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-950 flex items-center justify-center text-amber-400 border border-amber-800">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Kurva S & EVM</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analisis Planned Value (PV), Earned Value (EV), Actual Cost (AC), CPI & SPI secara real-time tanpa hitung manual.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">AI OCR Struk Offline</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supervisor lapangan dapat mengunggah bukti pengeluaran saat offline; sistem menyinkronkan data begitu tersambung sinyal.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-950 flex items-center justify-center text-purple-400 border border-purple-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Level Approval</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Workflow persetujuan berjenjang: Estimator menyusun &rarr; PM meninjau &rarr; Direksi menyetujui baseline anggaran resmi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Section (Free Trial & Starter EPC TBA) */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-[11px] font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fase Early Adopter & Design Partner</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Paket Khusus Tahap Pengembangan Awal
          </h2>
          <p className="text-sm text-slate-400">
            Kami memprioritaskan masukan langsung dari kontraktor PLTS agar produk ini benar-benar menyelesaikan masalah nyata di lapangan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tier 1: Free Trial (Pilot Partner) */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Free Trial</h3>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Pilot Partner
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Akses penuh evaluasi untuk menguji Karsa Pantau pada proyek nyata Anda selama masa Beta.
              </p>
              <div>
                <div className="text-3xl font-black text-white">Rp 0</div>
                <span className="text-xs text-emerald-400 font-medium">Gratis Selama Masa Evaluasi</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1 Proyek Konstruksi PLTS Aktif</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>3 Pengguna Lapangan & PM</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>50x Ekstraksi Struk OCR / Bulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Kalkulasi Kurva S & EVM Penuh</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Akses PWA Offline Lapangan</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register?plan=TRIAL"
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white text-center transition-all shadow-md block"
            >
              Mulai Free Trial Sekarang &rarr;
            </Link>
          </div>

          {/* Tier 2: Starter EPC (Harga TBA) */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border-2 border-sky-500 shadow-2xl shadow-sky-500/10 flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sky-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider">
              Rekomendasi Kontraktor
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Starter EPC</h3>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  Co-Creation
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kapasitas ideal untuk kontraktor PLTS komersial & industri dengan portofolio multi-proyek.
              </p>
              <div>
                <div className="text-3xl font-black text-amber-400">TBA</div>
                <span className="text-xs text-slate-400 font-medium">To Be Announced (Dalam Diskusi Klien)</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Hingga <strong>5 Proyek Aktif</strong> Simultan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span><strong>10 Pengguna</strong> (PM, Site, Estimator)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span><strong>300x</strong> Ekstraksi Struk OCR / Bulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Deteksi Anomali Biaya Real-time</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Ekspor Laporan PDF Direksi & Excel</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowFeedbackModal(true)}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 text-center transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              Beri Masukan Harga / Request Akses &rarr;
            </button>
          </div>

          {/* Tier 3: Enterprise & Utility */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Enterprise</h3>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                  Utility Scale
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dukungan skala utilitas untuk konsorsium pengembang PLTS skala gigawatt (GW).
              </p>
              <div>
                <div className="text-3xl font-black text-white">Konsultasi</div>
                <span className="text-xs text-slate-400 font-medium">Custom Sesuai Kebutuhan</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Unlimited Proyek & Pengguna</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Dedicated Throughput AI Gateway (9Router)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Integrasi Custom ERP / On-Premise</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>SLA 99.9% & Dedicated Manager</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowFeedbackModal(true)}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white text-center transition-all shadow-md cursor-pointer"
            >
              Hubungi Tim Pengembang &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* 7. Client Feedback / Co-Creation Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Masukan Klien Kontraktor PLTS</h3>
                  <p className="text-xs text-slate-400">Bantu kami menentukan harga dan fitur yang paling pas.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">Terima Kasih Banyak atas Masukan Anda!</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Masukan Anda sangat berharga bagi roadmap Karsa Pantau. Tim kami akan menghubungi Anda untuk memberikan status prioritas Early Access.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Budi Santoso"
                      value={feedbackData.name}
                      onChange={(e) => setFeedbackData({ ...feedbackData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nama Perusahaan / EPC</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PT Surya Mandiri EPC"
                      value={feedbackData.company}
                      onChange={(e) => setFeedbackData({ ...feedbackData, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Resmi / WhatsApp</label>
                  <input
                    type="email"
                    required
                    placeholder="budi@suryamandiri.id"
                    value={feedbackData.email}
                    onChange={(e) => setFeedbackData({ ...feedbackData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Berapa budget langganan bulanan yang masuk akal bagi perusahaan Anda?
                  </label>
                  <select
                    value={feedbackData.expectedBudget}
                    onChange={(e) => setFeedbackData({ ...feedbackData, expectedBudget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="under_1jt">&lt; Rp 1.000.000 / bulan</option>
                    <option value="1-3jt">Rp 1.000.000 – Rp 3.000.000 / bulan</option>
                    <option value="3-5jt">Rp 3.000.000 – Rp 5.000.000 / bulan</option>
                    <option value="above_5jt">&gt; Rp 5.000.000 / bulan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Catatan / Fitur yang paling mendesak dibutuhkan di lapangan:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Butuh integrasi format laporan mingguan ke Direksi, approval bertingkat, dan pencatatan sewa alat berat..."
                    value={feedbackData.notes}
                    onChange={(e) => setFeedbackData({ ...feedbackData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Masukan Klien</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 8. Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center space-x-2.5">
            <Sun className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white text-sm">Karsa Pantau</span>
            <span>&mdash; Sistem Budgeting & Monitoring Proyek Konstruksi PLTS</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">
              Paket Harga
            </Link>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Masukan Klien
            </button>
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="hover:text-sky-400 transition-colors font-medium">
              Daftar Trial
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
