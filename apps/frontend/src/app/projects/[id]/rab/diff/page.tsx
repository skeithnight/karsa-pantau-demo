'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  GitCompare,
  GitBranch,
  GitCommit,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  Download,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
  Building2,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

interface DiffItem {
  id: string;
  wbsCode: string;
  itemCode: string;
  description: string;
  diffType: 'ADDED' | 'MODIFIED' | 'REMOVED' | 'UNCHANGED';
  baseVol: number;
  revisedVol: number;
  unit: string;
  basePrice: number;
  revisedPrice: number;
  baseSubtotal: number;
  revisedSubtotal: number;
  deltaSubtotal: number;
  deltaPercentage: number;
  notes?: string;
}

export default function RabDiffPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [baseVersion, setBaseVersion] = useState('v1.0');
  const [targetVersion, setTargetVersion] = useState('v1.1');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Sample Version Metadata
  const versions = [
    {
      id: 'v1.0',
      label: 'v1.0 (Tender Baseline Kontrak Awal)',
      date: '15 Jan 2026',
      total: 65951500000,
      author: 'Ahmad Fauzi (Estimator)',
      status: 'APPROVED BASELINE',
      note: 'RAB disepakati pada penandatanganan kontrak kerja utama',
    },
    {
      id: 'v1.1',
      label: 'v1.1 (Revisi Owner & Addendum CCO #1)',
      date: '28 Feb 2026',
      total: 66820000000,
      author: 'Budi Santoso (Project Manager)',
      status: 'SUBMITTED FOR APPROVAL',
      note: 'Penyesuaian volume galian fondasi lereng & penambahan proteksi grounding petir',
    },
  ];

  // Granular Diff Data
  const diffItems: DiffItem[] = [
    {
      id: 'd1',
      wbsCode: '1.1.01',
      itemCode: 'CIV-SNI-01',
      description: 'Pekerjaan Galian Tanah Berbatu & Slope Stabilizer',
      diffType: 'MODIFIED',
      baseVol: 1800,
      revisedVol: 2350,
      unit: 'm3',
      basePrice: 85000,
      revisedPrice: 85000,
      baseSubtotal: 153000000,
      revisedSubtotal: 199750000,
      deltaSubtotal: 46750000,
      deltaPercentage: 30.56,
      notes: 'CCO Owner: Tambahan kedalaman fondasi lereng blok timur (+550 m3)',
    },
    {
      id: 'd2',
      wbsCode: '1.1.02',
      itemCode: 'CIV-SNI-04',
      description: 'Beton Ready Mix Mutu K-300 Struktur Kolom & Balok Penguat',
      diffType: 'MODIFIED',
      baseVol: 450,
      revisedVol: 490,
      unit: 'm3',
      basePrice: 1150000,
      revisedPrice: 1180000,
      baseSubtotal: 517500000,
      revisedSubtotal: 578200000,
      deltaSubtotal: 60700000,
      deltaPercentage: 11.73,
      notes: 'Penyesuaian dimensi balok penahan beban & kenaikan harga batching plant lokal',
    },
    {
      id: 'd3',
      wbsCode: '1.1.06',
      itemCode: 'CIV-SNI-05',
      description: 'Pembesian Besi Beton Ulir BJTD-40 D16 & D19 Terpasang',
      diffType: 'MODIFIED',
      baseVol: 65000,
      revisedVol: 72000,
      unit: 'kg',
      basePrice: 16800,
      revisedPrice: 16800,
      baseSubtotal: 1092000000,
      revisedSubtotal: 1209600000,
      deltaSubtotal: 117600000,
      deltaPercentage: 10.77,
      notes: 'Penambahan perkuatan tulangan geser sesuai rekomendasi konsultan MK',
    },
    {
      id: 'd4',
      wbsCode: '2.1.05',
      itemCode: 'EL-EXT-01',
      description: 'Sistem Proteksi Petir Early Streamer Emission (ESE) Radius 100m',
      diffType: 'ADDED',
      baseVol: 0,
      revisedVol: 2,
      unit: 'unit',
      basePrice: 0,
      revisedPrice: 285000000,
      baseSubtotal: 0,
      revisedSubtotal: 570000000,
      deltaSubtotal: 570000000,
      deltaPercentage: 100,
      notes: 'Scope Baru Addendum: Permintaan asuransi risiko petir area terbuka',
    },
    {
      id: 'd5',
      wbsCode: '2.2.03',
      itemCode: 'EL-EXT-02',
      description: 'Kabel Bare Copper (BC) 50mm2 Grounding Ring Grid',
      diffType: 'ADDED',
      baseVol: 0,
      revisedVol: 850,
      unit: 'meter',
      basePrice: 0,
      revisedPrice: 145000,
      baseSubtotal: 0,
      revisedSubtotal: 123250000,
      deltaSubtotal: 123250000,
      deltaPercentage: 100,
      notes: 'Scope Baru Addendum: Sistem pentanahan terintegrasi',
    },
    {
      id: 'd6',
      wbsCode: '1.2.04',
      itemCode: 'CIV-SNI-09',
      description: 'Pagar Sementara Seng Gelombang T. 2.0m Proyek',
      diffType: 'REMOVED',
      baseVol: 350,
      revisedVol: 0,
      unit: 'meter',
      basePrice: 142000,
      revisedPrice: 0,
      baseSubtotal: 49800000,
      revisedSubtotal: 0,
      deltaSubtotal: -49800000,
      deltaPercentage: -100,
      notes: 'Dihapus dari scope kontraktor: Disediakan langsung oleh pengelola kawasan industri',
    },
    {
      id: 'd7',
      wbsCode: '2.1.01',
      itemCode: 'EL-DC-01',
      description: 'Modul Surya Tier-1 Monokristalin 550Wp High-Efficiency',
      diffType: 'UNCHANGED',
      baseVol: 15718,
      revisedVol: 15718,
      unit: 'unit',
      basePrice: 1650000,
      revisedPrice: 1650000,
      baseSubtotal: 25934700000,
      revisedSubtotal: 25934700000,
      deltaSubtotal: 0,
      deltaPercentage: 0,
    },
    {
      id: 'd8',
      wbsCode: '2.1.02',
      itemCode: 'EL-DC-02',
      description: 'Inverter On-Grid 100kW 3-Phase Multi-MPPT Industrial',
      diffType: 'UNCHANGED',
      baseVol: 80,
      revisedVol: 80,
      unit: 'unit',
      basePrice: 92000000,
      revisedPrice: 92000000,
      baseSubtotal: 7360000000,
      revisedSubtotal: 7360000000,
      deltaSubtotal: 0,
      deltaPercentage: 0,
    },
  ];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const currentBase = versions.find((v) => v.id === baseVersion) || versions[0];
  const currentTarget = versions.find((v) => v.id === targetVersion) || versions[1];

  const netDeltaIdr = currentTarget.total - currentBase.total;
  const netDeltaPct = ((netDeltaIdr / currentBase.total) * 100).toFixed(2);

  const filteredItems = diffItems.filter((item) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'CHANGED') return item.diffType !== 'UNCHANGED';
    return item.diffType === filterType;
  });

  const countAdded = diffItems.filter((i) => i.diffType === 'ADDED').length;
  const countModified = diffItems.filter((i) => i.diffType === 'MODIFIED').length;
  const countRemoved = diffItems.filter((i) => i.diffType === 'REMOVED').length;

  const handleExportDiffReport = () => {
    const headers = 'WBS,Kode Item,Deskripsi,Status Diff,Volume Baseline,Volume Revisi,Satuan,Harga Baseline,Harga Revisi,Subtotal Baseline,Subtotal Revisi,Dampak Variasi (IDR),Catatan CCO\n';
    const rows = diffItems
      .map(
        (i) =>
          `"${i.wbsCode}","${i.itemCode}","${i.description}","${i.diffType}",${i.baseVol},${i.revisedVol},"${i.unit}",${i.basePrice},${i.revisedPrice},${i.baseSubtotal},${i.revisedSubtotal},${i.deltaSubtotal},"${i.notes || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Variasi_RAB_${baseVersion}_vs_${targetVersion}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRequestApproval = () => {
    setStatusNotice('Draf Addendum CCO (v1.1) telah diajukan ke Direktur / Approver untuk validasi dan penandatanganan digital.');
    setTimeout(() => setStatusNotice(null), 6000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Dashboard Proyek
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
              <GitBranch className="w-3 h-3 text-amber-400" />
              <span>Git-like RAB Versioning</span>
            </span>
            <span className="text-xs text-slate-400">Penyelarasan Kontrak & CCO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <GitCompare className="w-7 h-7 text-amber-400" />
            RAB Versioning & Delta Diff Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Perbandingan baris demi baris antara baseline tender dengan revisi addendum / Contract Change Order (CCO).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportDiffReport}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Ekspor Laporan CCO (.CSV)</span>
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2.5 shadow-lg">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Version Selector Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Base Version */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <GitCommit className="w-3.5 h-3.5 text-sky-400" />
              Versi Baseline (Acuan Pembanding):
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">
              {currentBase.status}
            </span>
          </div>
          <select
            value={baseVersion}
            onChange={(e) => setBaseVersion(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium text-xs"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} — {formatRupiah(v.total)}
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Disusun oleh: {currentBase.author}</span>
            <span>{currentBase.date}</span>
          </div>
        </div>

        {/* Target Version */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <GitCommit className="w-3.5 h-3.5 text-amber-400" />
              Versi Revisi Terkini (Target Addendum):
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
              {currentTarget.status}
            </span>
          </div>
          <select
            value={targetVersion}
            onChange={(e) => setTargetVersion(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium text-xs"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} — {formatRupiah(v.total)}
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Disusun oleh: {currentTarget.author}</span>
            <span>{currentTarget.date}</span>
          </div>
        </div>
      </div>

      {/* Contract Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium block">Total Nilai Baseline ({baseVersion})</span>
          <span className="text-lg sm:text-xl font-bold text-white font-mono">{formatRupiah(currentBase.total)}</span>
          <span className="text-[10px] text-slate-500 block">Pagu acuan tender</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium block">Total Nilai Revisi ({targetVersion})</span>
          <span className="text-lg sm:text-xl font-bold text-white font-mono">{formatRupiah(currentTarget.total)}</span>
          <span className="text-[10px] text-slate-500 block">Draf addendum aktif</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-amber-900/60 bg-amber-950/20 space-y-1">
          <span className="text-xs text-amber-300 font-medium block">Dampak Netto Variasi Kontrak</span>
          <div className="flex items-center gap-1 text-lg sm:text-xl font-bold font-mono text-amber-400">
            {netDeltaIdr >= 0 ? (
              <ArrowUpRight className="w-5 h-5 text-amber-400" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-emerald-400" />
            )}
            <span>{netDeltaIdr >= 0 ? '+' : ''}{formatRupiah(netDeltaIdr)}</span>
          </div>
          <span className="text-[10px] text-amber-300/80 font-mono">
            {netDeltaIdr >= 0 ? '+' : ''}{netDeltaPct}% dari pagu awal
          </span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium block">Statistik Perubahan Scope</span>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              +{countAdded} Baru
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
              ~{countModified} Ubah
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
              -{countRemoved} Hapus
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">Total 6 modifikasi pekerjaan</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: `Semua Item (${diffItems.length})` },
            { id: 'CHANGED', label: `Hanya Berubah (${countAdded + countModified + countRemoved})` },
            { id: 'MODIFIED', label: `Dimodifikasi (${countModified})` },
            { id: 'ADDED', label: `Scope Baru (+${countAdded})` },
            { id: 'REMOVED', label: `Dihapus (-${countRemoved})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Menampilkan {filteredItems.length} baris pekerjaan
        </span>
      </div>

      {/* Visual Diff Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] text-slate-400 font-semibold uppercase bg-slate-900/90 border-b border-slate-800 tracking-wider">
              <tr>
                <th className="py-3 px-3">Status Diff</th>
                <th className="py-3 px-3">WBS & Item</th>
                <th className="py-3 px-3">Deskripsi Pekerjaan</th>
                <th className="py-3 px-3 text-right">Volume ({baseVersion} → {targetVersion})</th>
                <th className="py-3 px-3 text-right">Harga Satuan</th>
                <th className="py-3 px-3 text-right">Subtotal Baseline</th>
                <th className="py-3 px-3 text-right">Subtotal Revisi</th>
                <th className="py-3 px-3 text-right">Dampak Variasi (Delta)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredItems.map((item) => {
                const isAdded = item.diffType === 'ADDED';
                const isModified = item.diffType === 'MODIFIED';
                const isRemoved = item.diffType === 'REMOVED';

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isAdded
                        ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                        : isModified
                        ? 'bg-amber-950/20 hover:bg-amber-950/30'
                        : isRemoved
                        ? 'bg-rose-950/20 hover:bg-rose-950/30 line-through text-slate-500'
                        : 'hover:bg-slate-900/40 text-slate-300'
                    }`}
                  >
                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isAdded && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 inline-flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Scope Baru
                        </span>
                      )}
                      {isModified && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 inline-flex items-center gap-1">
                          <Edit3 className="w-3 h-3" /> Dimodifikasi
                        </span>
                      )}
                      {isRemoved && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 inline-flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Dihapus
                        </span>
                      )}
                      {!isAdded && !isModified && !isRemoved && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800">
                          Tetap
                        </span>
                      )}
                    </td>

                    {/* WBS & Item Code */}
                    <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                      <span className="text-sky-400 font-bold block">{item.wbsCode}</span>
                      <span className="text-slate-500 text-[10px]">{item.itemCode}</span>
                    </td>

                    {/* Description & CCO Note */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-medium text-slate-100 leading-snug">{item.description}</div>
                      {item.notes && (
                        <div className="text-[10px] text-amber-300/90 mt-1 font-mono leading-tight">
                          ↳ {item.notes}
                        </div>
                      )}
                    </td>

                    {/* Volume Transition */}
                    <td className="py-3 px-3 text-right font-mono text-[11px] whitespace-nowrap">
                      {isAdded ? (
                        <span className="text-emerald-400 font-bold">+{item.revisedVol.toLocaleString('id-ID')} {item.unit}</span>
                      ) : isRemoved ? (
                        <span className="text-rose-400 font-bold">-{item.baseVol.toLocaleString('id-ID')} {item.unit}</span>
                      ) : isModified && item.baseVol !== item.revisedVol ? (
                        <div>
                          <span className="text-slate-400">{item.baseVol.toLocaleString('id-ID')}</span>
                          <span className="text-slate-500 mx-1">→</span>
                          <span className="text-amber-400 font-bold">{item.revisedVol.toLocaleString('id-ID')}</span>
                          <span className="text-[10px] text-amber-300 block">
                            ({item.revisedVol > item.baseVol ? '+' : ''}{(item.revisedVol - item.baseVol).toLocaleString('id-ID')} {item.unit})
                          </span>
                        </div>
                      ) : (
                        <span>{item.baseVol.toLocaleString('id-ID')} {item.unit}</span>
                      )}
                    </td>

                    {/* Unit Price Transition */}
                    <td className="py-3 px-3 text-right font-mono text-[11px] whitespace-nowrap">
                      {isAdded ? (
                        <span className="text-emerald-400">{formatRupiah(item.revisedPrice)}</span>
                      ) : isRemoved ? (
                        <span className="text-slate-500">{formatRupiah(item.basePrice)}</span>
                      ) : isModified && item.basePrice !== item.revisedPrice ? (
                        <div>
                          <span className="text-slate-400">{formatRupiah(item.basePrice)}</span>
                          <span className="text-slate-500 mx-1">→</span>
                          <span className="text-amber-400 font-bold">{formatRupiah(item.revisedPrice)}</span>
                        </div>
                      ) : (
                        <span>{formatRupiah(item.basePrice)}</span>
                      )}
                    </td>

                    {/* Base Subtotal */}
                    <td className="py-3 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                      {formatRupiah(item.baseSubtotal)}
                    </td>

                    {/* Revised Subtotal */}
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-100 whitespace-nowrap">
                      {formatRupiah(item.revisedSubtotal)}
                    </td>

                    {/* Net Delta Column */}
                    <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                      {item.deltaSubtotal > 0 ? (
                        <span className="text-amber-400">+{formatRupiah(item.deltaSubtotal)}</span>
                      ) : item.deltaSubtotal < 0 ? (
                        <span className="text-emerald-400">{formatRupiah(item.deltaSubtotal)}</span>
                      ) : (
                        <span className="text-slate-500">Rp 0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Setiap perubahan volume dan harga terekam secara permanen untuk audit addendum kontrak BPKP/Owner.</span>
          </div>

          <button
            onClick={handleRequestApproval}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white transition-all shadow-lg shadow-amber-600/20 cursor-pointer"
          >
            Ajukan Approval Addendum CCO (v1.1)
          </button>
        </div>
      </div>
    </div>
  );
}
