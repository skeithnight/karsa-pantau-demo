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
  Sparkles,
  Bot,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Building2,
  GitCompare,
  Calendar,
  Wallet,
  Printer,
} from 'lucide-react';

import { apiRequest } from '../../../lib/api';
import { AiChatWidget } from '../../../components/AiChatWidget';

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>({
    id: projectId,
    name: 'Pembangunan Gedung Fasilitas & MEP Cikarang (Demo)',
    location: 'Kawasan Industri GIIC Cikarang, Jawa Barat',
    status: 'ongoing',
    totalRab: 2451500000,
    totalActual: 1499800000,
    variancePct: -38.8,
    physicalProgressPct: 74.0,
  });

  const [rabData, setRabData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AI Live Insights State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<{
    type: 'anomaly' | 'forecast';
    title: string;
    text: string;
    timestamp: string;
    anomalies?: any[];
  } | null>(null);

  // Helper function to safely extract string text from various insight output formats
  const extractInsightText = (output: any): string => {
    if (!output) return '';
    if (typeof output === 'string') {
      try {
        const parsed = JSON.parse(output);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed.narrativeSummary || parsed.narrativeForecast || parsed.response || parsed.text || output;
        }
      } catch {
        return output;
      }
      return output;
    }
    if (typeof output === 'object') {
      return (
        output.narrativeSummary ||
        output.narrativeForecast ||
        output.response ||
        output.text ||
        JSON.stringify(output)
      );
    }
    return String(output);
  };

  useEffect(() => {
    // Ambil detail proyek, RAB aktif, dan insight AI sebelumnya jika ada
    Promise.all([
      apiRequest(`/projects/${projectId}`).catch(() => null),
      apiRequest(`/projects/${projectId}/rab/active`).catch(() => null),
      apiRequest(`/ai/insights/${projectId}?limit=5`).catch(() => null),
    ]).then(([projRes, activeRab, insightsRes]) => {
      if (projRes) setProject(projRes);
      if (activeRab) setRabData(activeRab);
      if (Array.isArray(insightsRes) && insightsRes.length > 0) {
        const candidate =
          insightsRes.find((i: any) => i.type === 'anomaly' || i.type === 'forecast') || insightsRes[0];
        const text = extractInsightText(candidate.output);
        const title =
          candidate.type === 'anomaly'
            ? 'Hasil Audit Anomali Terakhir'
            : candidate.type === 'forecast'
            ? 'Proyeksi EVM Terakhir'
            : 'Wawasan AI Terakhir';

        setAiInsight({
          type: candidate.type,
          title,
          text: text || 'Wawasan AI tersedia.',
          timestamp: new Date(candidate.created_at).toLocaleTimeString('id-ID'),
        });
      }
      setLoading(false);
    });
  }, [projectId]);

  const handleTriggerAnomaly = async () => {
    setAiLoading(true);
    try {
      const res = await apiRequest(`/ai/anomalies/${projectId}`, { method: 'POST' });
      const text =
        extractInsightText(res.aiAnalysis) ||
        'Seluruh pos pekerjaan berada dalam batas toleransi anggaran (efisien).';
      setAiInsight({
        type: 'anomaly',
        title: `Audit Anomali AI (${res.anomaliesFound || 0} deviasi terdeteksi)`,
        text,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        anomalies: res.anomalies || [],
      });
    } catch (err: any) {
      setAiInsight({
        type: 'anomaly',
        title: 'Audit Anomali AI',
        text: `Pemeriksaan anomali via AI: ${err.message || 'Server timeout'}`,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleTriggerForecast = async () => {
    setAiLoading(true);
    try {
      const res = await apiRequest(`/ai/forecast/${projectId}`);
      const text = extractInsightText(res.aiNarrative) || 'Proyeksi EVM berhasil disusun.';
      setAiInsight({
        type: 'forecast',
        title: 'Analisis Proyeksi EVM & Forecast EAC',
        text,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    } catch (err: any) {
      setAiInsight({
        type: 'forecast',
        title: 'Analisis Proyeksi EVM & Forecast EAC',
        text: `Kalkulasi forecast EVM via AI: ${err.message || 'Server timeout'}`,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    } finally {
      setAiLoading(false);
    }
  };

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
      description: 'Pekerjaan Struktur Kolom & Balok Beton Bertulang K-300',
      volume: 450,
      unit: 'm3',
      unit_price: 1850000,
      subtotal: 832500000,
      total_actual: 520000000,
      variance_pct: -37.5,
    },
    {
      id: 'i2',
      wbs_code: '2.0',
      item_code: 'MEP-01',
      work_package: 'ELECTRICAL_AC',
      category: 'material',
      description: 'Instalasi Panel Distribusi Utama & Kabel Feeder NYY 4x120mm',
      volume: 1,
      unit: 'lot',
      unit_price: 650000000,
      subtotal: 650000000,
      total_actual: 480000000,
      variance_pct: -26.1,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 flex items-center gap-1 font-medium">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              {project.capacityMw ? `${project.capacityMw} MWp` : 'Gedung & MEP Industri'}
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

          <Link
            href={`/projects/${projectId}/rab/diff`}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <GitCompare className="w-4 h-4 text-amber-400" />
            Lacak Revisi & Diff RAB
          </Link>

          <Link
            href={`/projects/${projectId}/daily-logs`}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            Laporan Harian (Site Log)
          </Link>

          <Link
            href={`/projects/${projectId}/petty-cash`}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Wallet className="w-4 h-4 text-purple-400" />
            Kasbon Lapangan (Petty Cash)
          </Link>

          <Link
            href={`/projects/${projectId}/report`}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Laporan Eksekutif (PDF)
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
          <Link
            href={`/projects/${projectId}/rab/diff`}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-1 transition-colors"
          >
            <GitCompare className="w-3 h-3" />
            <span>v1.0 Baseline (Ada 1 Revisi CCO)</span>
          </Link>
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

      {/* AI Copilot & Live Insights Panel */}
      <div className="glass-card rounded-2xl p-6 border border-sky-800/50 bg-gradient-to-br from-slate-900 via-sky-950/20 to-indigo-950/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">AI Cost & Risk Copilot</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                  Fitur Cerdas AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deteksi anomali deviasi harga, audit batas toleransi RAB, dan proyeksi EVM cerdas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={aiLoading}
              onClick={handleTriggerAnomaly}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>Jalankan Audit Anomali</span>
            </button>

            <button
              type="button"
              disabled={aiLoading}
              onClick={handleTriggerForecast}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20 cursor-pointer disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Proyeksi EAC & EVM</span>
            </button>
          </div>
        </div>

        {aiInsight ? (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {aiInsight.title}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Diperbarui: {aiInsight.timestamp}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {typeof aiInsight.text === 'string' ? aiInsight.text : extractInsightText(aiInsight.text)}
            </p>
            {aiInsight.anomalies && aiInsight.anomalies.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Item Dengan Deviasi Signifikan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiInsight.anomalies.map((an: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950/60 border border-amber-900/40 text-[11px] flex justify-between items-center">
                      <span className="text-slate-300 font-medium truncate max-w-[200px]">{an.description}</span>
                      <span className={`font-mono font-bold ${an.variancePct > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {an.variancePct > 0 ? `+${an.variancePct}%` : `${an.variancePct}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center py-5 space-y-1">
            <Sparkles className="w-6 h-6 text-slate-500 mx-auto mb-1" />
            <p className="text-xs text-slate-300 font-medium">Belum ada analisis AI yang dijalankan untuk sesi ini</p>
            <p className="text-[11px] text-slate-500">
              Klik <strong>"Jalankan Audit Anomali"</strong> atau <strong>"Proyeksi EAC & EVM"</strong> di atas, atau klik tombol <strong>AI Copilot Proyek</strong> di pojok kanan bawah untuk tanya jawab interaktif.
            </p>
          </div>
        )}
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

      {/* Floating AI Project Copilot Assistant */}
      <AiChatWidget projectId={projectId} projectName={project.name} />
    </div>
  );
}
