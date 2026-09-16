'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuthToken, getActiveOrganization } from '@/lib/api';
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
  PlayCircle,
  Camera,
  Calendar,
  Wallet,
  GitCompare,
  ArrowRight,
  Check,
  UserCheck,
  Building,
  HardHat,
  Briefcase,
  Eye,
} from 'lucide-react';

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<
    'video' | 'estimator' | 'field' | 'pm' | 'finance' | 'owner' | 'faq'
  >('video');
  const [isProductionUser, setIsProductionUser] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      const org = getActiveOrganization();
      const isDemoMode = localStorage.getItem('karsa_demo_mode') === 'true';
      // User is logged in to a production tenant (not demo sandbox)
      if (token && token !== 'demo-token' && org && org.slug !== 'karsa-solar' && !isDemoMode) {
        setIsProductionUser(true);
      }
    }
  }, []);

  const navItems = [
    { id: 'video', label: '1. Video Tutorial & Alur Lengkap', icon: PlayCircle, badge: 'Video E2E' },
    { id: 'estimator', label: '2. Estimator (RAB, BOQ & Harga)', icon: Calculator, badge: 'Tender' },
    { id: 'field', label: '3. Mandor / Supervisor (Lapangan)', icon: HardHat, badge: 'Field Ops' },
    { id: 'pm', label: '4. Project Manager (EVM & Approval)', icon: Briefcase, badge: 'Control' },
    { id: 'finance', label: '5. Keuangan & Pengadaan (Finance)', icon: DollarSign, badge: 'Finance' },
    { id: 'owner', label: '6. Owner & Direksi (Approver)', icon: ShieldCheck, badge: 'Audit' },
    { id: 'faq', label: '7. Tanya Jawab (FAQ & Troubleshooting)', icon: HelpCircle, badge: 'Bantuan' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/80 text-xs font-semibold text-sky-400 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dokumentasi Resmi Karsa Pantau — Panduan Pengguna Berbasis Peran</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Pusat Panduan & Tutorial Penggunaan
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Panduan komprehensif langkah demi langkah, dilengkapi tangkapan layar, pemutar video alur lengkap, dan instruksi spesifik untuk setiap divisi kerja kontraktor.
          </p>
        </div>

        {!isProductionUser && (
          <div className="flex items-center gap-2.5">
            <Link
              href="/demo"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Buka Simulasi Demo Live</span>
            </Link>
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar Tabs + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-1.5">
          <div className="p-2 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 sticky top-24 shadow-xl">
            <p className="text-[10px] uppercase font-bold text-slate-500 px-3 py-2 tracking-wider">
              Pilih Panduan Berdasarkan Peran
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
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-8 text-sm leading-relaxed text-slate-300">
            {/* ========================================================= */}
            {/* TAB 1: VIDEO TUTORIAL & ALUR LENGKAP */}
            {/* ========================================================= */}
            {activeTab === 'video' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <PlayCircle className="w-6 h-6 text-sky-400" />
                      Video Rekaman Panduan Operasional End-to-End
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 text-[10px] font-mono">
                      Durasi: ~2 Menit
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Tonton alur lengkap simulasi mulai dari penyusunan RAB, impor BOQ Excel, input kasbon lapangan, pelacakan cuaca harian, hingga audit anomali biaya.
                  </p>
                </div>

                {/* Video Player Card */}
                <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl space-y-2">
                  <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      Rekaman Simulasi Alur Sistem Karsa Pantau (EPC Edition)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">MP4 Full HD</span>
                  </div>
                  <div className="p-2 sm:p-4">
                    <video
                      controls
                      autoPlay={false}
                      preload="metadata"
                      poster="/docs/project_dashboard.png"
                      className="w-full rounded-xl border border-slate-800 shadow-lg aspect-video bg-black"
                    >
                      <source src="/docs/karsa_e2e_flow.mp4" type="video/mp4" />
                      Peramban Anda tidak mendukung pemutar video HTML5. Silakan unduh video panduan langsung.
                    </video>
                  </div>
                </div>

                {/* Timeline / Chapter Guide */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">
                    Daftar Babak Alur Proyek dalam Video:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-sky-400 font-bold">
                        <span>00:00 &bull; Onboarding & Login Cepat</span>
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Tahap 1</span>
                      </div>
                      <p className="text-slate-400">
                        Memilih role kerja (Estimator, Mandor, PM, Finance) dan navigasi portofolio proyek konstruksi aktif.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-amber-400 font-bold">
                        <span>00:30 &bull; RAB Builder & BOQ Excel</span>
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Tahap 2</span>
                      </div>
                      <p className="text-slate-400">
                        Unggah berkas BOQ Excel, verifikasi persentase keyakinan mapping kolom, dan aktivasi price guardrail.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <span>01:05 &bull; Realisasi Lapangan Ber-GPS</span>
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Tahap 3</span>
                      </div>
                      <p className="text-slate-400">
                        Input nota kuitansi mandor dengan foto kamera dan watermark stempel koordinat GPS anti-rekayasa.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-purple-400 font-bold">
                        <span>01:40 &bull; Monitoring EVM & Kurva S</span>
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Tahap 4</span>
                      </div>
                      <p className="text-slate-400">
                        Evaluasi indeks performa CPI/SPI mingguan, audit anomali biaya AI, dan ekspor ringkasan eksekutif.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: ESTIMATOR & TENDER ENGINEER */}
            {/* ========================================================= */}
            {activeTab === 'estimator' && (
              <div className="space-y-7">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold uppercase mb-1.5">
                    Modul Peran Estimator / QS / Tender Engineer
                  </div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-sky-400" />
                    Penyusunan RAB, Smart BOQ Parser & Price Intelligence
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Pelajari cara menyusun anggaran biaya proyek, mengimpor berkas Excel tender secara instan, dan memanfaatkan guardrail harga historis.
                  </p>
                </div>

                {/* Feature 1: Smart BOQ Parser */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center font-mono">1</span>
                    Impor BOQ Tender Excel dengan Verifikasi Kolom (Human-in-the-Loop)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tidak perlu lagi menyalin ribuan baris item pekerjaan satu per satu. Unggah berkas spreadsheet tender (.xlsx, .xls, atau .csv) yang diberikan oleh Owner atau Konsultan Perencana.
                  </p>
                  
                  {/* Screenshot Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-3 space-y-2 shadow-xl">
                    <img
                      src="/docs/boq_excel.png"
                      alt="Smart BOQ Parser Modal"
                      className="w-full rounded-xl border border-slate-800 object-cover"
                    />
                    <p className="text-[11px] text-slate-400 italic text-center">
                      Gambar 1: Modal verifikasi pemetaan kolom BOQ dengan indikator akurasi kecocokan dan pratinjau sampel 3 baris riil.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-white block">Langkah Pelaksanaan Estimator:</span>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                      <li>Buka halaman proyek dan klik tombol <strong>"Buka RAB Builder"</strong>.</li>
                      <li>Klik tombol <strong>"+ Upload BOQ Excel"</strong> di pojok kanan atas.</li>
                      <li>Pilih berkas Excel tender dari komputer Anda (atau unduh format template jika menyusun dari awal).</li>
                      <li>Sistem otomatis mendeteksi kolom: WBS, Deskripsi Pekerjaan, Volume, Satuan, dan Harga Satuan dengan skor kecocokan (misal: <em>98% Sesuai</em>).</li>
                      <li>Periksa pratinjau 3 baris sampel. Jika kolom sudah tepat, klik <strong>"Konfirmasi & Kunci Mapping BOQ"</strong>. Seluruh baris langsung masuk ke draft RAB Anda!</li>
                    </ol>
                  </div>
                </div>

                {/* Feature 2: Historical Price Guardrail */}
                <div className="space-y-3 pt-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center font-mono">2</span>
                    Historical Price Guardrail (Pencegah Typo & Mark-up Ekstrem)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Saat memasukkan harga satuan baru, sistem secara otomatis membandingkannya dengan <strong>nilai median harga historis</strong> dari katalog AHSP dan proyek-proyek yang pernah dibangun sebelumnya.
                  </p>

                  {/* Screenshot Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-3 space-y-2 shadow-xl">
                    <img
                      src="/docs/price_guardrail.png"
                      alt="Price Guardrail Alert"
                      className="w-full rounded-xl border border-slate-800 object-cover"
                    />
                    <p className="text-[11px] text-slate-400 italic text-center">
                      Gambar 2: Kartu peringatan inline deviasi harga ekstrem (&gt;25% di atas median) dan kolom wajib justifikasi audit.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs space-y-1 text-slate-300">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Aturan Kepatuhan Tender:
                    </span>
                    <p>
                      Jika harga satuan yang Anda ketik menyimpang lebih dari 25% dari median pasar, Anda diwajibkan mengisi <strong>Catatan Justifikasi Deviasi</strong> (contoh: <em>lokasi proyek di pulau terpencil membutuhkan biaya angkut kapal tongkang</em>). Hal ini menjaga kontraktor dari sengketa audit internal di kemudian hari.
                    </p>
                  </div>
                </div>

                {/* Feature 3: Git-like RAB Versioning */}
                <div className="space-y-3 pt-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center font-mono">3</span>
                    Git-like Versioning & Visual Delta Diff Engine (Lacak CCO Owner)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ketika Owner merevisi volume pekerjaan atau menerbitkan <em>Contract Change Order (CCO)</em>, Anda tidak perlu lagi membuat berkas file bertumpuk seperti <code className="text-amber-400 font-mono">RAB_Final_v2_revisi3_fix.xlsx</code>.
                  </p>

                  {/* Screenshot Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-3 space-y-2 shadow-xl">
                    <img
                      src="/docs/rab_diff.png"
                      alt="Git-like RAB Diff Engine"
                      className="w-full rounded-xl border border-slate-800 object-cover"
                    />
                    <p className="text-[11px] text-slate-400 italic text-center">
                      Gambar 3: Tampilan visual diff baris-per-baris dengan penyorotan warna (🟢 Hijau = Scope Baru, 🟡 Kuning = Kuantitas/Harga Berubah, 🔴 Merah = Scope Dihapus).
                    </p>
                  </div>

                  <p className="text-xs text-slate-300">
                    Buka halaman <strong>/projects/[id]/rab/diff</strong> untuk membandingkan versi tender v1.0 dengan versi revisi v1.1. Anda dapat melihat dampak nilai bersih (+Rp 868.5jt / +1.32%) dan mengunduh laporan perubahan scope dalam format <strong>.CSV</strong> untuk lampiran resmi Berita Acara Perubahan Pekerjaan.
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: FIELD OPS (SITE SUPERVISOR & MANDOR) */}
            {/* ========================================================= */}
            {activeTab === 'field' && (
              <div className="space-y-7">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase mb-1.5">
                    Modul Peran Site Supervisor / Mandor / Site Engineer
                  </div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <HardHat className="w-6 h-6 text-emerald-400" />
                    Input Realisasi Lapangan, Laporan Harian & Kasbon Petty Cash
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Panduan operasional lapangan: pencatatan nota belanja riil, pelacakan cuaca & klaim EOT, serta pertanggungjawaban kas kecil harian.
                  </p>
                </div>

                {/* Feature 1: Photo-to-Progress with GPS */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-mono">1</span>
                    Input Realisasi Biaya dengan Foto Kamera & Watermark GPS
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Setiap bukti belanja material di lapangan (misal beli semen darurat atau sewa molen) wajib dilampirkan foto kuitansi dengan koordinat GPS aktual untuk mencegah penolakan klaim opname oleh Owner.
                  </p>

                  {/* Screenshot Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-3 space-y-2 shadow-xl">
                    <img
                      src="/docs/actual_input.png"
                      alt="Input Realisasi Lapangan dengan GPS"
                      className="w-full rounded-xl border border-slate-800 object-cover"
                    />
                    <p className="text-[11px] text-slate-400 italic text-center">
                      Gambar 4: Formulir input realisasi lapangan dengan akuisisi koordinat GPS otomatis dan watermark stempel lokasi fisik.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-white block">Cara Pengambilan Foto di Smartphone Lapangan:</span>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                      <li>Buka halaman proyek dan klik tombol hijau <strong>"Input Realisasi Lapangan"</strong>.</li>
                      <li>Pilih item pekerjaan RAB yang sesuai dari menu dropdown.</li>
                      <li>Masukkan jumlah volume fisik dan nominal rupiah belanja.</li>
                      <li>Klik kotak kamera untuk memotret nota/struk toko bangunan. Sistem peramban akan meminta izin GPS dan menyematkan koordinat latitude/longitude secara instan.</li>
                      <li>Klik <strong>"Simpan Transaksi Realisasi"</strong>. Data langsung terhubung ke dashboard anggaran kantor pusat!</li>
                    </ol>
                  </div>
                </div>

                {/* Feature 2: Daily Site Log & Rain Delay */}
                <div className="space-y-3 pt-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-mono">2</span>
                    Daily Site Log & Rain Delay EOT Tracker (Dokumen Hukum Cuaca)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Cuaca buruk seperti hujan lebat dan angin kencang sering menunda pengecoran beton. Jika tidak dicatat secara legal setiap hari, kontraktor berisiko terkena denda keterlambatan (<em>Liquidated Damages</em>).
                  </p>

                  {/* Screenshot Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-3 space-y-2 shadow-xl">
                    <img
                      src="/docs/daily_log.png"
                      alt="Daily Site Log Modal Form"
                      className="w-full rounded-xl border border-slate-800 object-cover"
                    />
                    <p className="text-[11px] text-slate-400 italic text-center">
                      Gambar 5: Modal input laporan harian: cuaca 3 sesi (Pagi/Siang/Sore), jam kerja hilang, absensi mandor/tukang, dan utilisasi alat berat.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs space-y-1 text-slate-300">
                    <span className="font-bold text-blue-400 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> Rekomendasi Hukum EOT Otomatis:
                    </span>
                    <p>
                      Sistem menghitung akumulasi jam hilang (*Force Majeure Rain Delay*). Jika jam hilang mencapai kelipatan 8 jam, sistem otomatis menerbitkan rekomendasi klaim perpanjangan waktu (EOT Notice) yang siap diekspor ke <strong>.CSV</strong> sebagai bukti sah ke Konsultan MK.
                    </p>
                  </div>
                </div>

                {/* Feature 3: Petty Cash & Kasbon Lapangan */}
                <div className="space-y-3 pt-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-mono">3</span>
                    Kasbon Lapangan & Pertanggungjawaban Petty Cash
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ketika mandor membutuhkan uang kas kecil mendesak (beli solar genset lembur atau uang makan lembur malam), gunakan modul <strong>/projects/[id]/petty-cash</strong>.
                  </p>

                  {/* Screenshot Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-3 space-y-2 shadow-xl">
                    <img
                      src="/docs/petty_cash.png"
                      alt="Petty Cash Settlement Modal"
                      className="w-full rounded-xl border border-slate-800 object-cover"
                    />
                    <p className="text-[11px] text-slate-400 italic text-center">
                      Gambar 6: Modal settlement kasbon lapangan: input riil belanja, perhitungan otomatis sisa uang kembali, dan unggah struk SPBU/warung.
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Alur operasional: <strong>Pengajuan oleh Mandor</strong> &rarr; <strong>Disetujui PM</strong> &rarr; <strong>Dicairkan Kasir Site</strong> &rarr; <strong>Settlement Nota Kuitansi</strong>. Uang kembalian yang disetor ke kasir dihitung otomatis oleh sistem tanpa risiko selisih hitung!
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: PROJECT MANAGER (PM) */}
            {/* ========================================================= */}
            {activeTab === 'pm' && (
              <div className="space-y-7">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold uppercase mb-1.5">
                    Modul Peran Project Manager / Site Manager / Direktur Operasional
                  </div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                    Kontrol Finansial EVM, Kurva S, Approval & Deteksi Anomali Biaya
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Kendali menyeluruh kesehatan biaya dan jadwal proyek konstruksi berbasis formula Earned Value Management (EVM) standar internasional.
                  </p>
                </div>

                {/* Feature 1: EVM & Kurva S */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-mono">1</span>
                    Membaca Dashboard Indikator EVM & Grafik Kurva S
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Setiap hari Jumat atau akhir minggu, PM mengevaluasi grafik Kurva S untuk melihat keselarasan antara Bobot Rencana (PV), Bobot Realisasi Fisik (EV), dan Biaya Aktual yang Terbayar (AC).
                  </p>

                  {/* Screenshot Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-3 space-y-2 shadow-xl">
                    <img
                      src="/docs/project_dashboard.png"
                      alt="Project Dashboard & EVM Metrics"
                      className="w-full rounded-xl border border-slate-800 object-cover"
                    />
                    <p className="text-[11px] text-slate-400 italic text-center">
                      Gambar 7: Dashboard Proyek menampilkan Total Anggaran, Realisasi Lapangan, Variance Biaya, Kurva S mingguan, dan indeks CPI/SPI.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="font-bold text-emerald-400 font-mono block">CPI = EV / AC (Cost Index)</span>
                      <p className="text-slate-400">
                        Jika <strong>CPI &gt; 1.0</strong>: Proyek hemat anggaran (Under Budget). Jika <strong>CPI &lt; 1.0</strong>: Terjadi pemborosan biaya aktual di lapangan.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="font-bold text-amber-400 font-mono block">SPI = EV / PV (Schedule Index)</span>
                      <p className="text-slate-400">
                        Jika <strong>SPI &gt; 1.0</strong>: Proyek lebih cepat dari master schedule. Jika <strong>SPI &lt; 1.0</strong>: Proyek mengalami deviasi keterlambatan fisik.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 2: AI Anomaly Audit */}
                <div className="space-y-3 pt-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-mono">2</span>
                    Audit Anomali Biaya Cerdas & AI Copilot Proyek
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Daripada menyisir ribuan baris spreadsheet keuangan secara manual, klik tombol <strong>"Jalankan Audit Anomali via AI"</strong>.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 space-y-1 shadow-lg">
                      <img src="/docs/anomaly_audit.png" alt="Audit Anomali AI" className="w-full rounded-xl border border-slate-800" />
                      <p className="text-[10px] text-slate-400 text-center">Gambar 8: Hasil deteksi anomali deviasi pos biaya.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 space-y-1 shadow-lg">
                      <img src="/docs/copilot_chat.png" alt="AI Copilot Proyek" className="w-full rounded-xl border border-slate-800" />
                      <p className="text-[10px] text-slate-400 text-center">Gambar 9: Chat asisten AI kontekstual proyek.</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">
                    Sistem cerdas AI akan memeriksa seluruh transaksi lapangan dan menyoroti pos-pos yang mengalami lonjakan di atas ambang batas toleransi (default ±10%), lalu merumuskan langkah mitigasi penghematan untuk PM.
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 5: FINANCE & PROCUREMENT */}
            {/* ========================================================= */}
            {activeTab === 'finance' && (
              <div className="space-y-7">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase mb-1.5">
                    Modul Peran Finance / Accounting / Procurement / Logistik
                  </div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-amber-400" />
                    Portal Keuangan, Gross Margin & Ekspor Jurnal Akuntansi
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Pengawasan arus kas keluar (Cash Out), rekonsiliasi hutang vendor tempo 30 hari, dan ekspor jurnal siap impor ke software akuntansi.
                  </p>
                </div>

                {/* Feature 1: Finance Portal */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-slate-950 text-xs flex items-center justify-center font-mono font-bold">1</span>
                    Dashboard Keuangan Proyek & Margin Laba Kotor
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Buka menu <strong>/finance</strong> pada navigasi utama untuk memantau ringkasan finansial lintas proyek perusahaan.
                  </p>

                  {/* Screenshot Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-3 space-y-2 shadow-xl">
                    <img
                      src="/docs/finance_portal.png"
                      alt="Portal Keuangan & Ekspor Akuntansi"
                      className="w-full rounded-xl border border-slate-800 object-cover"
                    />
                    <p className="text-[11px] text-slate-400 italic text-center">
                      Gambar 10: Portal Keuangan menampilkan Gross Margin, Kas Keluar Aktual, AP Vendor Jatuh Tempo, dan tombol ekspor jurnal otomatis.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block font-medium">Gross Margin Real-time</span>
                      <span className="text-lg font-bold text-emerald-400 mt-1 block">38.8%</span>
                      <span className="text-[10px] text-slate-500">Nilai Kontrak dikurangi Realisasi Kas</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block font-medium">Accounts Payable (AP)</span>
                      <span className="text-lg font-bold text-amber-400 mt-1 block">Rp 210.000.000</span>
                      <span className="text-[10px] text-slate-500">Faktur vendor semen & besi tempo 30 hari</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block font-medium">Ekspor Jurnal Umum</span>
                      <span className="text-lg font-bold text-sky-400 mt-1 block">CSV & Excel</span>
                      <span className="text-[10px] text-slate-500">Format standar Accurate, Zahir, SAP</span>
                    </div>
                  </div>
                </div>

                {/* Feature 2: Vendor Price Catalog */}
                <div className="space-y-3 pt-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-slate-950 text-xs flex items-center justify-center font-mono font-bold">2</span>
                    Master Data Katalog Harga Vendor & Riwayat RAB
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Bagian pengadaan dapat memelihara perpustakaan harga master untuk 4 kategori: <strong>Material</strong>, <strong>Upah / Manpower</strong>, <strong>Alat Berat</strong>, dan <strong>Subkontraktor</strong>.
                  </p>

                  {/* Screenshot Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-3 space-y-2 shadow-xl">
                    <img
                      src="/docs/vendor_catalog.png"
                      alt="Katalog Harga Vendor Master Data"
                      className="w-full rounded-xl border border-slate-800 object-cover"
                    />
                    <p className="text-[11px] text-slate-400 italic text-center">
                      Gambar 11: Master data katalog harga vendor dengan pencarian instan, filter kategori, dan parser impor daftar harga Excel.
                    </p>
                  </div>

                  <p className="text-xs text-slate-300">
                    Gunakan tombol <strong>"+ Upload Excel / Pricelist"</strong> untuk mengimpor daftar harga supplier massal secara instan. Data ini akan langsung menjadi acuan pembanding saat tim Estimator menyusun tender baru.
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 6: OWNER & DIREKSI (APPROVER) */}
            {/* ========================================================= */}
            {activeTab === 'owner' && (
              <div className="space-y-7">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase mb-1.5">
                    Modul Peran Owner / Direksi / Konsultan Pengawas (MK)
                  </div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-rose-400" />
                    Portal Persetujuan (Approval Center) & Transparansi Opname
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Otorisasi anggaran baseline tender, validasi perubahan scope (CCO), dan verifikasi keabsahan bukti lapangan ber-geotag sebelum pencairan termin.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <h3 className="text-base font-bold text-white">Alur Otorisasi & Transparansi Kontrak:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">1. Approval RAB Baseline</span>
                      <p className="text-slate-400">
                        Owner memeriksa rincian WBS dan AHSP tender. Begitu disetujui di Approval Center, proyek resmi berstatus <em>Active</em> dan siap menerima realisasi biaya.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">2. Approval Adendum CCO</span>
                      <p className="text-slate-400">
                        Setiap perubahan volume diinspeksi lewat visual diff table. Selisih nilai kontrak transparan hingga ke level harga satuan.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">3. Verifikasi Klaim EOT</span>
                      <p className="text-slate-400">
                        Konsultan MK dapat memverifikasi log cuaca harian (Rain Delay) untuk menilai apakah permohonan perpanjangan waktu kerja kontraktor sah secara teknis.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 space-y-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Kunci Keamanan & Integritas:
                    </span>
                    <p className="leading-relaxed">
                      Sistem menerapkan prinsip <strong>Separation of Duties (SoD)</strong>: pembuat RAB (Estimator) tidak dapat menyetujui anggarannya sendiri, dan pencatat belanja (Mandor) tidak memiliki hak untuk mengubah batas pagu proyek.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 7: FAQ & TROUBLESHOOTING */}
            {/* ========================================================= */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                    Pertanyaan Umum (FAQ) & Solusi Kendala
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Jawaban praktis atas pertanyaan yang sering diajukan tim lapangan dan kantor pusat.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white">Q: Bagaimana jika ponsel mandor tidak mendapatkan sinyal internet di lokasi site?</h4>
                    <p className="text-slate-400 leading-relaxed">
                      <strong>A:</strong> Karsa Pantau bekerja dengan teknologi <strong>Progressive Web App (PWA) Offline-First</strong>. Mandor tetap dapat mengisi foto dan formulir belanja seperti biasa. Data tersimpan di memori aman ponsel dan otomatis terkirim ke kantor pusat saat mendeteksi koneksi internet kembali.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white">Q: Mengapa tombol "Input Realisasi" terkunci atau tidak bisa menambah pengeluaran?</h4>
                    <p className="text-slate-400 leading-relaxed">
                      <strong>A:</strong> Sesuai SOP konstruksi, realisasi belanja hanya dapat dicatat pada proyek yang RAB-nya telah berstatus <strong>Approved</strong>. Pastikan Project Manager atau Owner telah menyetujui draft RAB di Approval Center.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white">Q: Apakah berkas Excel BOQ yang formatnya tidak standar bisa diimpor?</h4>
                    <p className="text-slate-400 leading-relaxed">
                      <strong>A:</strong> Ya! Smart BOQ Parser kami dilengkapi modal penyesuaian kolom interaktif (Human-in-the-Loop). Anda dapat memetakan secara manual kolom mana yang menjadi Deskripsi, Volume, dan Harga Satuan sebelum data dikunci.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white">Q: Bagaimana cara mengganti peran kerja (Role) saat mencoba sistem demo?</h4>
                    <p className="text-slate-400 leading-relaxed">
                      <strong>A:</strong> Cukup klik lencana peran di pojok kanan atas bilah navigasi (misal: <em>Role: PM</em>). Anda dapat beralih secara instan menjadi <em>Estimator, Mandor/Supervisor, Approver, atau Admin</em> tanpa perlu login berulang kali.
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
