'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Printer,
  FileText,
  ChevronLeft,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  MapPin,
  Clock,
  Download,
  Check,
  Award,
  Users,
} from 'lucide-react';

export default function ExecutiveReportPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [selectedWeek, setSelectedWeek] = useState<number>(12);
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [reportDate, setReportDate] = useState<string>(
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );

  // Proyek Mock / Default Data
  const projectInfo = {
    name: 'Pembangunan Gedung Fasilitas & MEP Cikarang (Demo Site)',
    location: 'Kawasan Industri GIIC Cikarang Pusat, Kab. Bekasi, Jawa Barat',
    contractNumber: '042/SPK-EPC/KARS-GIIC/2026',
    contractDate: '12 Januari 2026',
    owner: 'PT Cikarang Megah Perkasa (Owner)',
    consultant: 'PT Delta Pratama Konsultan (Manajemen Konstruksi)',
    contractor: 'PT Karsa Konstruksi Mandiri (Main Contractor EPC)',
    durationDays: 180,
    startDate: '15 Januari 2026',
    targetDate: '14 Juli 2026',
    baselineContractValue: 2451500000,
    ccoContractValue: 2538350000, // +Rp 86.85jt CCO addendum
  };

  // Metrik Kemajuan Fisik & Finansial
  const plannedProgress = 75.0;
  const actualProgress = 74.0;
  const progressDeviation = actualProgress - plannedProgress; // -1.0%

  const plannedValue = (plannedProgress / 100) * projectInfo.ccoContractValue; // PV: Rp 1.903.762.500
  const earnedValue = (actualProgress / 100) * projectInfo.ccoContractValue;   // EV: Rp 1.878.379.000
  const actualCost = 1762000000;                                               // AC: Rp 1.762.000.000

  const cpi = earnedValue / actualCost; // 1.066 (Under budget)
  const spi = earnedValue / plannedValue; // 0.987 (Minor schedule delay)
  const costVariance = earnedValue - actualCost; // +Rp 116.379.000
  const scheduleVariance = earnedValue - plannedValue; // -Rp 25.383.500
  const estimateAtCompletion = projectInfo.ccoContractValue / cpi; // Rp 2.381.191.369

  // Penagihan Termin (Billing)
  const previousClaimedPct = 50.0;
  const currentClaimablePct = actualProgress - previousClaimedPct; // 24.0%
  const currentClaimableAmount = (currentClaimablePct / 100) * projectInfo.ccoContractValue; // Rp 609.204.000
  const retention5Pct = currentClaimableAmount * 0.05;
  const netClaimableBilling = currentClaimableAmount - retention5Pct;

  // Data Kurva S Mingguan
  const sCurveWeeks = [
    { week: 2, planned: 5.0, actual: 4.8 },
    { week: 4, planned: 14.0, actual: 13.5 },
    { week: 6, planned: 26.0, actual: 27.2 },
    { week: 8, planned: 42.0, actual: 41.0 },
    { week: 10, planned: 58.0, actual: 59.5 },
    { week: 12, planned: 75.0, actual: 74.0 },
    { week: 14, planned: 88.0, actual: null },
    { week: 16, planned: 100.0, actual: null },
  ];

  // Foto Dokumentasi Opname Ber-geotag
  const sitePhotos = [
    {
      title: 'Pengecoran Kolom K1 Lantai 1 Zona Barat',
      zone: 'Zona Barat - Struktur',
      date: '12 Sep 2026 14:30 WIB',
      latLong: 'Lat: -6.2941, Long: 107.1428',
      photoUrl: '/docs/actual_input.png',
      status: 'Selesai 100% Sesuai Spesifikasi K-300',
    },
    {
      title: 'Perakitan Scaffolding & Formwork Balok Lantai 2',
      zone: 'Zona Tengah - Arsitektur',
      date: '13 Sep 2026 10:15 WIB',
      latLong: 'Lat: -6.2943, Long: 107.1430',
      photoUrl: '/docs/daily_log.png',
      status: 'Progres Perakitan 85%',
    },
    {
      title: 'Instalasi Tray Kabel & Conduit MEP Utama',
      zone: 'Zona Utilitas - Elektrikal',
      date: '14 Sep 2026 11:45 WIB',
      latLong: 'Lat: -6.2940, Long: 107.1425',
      photoUrl: '/docs/petty_cash.png',
      status: 'Pemasangan Jalur Utama Selesai',
    },
    {
      title: 'Pengujian Mutu Slump Beton & Sampel Silinder',
      zone: 'Laboratorium Site - QC',
      date: '14 Sep 2026 16:00 WIB',
      latLong: 'Lat: -6.2942, Long: 107.1427',
      photoUrl: '/docs/price_guardrail.png',
      status: 'Slump 12±2cm Lolos Uji Konsultan MK',
    },
  ];

  const formatRupiah = (num: number) => {
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8 selection:bg-sky-500 selection:text-white print:bg-white print:text-black print:p-0">
      {/* 1. Web-Only Control Toolbar (Hidden when printing) */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 print:hidden shadow-xl">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href={`/projects/${projectId}`}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali
          </Link>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-sky-400" />
            Mode Pratinjau Dokumen Eksekutif (Print-Ready)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Periode:</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
            >
              {[8, 9, 10, 11, 12, 13, 14].map((w) => (
                <option key={w} value={w}>
                  Minggu Ke-{w} (Bulan Ke-{Math.ceil(w / 4)})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF (1-Klik)
          </button>
        </div>
      </div>

      {/* 2. Formal Printable Document Sheet (A4 Styled Container) */}
      <div className="max-w-5xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none">
        {/* Document Header / Kop Surat Resmi Kontraktor */}
        <div className="border-b-4 border-slate-900 pb-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-950 text-sky-400 flex items-center justify-center font-black text-2xl border-2 border-sky-600 print:bg-slate-900 print:text-white shrink-0">
                KP
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider text-slate-950">
                  PT Karsa Konstruksi Mandiri
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  General Contractor & Industrial EPC Engineering Services
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Gedung Graha Karsa Lt. 8, Jl. TB Simatupang No. 45, Jakarta Selatan &bull; Izin Konstruksi (NIB): 9120003482190
                </p>
              </div>
            </div>

            <div className="sm:text-right text-xs text-slate-600 border-l-2 sm:border-l-0 sm:border-t-0 pl-3 sm:pl-0 border-slate-300">
              <div className="font-mono font-bold text-slate-900">
                LAP-PROG/WK-{selectedWeek}/2026
              </div>
              <div>Tanggal Terbit: {reportDate}</div>
              <div className="font-semibold text-sky-700 print:text-slate-900">
                Status: Resmi & Disahkan
              </div>
            </div>
          </div>

          <div className="text-center mt-6 pt-4 border-t border-slate-200">
            <h1 className="text-lg sm:text-2xl font-black uppercase text-slate-950 tracking-tight">
              Laporan Kemajuan Pekerjaan & Pengajuan Termin (Executive Progress Report)
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Periode Evaluasi: Minggu Ke-{selectedWeek} &bull; Progres Fisik Kumulatif: {actualProgress.toFixed(1)}% &bull; Standar Pelaporan FIDIC / PUPR
            </p>
          </div>
        </div>

        {/* Section 1: Tabel Identitas Kontrak */}
        <div className="mb-6 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b-2 border-slate-300 pb-1">
            <Building2 className="w-4 h-4 text-sky-700 print:text-slate-900" />
            I. Informasi Kontrak & Stakeholder Proyek
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs py-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Nama Proyek:</span>
              <span className="font-bold text-slate-900">{projectInfo.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Lokasi Pekerjaan:</span>
              <span className="font-semibold text-slate-800">{projectInfo.location}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Nomor & Tanggal SPK Kontrak:</span>
              <span className="font-mono font-semibold text-slate-900">
                {projectInfo.contractNumber} ({projectInfo.contractDate})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Pemberi Tugas (Owner):</span>
              <span className="font-semibold text-slate-800">{projectInfo.owner}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Konsultan Pengawas (MK):</span>
              <span className="font-semibold text-slate-800">{projectInfo.consultant}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Kontraktor Pelaksana:</span>
              <span className="font-semibold text-slate-800">{projectInfo.contractor}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Nilai Kontrak Awal (Baseline):</span>
              <span className="font-mono font-bold text-slate-900">
                {formatRupiah(projectInfo.baselineContractValue)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Nilai Setelah CCO / Adendum No. 1:</span>
              <span className="font-mono font-bold text-sky-800 print:text-slate-900">
                {formatRupiah(projectInfo.ccoContractValue)} (+Rp 86.850.000 / +3.5%)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Waktu Pelaksanaan Kontrak:</span>
              <span className="font-semibold text-slate-800">
                {projectInfo.durationDays} Hari Kalender ({projectInfo.startDate} s/d {projectInfo.targetDate})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Kompensasi Cuaca Sah (EOT Notice):</span>
              <span className="font-semibold text-emerald-700">
                +0.5 Hari Kerja (Force Majeure Rain Delay Diakui)
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Executive Summary & Penagihan Termin */}
        <div className="mb-6 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b-2 border-slate-300 pb-1">
            <DollarSign className="w-4 h-4 text-sky-700 print:text-slate-900" />
            II. Ringkasan Kemajuan Fisik & Rekomendasi Penagihan Termin (Progress Billing)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
            <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Rencana Kumulatif (PV)</span>
              <span className="text-xl font-black text-slate-900">{plannedProgress.toFixed(1)}%</span>
              <span className="text-[10px] text-slate-500 block">Master Schedule</span>
            </div>

            <div className="p-3 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Realisasi Fisik (EV)</span>
              <span className="text-xl font-black text-emerald-700">{actualProgress.toFixed(1)}%</span>
              <span className="text-[10px] text-emerald-800 font-semibold block">Opname Lapangan Sah</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Deviasi Jadwal</span>
              <span className="text-xl font-black text-amber-600">
                {progressDeviation > 0 ? `+${progressDeviation.toFixed(1)}%` : `${progressDeviation.toFixed(1)}%`}
              </span>
              <span className="text-[10px] text-slate-500 block">Toleransi Normal (-1.0%)</span>
            </div>

            <div className="p-3 rounded-xl border-2 border-sky-600 bg-sky-50 text-center">
              <span className="text-[10px] uppercase font-bold text-sky-800 block">Cost Performance (CPI)</span>
              <span className="text-xl font-black text-sky-700">{cpi.toFixed(3)}</span>
              <span className="text-[10px] text-sky-800 font-semibold block">Under Budget (Hemat Kas)</span>
            </div>
          </div>

          {/* Rincian Finansial & Termin */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="p-2.5 border-r border-slate-300">Komponen Penagihan Progres</th>
                  <th className="p-2.5 text-center border-r border-slate-300">Bobot (%)</th>
                  <th className="p-2.5 text-right border-r border-slate-300">Nilai Bruto (Rp)</th>
                  <th className="p-2.5">Keterangan Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-medium">Realisasi Opname Fisik Kumulatif Minggu Ini</td>
                  <td className="p-2 text-center font-bold font-mono">{actualProgress.toFixed(1)}%</td>
                  <td className="p-2 text-right font-mono font-bold">{formatRupiah(earnedValue)}</td>
                  <td className="p-2 text-slate-600 text-[11px]">Berdasarkan pemeriksaan bersama Konsultan MK</td>
                </tr>
                <tr>
                  <td className="p-2 text-slate-600">Penagihan Termin Sebelumnya yang Telah Dicairkan</td>
                  <td className="p-2 text-center font-mono text-slate-600">{previousClaimedPct.toFixed(1)}%</td>
                  <td className="p-2 text-right font-mono text-slate-600">{formatRupiah((previousClaimedPct / 100) * projectInfo.ccoContractValue)}</td>
                  <td className="p-2 text-slate-500 text-[11px]">Termin 1 (DP 20%) & Termin 2 (Progres 30%)</td>
                </tr>
                <tr className="bg-sky-50/60 font-semibold">
                  <td className="p-2 text-slate-900">Hak Penagihan Termin Berjalan (Claimable Progress Billing)</td>
                  <td className="p-2 text-center font-bold font-mono text-sky-900">{currentClaimablePct.toFixed(1)}%</td>
                  <td className="p-2 text-right font-mono font-bold text-sky-900">{formatRupiah(currentClaimableAmount)}</td>
                  <td className="p-2 text-sky-900 text-[11px]">Dasar penerbitan Invoice Termin Minggu Ke-{selectedWeek}</td>
                </tr>
                <tr>
                  <td className="p-2 text-slate-600">Potongan Retensi Masa Pemeliharaan (5%)</td>
                  <td className="p-2 text-center font-mono text-slate-600">5.0%</td>
                  <td className="p-2 text-right font-mono text-slate-600">-{formatRupiah(retention5Pct)}</td>
                  <td className="p-2 text-slate-500 text-[11px]">Ditahan hingga masa pemeliharaan FHO selesai</td>
                </tr>
                <tr className="bg-emerald-50/80 font-bold border-t-2 border-emerald-600">
                  <td className="p-2 text-emerald-950 text-sm">TOTAL NETTO DITAGIHKAN KE OWNER (SEBELUM PPN)</td>
                  <td className="p-2 text-center font-mono text-emerald-950">22.8%</td>
                  <td className="p-2 text-right font-mono text-emerald-950 text-sm">{formatRupiah(netClaimableBilling)}</td>
                  <td className="p-2 text-emerald-800 text-[11px]">Rekomendasi pencairan dana dari Konsultan MK</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Grafik Kurva S & Indikator EVM Standar PMI */}
        <div className="mb-6 space-y-2 page-break-inside-avoid">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b-2 border-slate-300 pb-1">
            <TrendingUp className="w-4 h-4 text-sky-700 print:text-slate-900" />
            III. Analisis Kinerja Biaya & Jadwal (EVM Indicators & S-Curve)
          </h3>

          {/* Kurva S Mini Table Representation */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Perbandingan Garis Kurva S Mingguan:</span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-1 bg-slate-400 inline-block" /> Rencana Baseline (PV)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <span className="w-3 h-1 bg-emerald-600 inline-block" /> Realisasi Aktual (EV)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
              {sCurveWeeks.map((w) => (
                <div key={w.week} className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">Wk {w.week}</span>
                  <span className="font-mono text-[11px] text-slate-500 block">{w.planned}%</span>
                  <span className="font-mono text-xs font-bold text-emerald-700 block">
                    {w.actual !== null ? `${w.actual}%` : '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabel Indikator EVM */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Schedule Variance (SV)</span>
              <span className="font-mono font-bold text-amber-600 block text-sm">
                {formatRupiah(scheduleVariance)}
              </span>
              <span className="text-[10px] text-slate-500">EV - PV (Deviasi Fisik)</span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Cost Variance (CV)</span>
              <span className="font-mono font-bold text-emerald-700 block text-sm">
                +{formatRupiah(costVariance)}
              </span>
              <span className="text-[10px] text-slate-500">EV - AC (Efisiensi Kas)</span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Biaya Aktual Terbayar (AC)</span>
              <span className="font-mono font-bold text-slate-900 block text-sm">
                {formatRupiah(actualCost)}
              </span>
              <span className="text-[10px] text-slate-500">Total Kuitansi Lapangan</span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Proyeksi Akhir Biaya (EAC)</span>
              <span className="font-mono font-bold text-sky-800 block text-sm">
                {formatRupiah(estimateAtCompletion)}
              </span>
              <span className="text-[10px] text-slate-500">Hemat ~Rp 157 Juta</span>
            </div>
          </div>
        </div>

        {/* Section 4: Grid Foto Dokumentasi Opname Fisik Ber-geotag */}
        <div className="mb-6 space-y-2 page-break-inside-avoid">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b-2 border-slate-300 pb-1">
            <Camera className="w-4 h-4 text-sky-700 print:text-slate-900" />
            IV. Dokumentasi Visual Opname Fisik Lapangan (Geotag & Anti-Fake Timestamp)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {sitePhotos.map((photo, idx) => (
              <div key={idx} className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50 p-2 space-y-2">
                <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-[16/9] bg-slate-200 flex items-center justify-center">
                  <img
                    src={photo.photoUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Stempel Geotag Watermark Overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 text-white p-1.5 text-[9px] font-mono flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                      {photo.latLong}
                    </span>
                    <span>{photo.date}</span>
                  </div>
                </div>

                <div className="text-xs space-y-0.5 px-1">
                  <div className="font-bold text-slate-900 line-clamp-1">{photo.title}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-medium text-slate-700">{photo.zone}</span>
                    <span className="text-emerald-700 font-semibold">{photo.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Lembar Pengesahan Tripartite Sign-off */}
        <div className="pt-4 border-t-2 border-slate-300 page-break-inside-avoid">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 text-center mb-6">
            Lembar Pengesahan Bersama Kemajuan Pekerjaan (Tripartite Approval Sign-Off)
          </h3>

          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            {/* Pihak 1: Kontraktor */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between h-44">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Disusun Oleh:</span>
                <span className="font-bold text-slate-900 block mt-0.5">Kontraktor Pelaksana</span>
                <span className="text-[10px] text-slate-600 font-medium">PT Karsa Konstruksi Mandiri</span>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-[10px] text-emerald-700 font-semibold">
                  [Tanda Tangan Digital Terverifikasi]
                </div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  Ir. Budi Hartono, IPM
                </div>
                <div className="text-[10px] text-slate-500">Project Manager</div>
              </div>
            </div>

            {/* Pihak 2: Konsultan MK */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between h-44">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Diperiksa & Disetujui:</span>
                <span className="font-bold text-slate-900 block mt-0.5">Konsultan Pengawas (MK)</span>
                <span className="text-[10px] text-slate-600 font-medium">PT Delta Pratama Konsultan</span>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-[10px] text-emerald-700 font-semibold">
                  [Tanda Tangan Digital Terverifikasi]
                </div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  Hendro Suwarno, ST, MT
                </div>
                <div className="text-[10px] text-slate-500">Team Leader / Senior RE</div>
              </div>
            </div>

            {/* Pihak 3: Owner */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between h-44">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Disetujui Pencairan:</span>
                <span className="font-bold text-slate-900 block mt-0.5">Pemberi Tugas (Owner)</span>
                <span className="text-[10px] text-slate-600 font-medium">PT Cikarang Megah Perkasa</span>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-[10px] text-emerald-700 font-semibold">
                  [Otorisasi Termin Siap Bayar]
                </div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  Drs. Agus Wijaya, MM
                </div>
                <div className="text-[10px] text-slate-500">Project Director / PPK</div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center mt-6">
            Dokumen ini dibuat dan diterbitkan secara sah melalui sistem manajemen proyek Karsa Pantau. Data finansial, kurva S, dan foto geotag terikat secara elektronik dan tidak dapat diubah tanpa persetujuan seluruh pihak.
          </div>
        </div>
      </div>
    </div>
  );
}
