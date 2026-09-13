'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Plus, MapPin, Zap, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { apiRequest } from '../../lib/api';

interface Project {
  id: string;
  name: string;
  location: string;
  capacityMw: number;
  status: string;
  totalRab: number;
  totalActual: number;
  variancePct: number;
  physicalProgressPct: number;
  createdAt: string;
}

const DEFAULT_DEMO_PROJECTS: Project[] = [
  {
    id: 'demo-p1',
    name: 'PLTS Cirata Terapung 50MW',
    location: 'Purwakarta, Jawa Barat',
    capacityMw: 50.0,
    status: 'ongoing',
    totalRab: 45000000000,
    totalActual: 6100000000,
    variancePct: -4.5,
    physicalProgressPct: 14.2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-p2',
    name: 'PLTS Rooftop Kawasan Industri Cikarang 5MW',
    location: 'Bekasi, Jawa Barat',
    capacityMw: 5.0,
    status: 'planning',
    totalRab: 4500000000,
    totalActual: 0,
    variancePct: 0,
    physicalProgressPct: 0,
    createdAt: new Date().toISOString(),
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_DEMO_PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ data: Project[] }>('/projects')
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setProjects(res.data);
        }
      })
      .catch(() => {
        // Gunakan demo data jika backend belum terhubung
      })
      .finally(() => setLoading(false));
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-sky-400" />
            Portofolio Proyek PLTS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitoring anggaran, realisasi biaya, dan progres fisik seluruh proyek konstruksi tenaga surya
          </p>
        </div>

        <div>
          <button
            onClick={() => alert('Fitur buat proyek baru aktif untuk role Admin & PM')}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 font-semibold text-sm text-white transition-colors shadow-lg shadow-sky-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Proyek Baru
          </button>
        </div>
      </div>

      {/* Grid Proyek */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((proj) => {
          const isOverbudget = proj.variancePct > 0;
          return (
            <div
              key={proj.id}
              className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                {/* Status & Kapasitas */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    {proj.capacityMw} MWp
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                      proj.status === 'ongoing'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : proj.status === 'planning'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {proj.status === 'ongoing' ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    {proj.status}
                  </span>
                </div>

                {/* Nama & Lokasi */}
                <h2 className="text-xl font-bold text-white mb-1">{proj.name}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1 mb-5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {proj.location}
                </p>

                {/* Metrik RAB vs Realisasi */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-5">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Total RAB (Baseline)
                    </span>
                    <span className="text-sm font-bold text-slate-100">
                      {formatRupiah(proj.totalRab)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Realisasi Aktual
                    </span>
                    <span className="text-sm font-bold text-slate-100">
                      {formatRupiah(proj.totalActual)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Progres Fisik */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Progres Fisik Aktual</span>
                    <span className="text-sky-400 font-mono">{proj.physicalProgressPct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(proj.physicalProgressPct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Card */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {isOverbudget ? (
                    <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      +{proj.variancePct}% Overbudget
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {proj.variancePct}% On Track
                    </span>
                  )}
                </div>

                <Link
                  href={`/projects/${proj.id}`}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white transition-colors border border-slate-700"
                >
                  Buka Dashboard &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
