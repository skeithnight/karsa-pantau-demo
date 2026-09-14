'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Layers,
  Calculator,
  PlusCircle,
  Activity,
  FileSpreadsheet,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  Users,
  Camera,
  MapPin,
  Calendar,
  Wallet,
  Play,
  FileText,
  Clock,
  ShieldAlert,
  Bot,
  GitCompare,
  HardHat,
} from 'lucide-react';

type RoleTab = 'onboarding' | 'estimator' | 'supervisor' | 'pm' | 'finance' | 'approver' | 'admin' | 'faq';

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<RoleTab>('onboarding');

  const roleNavItems = [
    {
      id: 'onboarding',
      label: '1. Onboarding & Video E2E',
      roleBadge: 'Semua Pengguna',
      icon: Play,
      color: 'text-amber-400',
    },
    {
      id: 'estimator',
      label: '2. Estimator & QS',
      roleBadge: 'Estimator / QS',
      icon: Calculator,
      color: 'text-sky-400',
    },
    {
      id: 'supervisor',
      label: '3. Site Supervisor & Mandor',
      roleBadge: 'Supervisor / Mandor',
      icon: HardHat,
      color: 'text-emerald-400',
    },
    {
      id: 'pm',
      label: '4. Project Manager (PM)',
      roleBadge: 'Project Manager',
      icon: Activity,
      color: 'text-purple-400',
    },
    {
      id: 'finance',
      label: '5. Finance & Purchasing',
      roleBadge: 'Finance / AP',
      icon: DollarSign,
      color: 'text-amber-400',
    },
    {
      id: 'approver',
      label: '6. Approver & Owner / Direksi',
      roleBadge: 'Owner / Direksi',
      icon: ShieldCheck,
      color: 'text-rose-400',
    },
    {
      id: 'admin',
      label: '7. Administrator Perusahaan',
      roleBadge: 'Admin / Subscriber',
      icon: Users,
      color: 'text-blue-400',
    },
    {
      id: 'faq',
      label: '8. Tanya Jawab (FAQ) & SOP',
      roleBadge: 'Panduan Praktis',
      icon: HelpCircle,
      color: 'text-slate-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/80 text-xs font-semibold text-sky-400 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pusat Tutorial & Dokumentasi Peran Operasional EPC v2.0</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Panduan Komprehensif Berdasarkan Peran Kerja (Role-Based)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Tutorial langkah-demi-langkah dilengkapi rekaman video interaktif, tangkapan layar antarmuka asli, dan SOP operasional kontraktor lapangan hingga level direksi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/demo"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Buka Simulasi Demo Langsung</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Sidebar Role Selector + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 sticky top-24 shadow-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider">
              Pilih Peran Kerja (Role)
            </p>
            {roleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as RoleTab)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <div className={`text-[10px] font-mono ${isActive ? 'text-sky-200' : 'text-slate-500'}`}>
                        {item.roleBadge}
                      </div>
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Details Area */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/60 border border-slate-800 space-y-8 text-sm leading-relaxed text-slate-300 shadow-2xl">

            {/* TAB 1: ONBOARDING & VIDEO E2E */}
            {activeTab === 'onboarding' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-semibold mb-2">
                    Langkah Awal & Rekaman Alur
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <Play className="w-6 h-6 text-amber-400" />
                    Video Tutorial End-to-End & Alur Onboarding Cepat
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Tonton video alur kerja interaktif Karsa Pantau dari login, navigasi dashboard, simulasi input belanja lapangan, hingga evaluasi Kurva S.
                  </p>
                </div>

                {/* Video Player Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-4 space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span className="font-mono flex items-center gap-1.5 text-slate-300 font-semibold">
                      <Play className="w-3.5 h-3.5 text-amber-400" /> Rekaman Demonstrasi Alur Pengguna (E2E Flow)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
                      Format: MP4 (Full HD)
                    </span>
                  </div>

                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                    <video
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                      src="/docs/karsa_e2e_flow.mp4"
                    >
                      Browser Anda tidak mendukung tag video. Silakan unduh video panduan langsung.
                    </video>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center italic">
                    Video di atas merekam alur otentikasi peran, penjelajahan modul RAB, verifikasi approval, dan audit anomali biaya secara otomatis.
                  </p>
                </div>

                {/* 4 Tahap Siklus Proyek EPC */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-base font-bold text-white">4 Siklus Hidup Proyek dalam Karsa Pantau:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">1</div>
                      <h4 className="font-bold text-white">Fase Tender & Penyusunan RAB</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Estimator mengunggah Excel BOQ atau menyusun item pekerjaan berbasis katalog AHSP, dilindungi oleh Historical Price Guardrail.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">2</div>
                      <h4 className="font-bold text-white">Otorisasi & Baseline Locking</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Approver/Owner menandatangani RAB v1.0. Sistem mengunci baseline kontrak; pengeluaran riil hanya boleh diinput setelah status <em>Approved</em>.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">3</div>
                      <h4 className="font-bold text-white">Eksekusi Lapangan (Field Ops)</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Mandor/Supervisor mencatat Laporan Harian Cuaca, absensi pekerja, foto progres ber-GPS, serta kas kecil (Petty Cash).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">4</div>
                      <h4 className="font-bold text-white">Evaluasi EVM & Jurnal Keuangan</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Project Manager memantau Kurva S, CPI/SPI, dan anomali biaya. Tim finance mengekspor jurnal transaksi untuk Accurate/SAP.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ESTIMATOR & QS */}
            {activeTab === 'estimator' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-mono font-semibold mb-2">
                    Peran: Estimator & Quantity Surveyor (QS)
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <Calculator className="w-6 h-6 text-sky-400" />
                    Panduan Penyusunan RAB, Smart BOQ Parser, & Price Guardrail
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Pelajari cara mengimpor ribuan baris BOQ dari Excel tender, memanfaatkan kecerdasan pembanding harga historis, dan membandingkan versi adendum RAB (CCO).
                  </p>
                </div>

                {/* Feature 1: Explainable BOQ Parser */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                    1. Impor BOQ Excel & Human-in-the-Loop Mapping
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Kontraktor sering menerima format BOQ yang tidak seragam dari konsultan tender. Karsa Pantau menyediakan <strong>Explainable AI BOQ Parser</strong> yang memberikan transparansi skor keyakinan per kolom (*Contoh: 98% Sesuai*), pratinjau 3 baris data nyata, dan tombol penguncian kolom sebelum data dimasukkan ke RAB.
                  </p>
                  <div className="rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src="/docs/boq_excel.png"
                      alt="Modal Verifikasi Mapping BOQ Excel"
                      className="w-full object-cover hover:scale-[1.01] transition-transform"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-sky-400">💡 Langkah Praktis Estimator:</span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Buka formulir <strong>RAB Builder</strong> di <code>/projects/[id]/rab/new</code>.</li>
                      <li>Klik <strong>"Upload Excel BOQ"</strong> dan pilih berkas tender <code>.xlsx</code> atau <code>.csv</code>.</li>
                      <li>Periksa dropdown pemetaan: WBS, Deskripsi Pekerjaan, Volume, Satuan, dan Harga Satuan.</li>
                      <li>Klik <strong>"Konfirmasi & Kunci Mapping BOQ"</strong> untuk menghitung subtotal otomatis.</li>
                    </ol>
                  </div>
                </div>

                {/* Feature 2: Historical Price Guardrail */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    2. Historical Price Intelligence Guardrail
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Mencegah kesalahan ketik (*typo nol*) atau mark-up tidak wajar yang lolos saat masa tender. Sistem secara otomatis membandingkan harga satuan yang Anda ketik dengan nilai <strong>median</strong> dari proyek sejenis. Jika deviasi melebihi 25%, kartu peringatan merah akan muncul seketika beserta kolom wajib <strong>Catatan Justifikasi Audit</strong>.
                  </p>
                  <div className="rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src="/docs/price_guardrail.png"
                      alt="Historical Price Guardrail Alert"
                      className="w-full object-cover hover:scale-[1.01] transition-transform"
                    />
                  </div>
                </div>

                {/* Feature 3: Git-like RAB Versioning & Delta Diff */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-emerald-400" />
                    3. Git-like RAB Versioning & Delta Diff Engine
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Saat Owner menerbitkan revisi desain atau <em>Contract Change Order</em> (CCO), Anda tidak perlu lagi membandingkan dua file Excel secara manual. Buka halaman <code>/projects/[id]/rab/diff</code> untuk melihat penyorotan warna visual:
                  </p>
                  <ul className="text-xs space-y-1 list-disc list-inside text-slate-400">
                    <li><strong className="text-emerald-400">🟢 Hijau (Baru)</strong>: Item pekerjaan scope baru yang ditambahkan pada adendum.</li>
                    <li><strong className="text-amber-400">🟡 Kuning (Revisi)</strong>: Item yang mengalami perubahan volume atau harga satuan, lengkap dengan nilai selisih (*Net Delta*).</li>
                    <li><strong className="text-rose-400">🔴 Merah (Dihapus)</strong>: Item yang dibatalkan oleh Owner.</li>
                  </ul>
                  <div className="rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src="/docs/rab_diff.png"
                      alt="Git-like RAB Diff Table"
                      className="w-full object-cover hover:scale-[1.01] transition-transform"
                    />
                  </div>
                </div>

                {/* Feature 4: Vendor Catalog */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    4. Master Perpustakaan Harga Vendor & Riwayat RAB
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Estimator dapat mengakses menu <code>/catalog</code> untuk melihat basis data harga upah harian lokal, bahan material supplier, sewa alat berat, dan penawaran subkontraktor yang siap diimpor massal via Excel.
                  </p>
                  <div className="rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src="/docs/vendor_catalog.png"
                      alt="Katalog Master Harga Vendor"
                      className="w-full object-cover hover:scale-[1.01] transition-transform"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SITE SUPERVISOR & MANDOR */}
            {activeTab === 'supervisor' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold mb-2">
                    Peran: Site Supervisor & Mandor Utama
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <HardHat className="w-6 h-6 text-emerald-400" />
                    Panduan Operasional Lapangan: Log Harian, Foto GPS, & Kasbon
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Panduan ringkas dan cepat untuk personel di lapangan proyek yang menggunakan tablet atau smartphone.
                  </p>
                </div>

                {/* Feature 1: Daily Site Log & Rain Delay */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    1. Pengisian Laporan Harian (Daily Site Log & Cuaca)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Setiap sore sebelum meninggalkan site, Site Supervisor wajib mengisi catatan harian di <code>/projects/[id]/daily-logs</code>. Catatan ini adalah dokumen hukum utama kontraktor jika terjadi hujan lebat (*Force Majeure*) untuk mengajukan klaim <strong>Extension of Time (EOT)</strong> ke Owner agar bebas dari denda keterlambatan!
                  </p>
                  <div className="rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src="/docs/daily_log.png"
                      alt="Modal Input Laporan Harian Cuaca dan Pekerja"
                      className="w-full object-cover hover:scale-[1.01] transition-transform"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-emerald-400">📋 Data yang Wajib Diisi:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                      <li><strong>Kondisi Cuaca 3 Sesi</strong>: Pagi, Siang, dan Sore (Cerah / Berawan / Gerimis / Hujan Lebat / Banjir).</li>
                      <li><strong>Jam Hilang</strong>: Catat jika ada hujan lebat yang menghentikan pekerjaan (misal: 4 jam hilang).</li>
                      <li><strong>Jumlah Kehadiran Pekerja</strong>: Mandor, Tukang, Kenek/Helper, dan Operator Alat.</li>
                      <li><strong>Utilisasi Alat Berat</strong>: Status Excavator, Mobile Crane, dan Genset (Beroperasi / Standby / Rusak).</li>
                    </ul>
                  </div>
                </div>

                {/* Feature 2: Kasbon Lapangan & Petty Cash Settlement */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    2. Manajemen Kasbon Lapangan (Petty Cash)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Site Supervisor sering membutuhkan uang kas mendesak (beli solar genset, kawat bendrat darurat, uang lembur). Melalui menu <code>/projects/[id]/petty-cash</code>:
                  </p>
                  <ol className="text-xs list-decimal list-inside space-y-1 text-slate-400">
                    <li>Klik <strong>"+ Ajukan Kasbon Lapangan"</strong>, isi nominal dan keperluan belanja.</li>
                    <li>Tunggu otorisasi Project Manager. Begitu disetujui, kasir site mencairkan dana tunai.</li>
                    <li>Setelah belanja, klik tombol <strong>"+ Settle Nota"</strong> untuk memasukkan nilai nota riil, menghitung sisa kembalian, dan memotret kuitansi toko/SPBU dengan koordinat GPS valid.</li>
                  </ol>
                  <div className="rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src="/docs/petty_cash.png"
                      alt="Modal Settlement Kasbon dengan Nota GPS"
                      className="w-full object-cover hover:scale-[1.01] transition-transform"
                    />
                  </div>
                </div>

                {/* Feature 3: Photo-to-Progress GPS */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    3. Input Realisasi Biaya & Foto Lapangan Ber-GPS
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Formulir <code>/projects/[id]/actual/new</code> dilindungi fitur <strong>Separation of Duties</strong> (khusus peran Supervisor & PM). Dilengkapi pendeteksi GPS otomatis dari perangkat peramban dan cap watermark stempel koordinat & waktu anti-rekayasa pada foto opname.
                  </p>
                  <div className="rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src="/docs/actual_input.png"
                      alt="Form Realisasi Lapangan dengan Peringatan Overbudget"
                      className="w-full object-cover hover:scale-[1.01] transition-transform"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PROJECT MANAGER */}
            {activeTab === 'pm' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-mono font-semibold mb-2">
                    Peran: Project Manager (PM)
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <Activity className="w-6 h-6 text-purple-400" />
                    Panduan Project Manager: Evaluasi EVM, Kurva S, & Audit Anomali
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Alat kendali proyek untuk memastikan margin keuntungan tidak tergerus dan jadwal penyelesaian tepat waktu.
                  </p>
                </div>

                {/* Feature 1: Project Dashboard & Kurva S */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    1. Membaca Metrik Earned Value Management (EVM)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Pada halaman utama dashboard proyek (<code>/projects/[id]</code>), sistem menghitung metrik finansial standar internasional secara deterministik:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block font-mono">Cost Performance (CPI)</span>
                      <span className="text-base font-bold text-emerald-400 mt-0.5 block">&gt; 1.0 (Hemat)</span>
                      <span className="text-[10px] text-slate-500">Nilai fisik &gt; biaya riil terbayar</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block font-mono">Schedule Index (SPI)</span>
                      <span className="text-base font-bold text-sky-400 mt-0.5 block">&ge; 1.0 (Tepat Waktu)</span>
                      <span className="text-[10px] text-slate-500">Progres riil &ge; target rencana</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block font-mono">Estimate at Completion (EAC)</span>
                      <span className="text-base font-bold text-amber-400 mt-0.5 block">Proyeksi Akhir</span>
                      <span className="text-[10px] text-slate-500">Estimasi total biaya saat serah terima</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block font-mono">Cost Variance (CV)</span>
                      <span className="text-base font-bold text-white mt-0.5 block">EV - AC</span>
                      <span className="text-[10px] text-slate-500">Selisih laba kotor langsung</span>
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src="/docs/project_dashboard.png"
                      alt="Dashboard Proyek Kurva S dan EVM"
                      className="w-full object-cover hover:scale-[1.01] transition-transform"
                    />
                  </div>
                </div>

                {/* Feature 2: Audit Anomali WBS */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    2. Audit Anomali Deviasi Biaya & Kebocoran Anggaran
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Klik tombol <strong>"Periksa Anomali Biaya"</strong> pada dashboard untuk memindai seluruh item pekerjaan WBS yang realisasinya menyimpang lebih dari 10% dari rencana baseline. Temuan deviasi dirangkum menjadi narasi insight otomatis:
                  </p>
                  <div className="rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src="/docs/anomaly_audit.png"
                      alt="Hasil Audit Anomali Biaya WBS"
                      className="w-full object-cover hover:scale-[1.01] transition-transform"
                    />
                  </div>
                </div>

                {/* Feature 3: AI Copilot Proyek */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-sky-400" />
                    3. Konsultasi Cepat via AI Copilot Proyek
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Klik tombol melayang di pojok kanan bawah untuk membuka drawer chat asisten AI. Anda dapat menanyakan ringkasan status pekerjaan, mencari penyebab keterlambatan, atau menghitung sisa pagu biaya tanpa harus membuka lembar Excel berlembar-lembar.
                  </p>
                  <div className="rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src="/docs/copilot_chat.png"
                      alt="AI Copilot Chat Asisten Proyek"
                      className="w-full object-cover hover:scale-[1.01] transition-transform"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: FINANCE & PURCHASING */}
            {activeTab === 'finance' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-semibold mb-2">
                    Peran: Finance, Kasir Proyek & Purchasing
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <DollarSign className="w-6 h-6 text-amber-400" />
                    Panduan Portal Keuangan, Jurnal Akuntansi, & Hutang Vendor (AP)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Jembatan integrasi antara operasi fisik proyek di lapangan dengan pembukuan akuntansi kantor pusat.
                  </p>
                </div>

                <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    1. Portal Keuangan Terintegrasi (`/finance`)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Finance Manager dapat memantau estimasi <em>Gross Profit Margin</em> proyek, total pengeluaran kas riil yang telah dibayarkan, serta daftar kewajiban pembayaran tempo (*Accounts Payable*) ke vendor supplier material.
                  </p>
                  <div className="rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src="/docs/finance_portal.png"
                      alt="Portal Keuangan dan Ekspor Jurnal Akuntansi"
                      className="w-full object-cover hover:scale-[1.01] transition-transform"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-amber-400">📊 Ekspor Jurnal Akuntansi:</span>
                    <p className="text-slate-400 leading-relaxed">
                      Klik tombol <strong>"Ekspor Jurnal Pengeluaran (.CSV)"</strong> untuk menghasilkan data transaksi siap impor ke software akuntansi populer Indonesia seperti <strong>Accurate Online, Zahir, Jurnal.id, atau SAP</strong> tanpa perlu entri ulang manual.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: APPROVER & OWNER / DIREKSI */}
            {activeTab === 'approver' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-mono font-semibold mb-2">
                    Peran: Approver, Owner Proyek, & Direksi
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <ShieldCheck className="w-6 h-6 text-rose-400" />
                    Panduan Approver: Otorisasi RAB, CCO, & Kontrol Multi-Proyek
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Tata cara review dan persetujuan bertingkat dengan integritas audit trail permanen.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400" />
                      Alur Persetujuan Bertingkat (Approval Flow):
                    </h3>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                      <li>Buka menu <strong>Approvals</strong> (<code>/approvals</code>) pada bilah navigasi utama.</li>
                      <li>Pilih berkas pengajuan RAB atau adendum perubahan volume (CCO) yang berstatus <em>Submitted</em>.</li>
                      <li>Gunakan tautan <strong>"Lacak Revisi & Diff RAB"</strong> untuk menginspeksi rincian penambahan/pengurangan biaya secara transparan.</li>
                      <li>Klik <strong>"Setujui (Approve)"</strong> untuk mengunci baseline atau berikan catatan revisi jika ditolak.</li>
                    </ol>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 space-y-1.5">
                    <span className="font-bold text-sky-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" /> Portofolio Multi-Proyek:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      Direksi dapat memantau seluruh portofolio proyek konstruksi yang sedang berjalan (ongoing) dalam satu layar, mencakup progres fisik rata-rata, deviasi biaya kumulatif, dan status kesehatan kontrak.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: ADMINISTRATOR PERUSAHAAN */}
            {activeTab === 'admin' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-mono font-semibold mb-2">
                    Peran: Administrator & Subscriber SaaS
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <Users className="w-6 h-6 text-blue-400" />
                    Panduan Administrator: Manajemen Tim, Kuota Kursi, & Langganan
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Pengelolaan entitas organisasi kontraktor, undang anggota tim, dan penugasan peran kerja.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-sm font-bold text-white">Manajemen Tim di Halaman <code>/team</code>:</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Sebagai pelanggan paket <em>Starter EPC</em> atau <em>Pro Contractor</em>, administrator dapat mengundang rekan kerja dengan hak akses yang terisolasi:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      <li><strong>Project Manager</strong>: Kontrol penuh atas jadwal, EVM, otorisasi kasbon, dan laporan harian.</li>
                      <li><strong>Estimator</strong>: Akses menyusun RAB, impor BOQ Excel, dan katalog harga vendor.</li>
                      <li><strong>Site Supervisor / Mandor</strong>: Akses input realisasi belanja dan pengisian Laporan Harian di lapangan.</li>
                      <li><strong>Finance</strong>: Akses portal keuangan, pencairan kasbon, dan ekspor jurnal akuntansi.</li>
                      <li><strong>Approver / Owner</strong>: Akses persetujuan dokumen tender dan monitoring eksekutif.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-sm font-bold text-white">Pengaturan Langganan di <code>/settings/billing</code>:</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Periksa sisa masa aktif langganan, jumlah kursi pengguna yang terpakai, dan opsi upgrade paket kapasitas proyek tak terbatas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: FAQ & SOP */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-700 text-xs font-mono font-semibold mb-2">
                    Pusat Tanya Jawab & Standar Operasional Prosedur (SOP)
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <HelpCircle className="w-6 h-6 text-slate-400" />
                    Pertanyaan Umum (FAQ) & Kepatuhan Audit
                  </h2>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white">Q: Bagaimana cara kerja aplikasi jika di lokasi proyek tidak ada sinyal internet?</h4>
                    <p className="text-slate-400 leading-relaxed">
                      A: Karsa Pantau adalah <strong>Progressive Web App (PWA)</strong>. Anda tetap dapat membuka formulir input realisasi dan laporan harian secara offline. Data akan tersimpan di peramban lokal (IndexedDB) dan otomatis tersinkronisasi saat sinyal kembali pulih.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white">Q: Apakah formula EVM (Earned Value Management) dihitung oleh AI atau kalkulator pasti?</h4>
                    <p className="text-slate-400 leading-relaxed">
                      A: Seluruh perhitungan finansial (PV, EV, AC, CPI, SPI, EAC, dan Variance) <strong>100% dihitung secara deterministik matematis</strong> di backend NestJS. Lapisan AI hanya digunakan untuk menyusun kalimat narasi penjelasan dan rekomendasi strategis, tidak pernah menghitung ulang angka finansial.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white">Q: Bagaimana dasar hukum klaim perpanjangan waktu (EOT) akibat hujan lebat?</h4>
                    <p className="text-slate-400 leading-relaxed">
                      A: Berdasarkan klausul standar kontrak konstruksi FIDIC / Permen PUPR, hujan lebat yang menghentikan aktivitas pekerjaan kritis dikategorikan sebagai keadaan kahar (*Force Majeure*). Rekap jam hilang di <strong>Daily Site Log</strong> dapat diekspor menjadi Berita Acara resmi untuk melampirkan permohonan penambahan waktu kalender tanpa denda keterlambatan.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
