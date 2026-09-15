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
  Building2,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  Send,
  Building,
  Hammer,
  Wallet,
  CalendarClock,
  Cpu,
  Download,
  FileText,
  BadgePercent,
  ChevronRight,
  MessageSquare,
  GitCompare,
  GitBranch,
  MapPin,
  Camera,
  ShieldAlert,
} from 'lucide-react';
import { setAuthToken, setActiveOrganization } from '../lib/api';
import { KarsaLogo } from '../components/KarsaLogo';


export default function LandingPage() {
  const router = useRouter();

  // State Feedback Modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    company: '',
    email: '',
    sector: 'general_contractor',
    expectedBudget: '1-3jt',
    priorityFeatures: 'import_excel_boq',
    notes: '',
  });

  // 1-Click Interactive Demo Launcher
  const handleLaunchDemo = async () => {
    try {
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
          name: 'PT Karsa Konstruksi Mandiri (Demo)',
          slug: 'karsa-demo',
          tier: 'starter_epc',
        };
        setActiveOrganization(org);
      }
    } catch {
      // Fallback tetap arahkan ke demo jika offline
    }
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
        sector: 'general_contractor',
        expectedBudget: '1-3jt',
        priorityFeatures: 'import_excel_boq',
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
            Karsa Pantau kini membuka akses Beta untuk kontraktor EPC & Konstruksi Umum Indonesia (Gedung, Sipil, MEP, & Energi).
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 shadow-xl backdrop-blur-md">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>Platform SaaS Manajemen Anggaran & Biaya Lapangan Konstruksi (General EPC)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Kendalikan Anggaran, RAB AHSP & Realisasi Biaya Proyek{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400">
              Secara Presisi
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            Tinggalkan spreadsheet manual yang rentan bocor dan formula rusak. Karsa Pantau mengintegrasikan penyusunan 
            RAB standar AHSP, otomatisasi Kurva S & EVM, serta teknologi AI cerdas untuk mem-parse dokumen BOQ tender, 
            mengontrol kas keluar, dan melayani kebutuhan pelaporan tim Finance.
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

          {/* Sektor Industri Konstruksi yang Didukung */}
          <div className="pt-6">
            <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-3">
              Mendukung Berbagai Disiplin Proyek Kontraktor & EPC:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-sky-400" /> Gedung & Komersial
              </span>
              <span className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <Hammer className="w-3.5 h-3.5 text-amber-400" /> Infrastruktur & Sipil
              </span>
              <span className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Mekanikal & Elektrikal (MEP)
              </span>
              <span className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-orange-400" /> Energi Terbarukan & PLTS
              </span>
            </div>
          </div>

          {/* Key Value Metric Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xl font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>100% EVM</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Kalkulasi CPI & SPI deterministik tanpa asumsi halu AI</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xl font-bold text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                <span>AI Excel Parser</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Impor BOQ tender & katalog harga bahan dalam hitungan detik</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xl font-bold text-white flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>Finance Ready</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Monitoring margin kas keluar & ekspor jurnal siap akuntansi</p>
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

      {/* 3. NEW SECTION: Senjata Rahasia Kontraktor EPC & Solusi Finansial (MARKETING SHOWCASE) */}
      <section id="ai-roadmap" className="py-20 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-[11px] font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Senjata Rahasia Kontraktor EPC</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Bukan Sekadar Pengganti Excel — Dibangun untuk Realitas Lapangan
            </h2>
            <p className="text-sm text-slate-400">
              Karsa Pantau mengatasi titik kritis yang membuat proyek konstruksi rugi: 
              dari revisi RAB tender tak terkontrol, nota belanja typo, klaim progres fiktif, hingga defisit arus kas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1: Explainable AI BOQ Parser */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border-2 border-sky-500/40 hover:border-sky-400 transition-all space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800">
                  Live &bull; Human-in-the-Loop
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Explainable AI BOQ Parser</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bukan black-box. AI mendeteksi kolom Excel tender dan menampilkan <strong>Confidence Score per kolom</strong> (98% akurasi) dengan live preview dan editor mapping sebelum data dikunci ke lembar kerja RAB.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-300">✓ Confidence Score</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-300">✓ Human-Verified</span>
              </div>
            </div>

            {/* Pillar 2: Git-like RAB Versioning & Diff */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border-2 border-amber-500/40 hover:border-amber-400 transition-all space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <GitCompare className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  Live &bull; CCO Tracking
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Git-like RAB Versioning & Diff</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Lacak setiap revisi Owner dan Addendum CCO layaknya commit code. Visualisasi Diff menyorot baris baru (hijau), volume/harga berubah (kuning), dan scope dicoret (merah) beserta kalkulasi dampak netto kontrak.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300">✓ Visual Delta Diff</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300">✓ Ekspor CCO .CSV</span>
              </div>
            </div>

            {/* Pillar 3: Photo-to-Progress with GPS Geotag */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border-2 border-emerald-500/40 hover:border-emerald-400 transition-all space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Live &bull; Anti-Fake Proof
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Photo Geotag & Anti-Fake Time</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mandor wajib mengunggah foto progres atau kwitansi via kamera HP. Aplikasi otomatis menempelkan koordinat GPS riil dan timestamp permanen untuk bukti tak terbantahkan saat pengajuan termin ke Owner.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-300">✓ GPS Coordinate Stamp</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-300">✓ Termin Protection</span>
              </div>
            </div>

            {/* Pillar 4: Historical Price Guardrail */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                  Live &bull; Anti Mark-Up
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Historical Price Guardrail</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pencegahan salah ketik nol dan mark-up harga. Saat input harga satuan di atas 25% dari median historis, muncul peringatan otomatis dan mewajibkan catatan justifikasi audit sebelum disimpan.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Median Deviation Alert</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Audit Justification</span>
              </div>
            </div>

            {/* Pillar 5: Portal Keuangan & Ekspor Akuntansi */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  Live &bull; Finance Ready
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Portal Keuangan & Ekspor Jurnal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pantau Gross Margin real-time, kas keluar aktual, dan Accounts Payable hutang vendor tempo 30 hari. Ekspor jurnal pengeluaran siap pakai untuk software akuntansi (Accurate, Zahir, SAP, Jurnal.id).
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">AP Vendor Tracker</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Jurnal Otomatis (.CSV)</span>
              </div>
            </div>

            {/* Pillar 6: Dynamic Cashflow Forecasting */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  Roadmap &bull; Cashflow Shield
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Simulasi Cashflow "What-If"</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Menjawab pertanyaan kritis direksi: <em>"Bagaimana jika Owner telat bayar termin 30 hari?"</em> Sistem memproyeksikan minggu defisit dan merekomendasikan negosiasi tempo supplier atau percepatan termin.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">What-If Delay Simulator</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Mitigasi Defisit Kas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Demo Showcase Section */}
      <section id="demo" className="py-16 bg-slate-900/30 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              Eksplorasi Langsung Tanpa Registrasi
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Coba Pengalaman Riil Simulasi Proyek Konstruksi
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
                  <h3 className="text-lg font-bold text-white">Proyek Konstruksi & Instalasi Komersial (Demo Site)</h3>
                  <p className="text-xs text-slate-400">Kawasan Industri Cikarang &bull; Kategori: General EPC & MEP &bull; Status: Ongoing</p>
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
                <span className="text-slate-400 block">Paket Pekerjaan Terverifikasi</span>
                <span className="text-xl font-black text-amber-400 mt-1 block">4 Paket</span>
                <span className="text-slate-400 text-[11px]">Struktur, Elektrikal, Alat, Overhead</span>
              </div>
            </div>

            {/* Launch Banner Inside Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Siap Uji Coba Langsung di Browser Anda?</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Data simulasi sudah diisi lengkap dengan histori kurva S, realisasi lapangan, dan audit trail AI.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLaunchDemo}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Mulai Sesi Demo Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Spreadsheet vs Karsa Pantau Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Mengapa Kontraktor Beralih ke Karsa Pantau?
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Excel Bagus untuk Hitungan Cepat, Tapi Bahaya untuk Kontrol Proyek Besar
          </h2>
          <p className="text-sm text-slate-400">
            Perbandingan langsung bagaimana Karsa Pantau menutup celah kebocoran anggaran yang biasa terjadi pada spreadsheet manual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Masalah Spreadsheet */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-rose-900/30 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-900/50">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cara Konvensional (Spreadsheet Excel)</h3>
                <p className="text-xs text-rose-400">Rentan Galat, Lambat & Bikin Pusing Tim Finance</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Ketik Ulang BOQ Berhari-hari:</strong> Estimator menghabiskan waktu berharga hanya untuk menyalin ratusan baris BOQ dari tender Owner.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Formula Sering Rusak:</strong> Banyak versi file (RAB_final_v2_revisi.xlsx) membingungkan PM, Direksi, dan Owner.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Kas Macet Tak Terdeteksi:</strong> Kehabisan kas (*cashflow deficit*) baru disadari saat uang rekening kosong dan supplier menolak kirim barang.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span><strong>Orang Finance Kesulitan Rekap:</strong> Nota kuitansi terselip dan harus direkap manual satu persatu ke software akuntansi.</span>
              </li>
            </ul>
          </div>

          {/* Solusi Karsa Pantau */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-sky-800/50 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-950/80 text-sky-400 border border-sky-800/50">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Dengan Karsa Pantau SaaS</h3>
                <p className="text-xs text-emerald-400">Single Source of Truth & Otomatisasi AI</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>AI Smart BOQ & Excel Parser:</strong> Upload file Excel apapun, sistem memetakan hierarki pekerjaan otomatis dalam 10 detik.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Kurva S & EVM Finansial Otomatis:</strong> S-Curve dan CPI/SPI terupdate otomatis setiap ada entri progres dan realisasi biaya.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Portal Finance & Export Excel:</strong> Pantau gross margin riil, kontrol hutang vendor, dan ekspor jurnal langsung ke Excel/Accurate.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Multi-Tenant Mandiri:</strong> Data setiap perusahaan terisolasi ketat dengan kontrol role (PM, Direksi, Estimator, Finance).</span>
              </li>
            </ul>
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
            Kami memprioritaskan masukan langsung dari kontraktor konstruksi & EPC agar produk ini benar-benar menyelesaikan masalah nyata di lapangan.
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
                <div className="text-xs text-slate-400 mt-0.5">Gratis 14 Hari &bull; Tanpa Kartu Kredit</div>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Proyek Aktif Evaluasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hingga 5 Anggota Tim (PM, Estimator, Supv)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kurva S & EVM Otomatis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Smart BOQ & Excel Parser (Beta)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Akses PWA Offline Mobile</span>
                </div>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs text-center border border-slate-700 transition-all block"
            >
              Mulai Uji Coba Gratis Sekarang
            </Link>
          </div>

          {/* Tier 2: Starter EPC (Harga TBA / Early Adopter) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-sky-950/40 to-slate-900 border-2 border-sky-500/50 flex flex-col justify-between space-y-6 relative shadow-2xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Starter EPC</h3>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  Rekomendasi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Untuk kontraktor berkembang yang mengelola 2–5 proyek konstruksi simultan per tahun.
              </p>
              <div>
                <div className="text-2xl font-extrabold text-sky-400">Harga Khusus Pilot</div>
                <div className="text-xs text-slate-400 mt-0.5">Diskon 50% untuk Kontraktor Desain Partner</div>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Hingga 5 Proyek Aktif Simultan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Unlimited User & Multi-Level Approval</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>AI Smart BOQ & Katalog Harga Tak Terbatas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Portal Finance & 1-Click Export .xlsx</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Priority Support WhatsApp & Sesi Konsultasi</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFeedbackModal(true)}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs text-center transition-all cursor-pointer shadow-lg shadow-sky-500/25 block"
            >
              Ajukan Sebagai Pilot Partner &rarr;
            </button>
          </div>

          {/* Tier 3: Enterprise Contractor */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Enterprise</h3>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                  Skala Besar
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Untuk korporasi konstruksi multi-divisi yang membutuhkan kustomisasi dan integrasi ERP.
              </p>
              <div>
                <div className="text-2xl font-extrabold text-white">Custom SLA</div>
                <div className="text-xs text-slate-400 mt-0.5">Deployment On-Premise atau Private Cloud</div>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Unlimited Proyek & Unlimited User</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Kustomisasi Format AHSP & Format Laporan Owner</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Integrasi API ke ERP / Software Akuntansi Internal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Dedicated Server & Perjanjian NDA Khusus</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFeedbackModal(true)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs text-center border border-slate-700 transition-all cursor-pointer block"
            >
              Hubungi Tim Kami
            </button>
          </div>
        </div>
      </section>

      {/* 7. Client Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Program Pilot Partner Karsa Pantau</h3>
                  <p className="text-xs text-slate-400">Masukan Anda menentukan roadmap fitur prioritas kami</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
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
                    <label className="block text-slate-300 font-semibold mb-1">Nama Perusahaan / Kontraktor</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PT Mandiri Karya Prima"
                      value={feedbackData.company}
                      onChange={(e) => setFeedbackData({ ...feedbackData, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Resmi / WhatsApp</label>
                    <input
                      type="email"
                      required
                      placeholder="budi@mandirikarya.id"
                      value={feedbackData.email}
                      onChange={(e) => setFeedbackData({ ...feedbackData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Bidang Kontraktor Utama</label>
                    <select
                      value={feedbackData.sector}
                      onChange={(e) => setFeedbackData({ ...feedbackData, sector: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="general_contractor">Kontraktor Gedung / Umum</option>
                      <option value="civil_infra">Infrastruktur & Sipil</option>
                      <option value="mep">Mekanikal & Elektrikal (MEP)</option>
                      <option value="renewable_solar">Energi Terbarukan / PLTS</option>
                      <option value="specialist">Spesialis / Subkontraktor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Fitur mana yang paling mendesak dibutuhkan oleh perusahaan Anda?
                  </label>
                  <select
                    value={feedbackData.priorityFeatures}
                    onChange={(e) => setFeedbackData({ ...feedbackData, priorityFeatures: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="import_excel_boq">AI Smart BOQ Parser (Impor Excel BOQ & Katalog Harga)</option>
                    <option value="finance_portal">Portal Finance (Monitoring Margin, AP Vendor & Export Excel)</option>
                    <option value="cashflow_warning">AI Cashflow Deficit Early Warning (Kurva S Kas)</option>
                    <option value="ai_ahsp">AI AHSP Generator (Koefisien Bahan, Upah & Alat SNI)</option>
                    <option value="kurva_s_evm">Kurva S & EVM Otomatis Lapangan</option>
                  </select>
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
                    Catatan tambahan / kendala terbesar manajemen biaya Anda saat ini:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Butuh impor cepat dari format BOQ tender konsultan, dan rekap hutang vendor ke orang finance..."
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
            <KarsaLogo size={24} />
            <span className="font-bold text-white text-sm">Karsa Pantau</span>
            <span>&mdash; Platform SaaS Manajemen Anggaran & Biaya Lapangan Proyek Konstruksi (General EPC)</span>
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
