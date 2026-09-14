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
  Cpu,
} from 'lucide-react';

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'estimator' | 'field' | 'pm' | 'finance' | 'ai' | 'faq'>(
    'quickstart',
  );

  const navItems = [
    { id: 'quickstart', label: '1. Memulai Cepat & Demo', icon: Zap },
    { id: 'estimator', label: '2. Panduan Estimator (RAB & AHSP)', icon: Calculator },
    { id: 'field', label: '3. Mandor & Supervisor (Realisasi)', icon: PlusCircle },
    { id: 'pm', label: '4. Project Manager (EVM & Kurva S)', icon: Activity },
    { id: 'finance', label: '5. Portal Keuangan & Ekspor', icon: DollarSign },
    { id: 'ai', label: '6. Lapisan AI (9Router & RAG)', icon: Sparkles },
    { id: 'faq', label: '7. Tanya Jawab (FAQ)', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/80 text-xs font-semibold text-sky-400 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dokumentasi Resmi Karsa Pantau v1.0</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Pusat Panduan & Dokumentasi Pengguna
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Panduan komprehensif penggunaan fitur budgeting, pengawasan realisasi lapangan, formula EVM, dan AI assist.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/demo"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 hover:opacity-90 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Uji Coba Langsung di Demo</span>
          </Link>
          <a
            href="https://ai.karsapantau.com"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span>9Router Gateway</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1.5">
          <div className="p-2 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 sticky top-24">
            <p className="text-[10px] uppercase font-bold text-slate-500 px-3 py-2 tracking-wider">
              Daftar Modul Panduan
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 text-sm leading-relaxed text-slate-300">
            {/* TAB 1: QUICKSTART */}
            {activeTab === 'quickstart' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Memulai Cepat & Mode Demo 1-Klik
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Pelajari cara mengeksplorasi sistem Karsa Pantau tanpa hambatan registrasi.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 text-xs space-y-2">
                  <span className="font-bold text-sky-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    Skenario Proyek Skala Nyata:
                  </span>
                  <p className="text-slate-300">
                    Mode demo menyajikan simulasi proyek konstruksi lengkap dengan anggaran baseline, realisasi biaya aktual dari lapangan, perhitungan EVM deterministik, dan wawasan deteksi anomali AI.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">Alur Langkah Onboarding Pengguna Baru:</h3>
                  <ol className="space-y-3 list-decimal list-inside text-xs text-slate-300">
                    <li className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <strong>Langkah 1: Buka Halaman Demo</strong> — Kunjungi menu <Link href="/demo" className="text-sky-400 underline font-mono">/demo</Link>. Sistem otomatis mengautentikasi Anda sebagai guest Project Manager.
                    </li>
                    <li className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <strong>Langkah 2: Tinjau Dashboard Proyek</strong> — Periksa 4 kartu metrik utama (Total RAB, Realisasi, Variance, Progres Fisik), grafik Kurva S, dan indeks CPI/SPI.
                    </li>
                    <li className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <strong>Langkah 3: Coba Input Belanja Lapangan</strong> — Klik tombol <em>"Input Realisasi Lapangan"</em> untuk mensimulasikan pencatatan belanja mandor dan uji kerja <em>Budget Guardrail</em>.
                    </li>
                    <li className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <strong>Langkah 4: Eksplorasi AI Copilot</strong> — Klik tombol <em>"AI Copilot Proyek"</em> di pojok kanan bawah untuk mengajukan pertanyaan kontekstual ke asisten cerdas 9Router.
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB 2: ESTIMATOR */}
            {activeTab === 'estimator' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-sky-400" />
                    Panduan Estimator: RAB & Analisa Harga Satuan (AHSP)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Tata cara penyusunan anggaran biaya proyek terstruktur berbasis Work Breakdown Structure (WBS).
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">1. Struktur Hierarki WBS</h3>
                  <p className="text-xs text-slate-300">
                    Setiap item pekerjaan dalam Karsa Pantau wajib memiliki kode WBS berjenjang (contoh: <code className="text-sky-400 font-mono">1.0 Pekerjaan Persiapan</code>, <code className="text-sky-400 font-mono">2.1 Pekerjaan Struktur Kolom</code>).
                  </p>

                  <h3 className="text-base font-bold text-white">2. Kategori Biaya Standar</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="font-bold text-sky-400 font-mono">MATERIAL</span>
                      <p className="text-slate-400 mt-0.5">Bahan mentah, perlengkapan fabrikasi, dan modul konstruksi.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="font-bold text-emerald-400 font-mono">LABOR</span>
                      <p className="text-slate-400 mt-0.5">Upah tukang, pekerja harian, mandor, dan insinyur lapangan.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="font-bold text-amber-400 font-mono">EQUIPMENT</span>
                      <p className="text-slate-400 mt-0.5">Sewa alat berat (excavator, crane, scaffolding, genset).</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="font-bold text-purple-400 font-mono">SUBCON</span>
                      <p className="text-slate-400 mt-0.5">Paket pekerjaan borongan spesialis pihak ketiga.</p>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white">3. Menggunakan Pencarian Cerdas AHSP AI</h3>
                  <p className="text-xs text-slate-300">
                    Pada formulir RAB Builder, ketik nama pekerjaan umum di bilah pencarian AI (misal: <em>"bore pile d60cm"</em>). Sistem 9Router dengan pgvector akan mencocokkan kemiripan vektor dengan database harga historis dan merekomendasikan harga satuan serta satuan pengukuran. Klik <strong>"+ Terapkan ke Form RAB"</strong> untuk mengisi formulir seketika.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: FIELD */}
            {activeTab === 'field' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-emerald-400" />
                    Panduan Supervisor Lapangan & Mandor: Input Realisasi
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Pencatatan nota belanja riil, kontrol sisa kuota pagu, dan mode operasi offline.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-2">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Live Budget Guardrail:
                    </span>
                    <p className="text-slate-300">
                      Sistem menghitung sisa anggaran item secara real-time. Jika nilai belanja yang diinput melebihi sisa plafon RAB, peringatan merah akan menyala dan transaksi memerlukan verifikasi otorisasi dari Project Manager.
                    </p>
                  </div>

                  <h3 className="text-base font-bold text-white">Operasi Offline-First di Lokasi Minim Sinyal:</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Karsa Pantau adalah <strong>Progressive Web App (PWA)</strong>. Jika Anda berada di lokasi proyek yang tidak memiliki koneksi internet:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-slate-400">
                    <li>Tetap buka formulir input realisasi dan simpan transaksi seperti biasa.</li>
                    <li>Data belanja akan disimpan dengan aman di penyimpanan lokal peramban (IndexedDB).</li>
                    <li>Lencana kuning <em>"Entri Offline"</em> akan muncul di bilah navigasi atas.</li>
                    <li>Begitu peramban kembali mendeteksi sinyal internet, seluruh antrean transaksi akan otomatis tersinkronisasi ke server pusat.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: PM */}
            {activeTab === 'pm' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-sky-400" />
                    Panduan Project Manager: Monitoring EVM & Kurva S
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Memahami metrik Earned Value Management dan membaca wawasan anomali biaya.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <h3 className="text-base font-bold text-white">Formula & Makna Indikator EVM:</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400 font-mono">CPI (Cost Performance Index)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">EV / AC</span>
                      </div>
                      <p className="text-slate-400">
                        Mengukur efisiensi pengeluaran dana. CPI &gt; 1.0 berarti biaya di bawah anggaran (efisien). CPI &lt; 1.0 berarti terjadi overbudget.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 font-mono">SPI (Schedule Performance Index)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300">EV / PV</span>
                      </div>
                      <p className="text-slate-400">
                        Mengukur ketepatan waktu progres fisik. SPI &gt; 1.0 berarti proyek lebih cepat dari rencana. SPI &lt; 1.0 berarti proyek mengalami keterlambatan.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mt-4">Audit Anomali Biaya AI:</h3>
                  <p className="text-slate-300">
                    Klik tombol <strong>"Jalankan Audit Anomali"</strong> pada panel AI Copilot. Sistem backend NestJS menghitung deviasi per item, lalu Claude 3.5 Sonnet melalui 9Router menyusun rekomendasi mitigasi risiko finansial secara otomatis.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 5: FINANCE */}
            {activeTab === 'finance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Panduan Tim Keuangan: Margin & Ekspor Akuntansi
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Pengendalian arus kas keluar (Cash Out), rekonsiliasi hutang vendor, dan integrasi software akuntansi.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Gross Margin Proyek</span>
                      <span className="text-sm font-bold text-emerald-400">Nilai Kontrak - Total Belanja</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Accounts Payable</span>
                      <span className="text-sm font-bold text-amber-400">Nota Tempo Material Vendor</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Ekspor Jurnal</span>
                      <span className="text-sm font-bold text-sky-400">Format .XLSX / CSV</span>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed">
                    Setiap kuitansi yang diverifikasi di lapangan dapat diunduh dalam bentuk rekapitulasi jurnal pengeluaran bulanan. Format kolom telah distandarisasi sehingga siap diimpor langsung ke sistem akuntansi seperti <strong>Accurate, Zahir, Jurnal.id, atau SAP</strong> tanpa rekonsiliasi manual.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 6: AI ARCHITECTURE */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-sky-400" />
                    Arsitektur AI: 9Router, pgvector & Prinsip Determinisme
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Bagaimana kecerdasan buatan diintegrasikan secara aman dan bertanggung jawab.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-2">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      Prinsip Emas Determinisme Finansial:
                    </span>
                    <p className="text-slate-300">
                      Model AI tidak pernah menghitung uang, total subtotal, atau indeks EVM secara mandiri. Seluruh perhitungan matematis dilakukan 100% secara deterministik oleh backend NestJS. Model bahasa (Claude 3.5 Sonnet) hanya menyusun narasi analisis wawasan bisnis dan rekomendasi mitigasi.
                    </p>
                  </div>

                  <h3 className="text-base font-bold text-white">Komponen Lapisan AI:</h3>
                  <ul className="space-y-2.5 list-disc list-inside text-slate-300">
                    <li>
                      <strong>9Router AI Gateway</strong> (<code className="text-sky-400 font-mono">ai.karsapantau.com</code>): Titik tunggal kontrol kredensial API, kuota token, failover, dan audit logging.
                    </li>
                    <li>
                      <strong>PostgreSQL 16 + pgvector</strong>: Menyimpan 1536-dimensional embedding untuk pencarian semantik harga historis dengan index HNSW berkecepatan tinggi.
                    </li>
                    <li>
                      <strong>Server-Sent Events (SSE)</strong>: Mengalirkan respons streaming token per token pada widget asisten proyek secara real-time.
                    </li>
                    <li>
                      <strong>Tabel Audit Trail (`ai_insights`)</strong>: Setiap analisis anomali, forecast, dan insight tersimpan permanen di database untuk keperluan audit formal perusahaan.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 7: FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                    Pertanyaan Umum (FAQ) & Troubleshooting
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Solusi untuk kendala operasional yang sering ditanyakan pengguna.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white">Q: Mengapa saya tidak bisa menginput realisasi pada proyek baru?</h4>
                    <p className="text-slate-400">
                      <strong>A:</strong> Realisasi lapangan hanya dapat dicatat pada proyek yang RAB-nya telah berstatus <strong>Approved</strong>. Pastikan Estimator telah mengajukan draft RAB dan Project Manager telah menyetujuinya di Approval Center.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white">Q: Apakah aplikasi harus diinstal dari Google Play Store / App Store?</h4>
                    <p className="text-slate-400">
                      <strong>A:</strong> Tidak perlu. Karsa Pantau adalah Progressive Web App (PWA). Cukup buka di browser ponsel Anda (Chrome/Safari), lalu pilih <em>"Add to Home Screen"</em> untuk menginstalnya seperti aplikasi bawaan.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white">Q: Apa yang terjadi jika koneksi internet terputus di tengah proyek?</h4>
                    <p className="text-slate-400">
                      <strong>A:</strong> Data kuitansi belanja tetap tersimpan di memori lokal peramban (IndexedDB) dan akan otomatis terkirim saat ponsel Anda kembali menerima sinyal internet.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white">Q: Bagaimana cara menghubungi tim bantuan teknis?</h4>
                    <p className="text-slate-400">
                      <strong>A:</strong> Anda dapat mengirimkan email ke <a href="mailto:support@karsapantau.com" className="text-sky-400 underline font-mono">support@karsapantau.com</a> atau mengajukan tiket kebutuhan melalui formulir masukan di halaman utama.
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
