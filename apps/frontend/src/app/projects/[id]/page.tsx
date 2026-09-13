'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Activity,
  PlusCircle,
  FileSpreadsheet,
  Users,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../../../lib/api';

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>({
    id: projectId,
    name: 'PLTS Cirata Terapung 50MW',
    location: 'Purwakarta, Jawa Barat',
    capacityMw: 50.0,
    status: 'ongoing',
    totalRab: 45000000000,
    totalActual: 6100000000,
    variancePct: -4.5,
    physicalProgressPct: 14.2,
  });

  const [rabData, setRabData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil detail proyek & RAB aktif
    Promise.all([
      apiRequest(`/projects/${projectId}`).catch(() => null),
      apiRequest(`/projects/${projectId}/rab/active`).catch(() => null),
    ]).then(([projRes, activeRab]) => {
      if (projRes) setProject(projRes);
      if (activeRab) setRabData(activeRab);
      setLoading(false);
    });
  }, [projectId]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Mock items jika activeRab belum ada
  const items = rabData?.items || [
    {
      id: 'i1',
      wbs_code: '1.0',
      item_code: 'CIV-01',
      work_package: 'CIVIL',
      category: 'material',
      description: 'Floating Mounting Structure & Ponton HDPE',
      volume: 90000,
      unit: 'unit',
      unit_price: 120000,
      subtotal: 10800000000,
      total_actual: 3200000000,
      variance_pct: -70.3,
    },
    {
      id: 'i2',
      wbs_code: '2.0',
      item_code: 'EL-DC-01',
      work_package: 'ELECTRICAL_DC',
      category: 'material',
      description: 'Modul PV Monokristalin Tier-1 550Wp',
      volume: 91000,
      unit: 'Wp',
      unit_price: 285000,
      subtotal: 25935000000,
      total_actual: 2900000000,
      variance_pct: -88.8,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {project.capacityMw} MWp
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase font-semibold">
              {project.status}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{project.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{project.location}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/projects/${projectId}/actual/new`}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Input Realisasi Lapangan
          </Link>

          <Link
            href={`/projects/${projectId}/rab/new`}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Buka RAB Builder
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total RAB */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total RAB Baseline</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">
            {formatRupiah(project.totalRab)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Anggaran disetujui v1</p>
        </div>

        {/* Card 2: Realisasi Aktual */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Realisasi Lapangan</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">
            {formatRupiah(project.totalActual)}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">
            {Math.round((project.totalActual / (project.totalRab || 1)) * 100)}% dari total anggaran
          </p>
        </div>

        {/* Card 3: Variansi */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Variance Anggaran</span>
            {project.variancePct > 0 ? (
              <TrendingUp className="w-4 h-4 text-rose-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold ${
              project.variancePct > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {project.variancePct > 0 ? `+${project.variancePct}%` : `${project.variancePct}%`}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {project.variancePct > 0 ? 'Perlu mitigasi biaya' : 'Biaya terkontrol aman'}
          </p>
        </div>

        {/* Card 4: Progres Fisik */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Progres Fisik Aktual</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-sky-400">
            {project.physicalProgressPct}%
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-900 mt-2 overflow-hidden">
            <div
              className="h-full bg-sky-400 rounded-full"
              style={{ width: `${Math.min(project.physicalProgressPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* S-Curve & EVM Panel */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          Earned Value Management (EVM) & Kurva S
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-semibold">Cost Perf. Index (CPI)</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">1.0475</span>
            <span className="text-[10px] text-slate-400 block">Efisien (CPI &gt; 1.0)</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-semibold">Sched. Perf. Index (SPI)</span>
            <span className="text-lg font-bold text-amber-400 font-mono">0.9467</span>
            <span className="text-[10px] text-slate-400 block">Sedikit lambat (SPI &lt; 1.0)</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-semibold">Planned Value (PV)</span>
            <span className="text-sm font-bold text-slate-200">{formatRupiah(6750000000)}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-semibold">Earned Value (EV)</span>
            <span className="text-sm font-bold text-slate-200">{formatRupiah(6390000000)}</span>
          </div>
        </div>
      </div>

      {/* Work Breakdown Structure (WBS) Breakdown Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            Breakdown Anggaran vs Realisasi per WBS
          </h2>
          <span className="text-xs text-slate-400">{items.length} Item Terdata</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/60 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">WBS / Kode</th>
                <th className="py-3 px-3">Paket Kerja</th>
                <th className="py-3 px-3">Deskripsi Pekerjaan</th>
                <th className="py-3 px-3 text-right">Volume</th>
                <th className="py-3 px-3 text-right">Harga Satuan</th>
                <th className="py-3 px-3 text-right">Total RAB</th>
                <th className="py-3 px-3 text-right">Realisasi</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {items.map((it: any) => (
                <tr key={it.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono text-sky-400 font-medium">
                    {it.wbs_code} <span className="text-slate-500">({it.item_code})</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                      {it.work_package}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-100 max-w-xs">{it.description}</td>
                  <td className="py-3 px-3 text-right font-mono">
                    {it.volume.toLocaleString('id-ID')} {it.unit}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">{formatRupiah(it.unit_price)}</td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-200">
                    {formatRupiah(it.subtotal)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400 font-semibold">
                    {formatRupiah(it.total_actual)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {it.variance_pct > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-semibold">
                        Over
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                        Aman
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
