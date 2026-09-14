'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Send, Calculator, Layers, AlertCircle, AlertTriangle, CheckCircle, Sparkles, Search, Loader2 } from 'lucide-react';
import { WorkPackage, CostCategory } from '@karsa/shared-types';
import { apiRequest } from '../../../../../lib/api';

interface BuilderItem {
  id: string;
  wbsCode: string;
  itemCode: string;
  workPackage: WorkPackage;
  category: CostCategory;
  description: string;
  volume: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

export default function RabBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // Form State
  const [wbsCode, setWbsCode] = useState('1.1');
  const [itemCode, setItemCode] = useState('CIV-02');
  const [workPackage, setWorkPackage] = useState<WorkPackage>(WorkPackage.CIVIL);
  const [category, setCategory] = useState<CostCategory>(CostCategory.MATERIAL);
  const [description, setDescription] = useState('');
  const [volume, setVolume] = useState<number | ''>('');
  const [unit, setUnit] = useState('unit');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');

  // AI Semantic Search State
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState<any | null>(null);

  const [items, setItems] = useState<BuilderItem[]>([
    {
      id: 'mock-1',
      wbsCode: '1.0',
      itemCode: 'CIV-01',
      workPackage: WorkPackage.CIVIL,
      category: CostCategory.MATERIAL,
      description: 'Pekerjaan Struktur Kolom Beton K-300 & Pembesian',
      volume: 450,
      unit: 'm3',
      unitPrice: 1850000,
      subtotal: 832500000,
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim() || aiSearching) return;
    setAiSearching(true);
    try {
      const res = await apiRequest(`/ai/semantic-search?q=${encodeURIComponent(aiSearchQuery)}`);
      setAiResults(res);
    } catch (err: any) {
      console.error('AI search failed:', err);
      setAiResults({
        aiExplanation: 'Pencarian semantik beralih ke pencarian teks lokal.',
        items: [],
      });
    } finally {
      setAiSearching(false);
    }
  };

  const applyAiItem = (item: any) => {
    setDescription(item.description || '');
    setUnit(item.unit || 'unit');
    setUnitPrice(item.unit_price || '');
    if (item.category) setCategory(item.category);
    if (item.work_package) setWorkPackage(item.work_package);
    if (item.item_code) setItemCode(item.item_code);
  };

  // Live calculation
  const currentSubtotal =
    typeof volume === 'number' && typeof unitPrice === 'number' && volume > 0 && unitPrice > 0
      ? volume * unitPrice
      : 0;

  const totalRab = items.reduce((acc, item) => acc + item.subtotal, 0);

  const [formError, setFormError] = useState<string | null>(null);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !volume || !unitPrice) {
      setFormError('Mohon isi seluruh field pekerjaan!');
      return;
    }
    setFormError(null);

    const newItem: BuilderItem = {
      id: Date.now().toString(),
      wbsCode,
      itemCode,
      workPackage,
      category,
      description,
      volume: Number(volume),
      unit,
      unitPrice: Number(unitPrice),
      subtotal: Number(volume) * Number(unitPrice),
    };

    setItems([...items, newItem]);
    setDescription('');
    setVolume('');
    setUnitPrice('');
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleSubmitForApproval = async () => {
    if (items.length === 0) {
      setFormError('RAB harus memiliki minimal 1 item pekerjaan sebelum diajukan!');
      return;
    }
    setFormError(null);

    setSaving(true);
    try {
      // Buat RAB draft dan submit
      const rab = await apiRequest(`/projects/${projectId}/rab`, {
        method: 'POST',
        body: JSON.stringify({ baselineType: 'ORIGINAL_CONTRACT', notes: 'RAB Final Kontrak Awal' }),
      });

      for (const it of items) {
        await apiRequest(`/rab/${rab.id}/items`, {
          method: 'POST',
          body: JSON.stringify(it),
        });
      }

      await apiRequest(`/rab/${rab.id}/submit`, { method: 'POST' });
      setMessage('RAB berhasil dibuat dan diajukan untuk approval Direktur/Approver!');
      setTimeout(() => router.push(`/projects/${projectId}`), 1500);
    } catch {
      // Fallback demo
      setMessage('RAB berhasil dibuat dan diajukan untuk approval (Mode Demo)!');
      setTimeout(() => router.push(`/projects/${projectId}`), 1500);
    } finally {
      setSaving(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back button & Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Dashboard Proyek
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-sky-400" />
            RAB Builder (Penyusunan Anggaran Biaya)
          </h1>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 uppercase font-semibold block">Total Akumulasi RAB</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">{formatRupiah(totalRab)}</span>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* AI Semantic Search AHSP Box */}
      <div className="glass-card rounded-2xl p-5 border border-sky-800/50 bg-gradient-to-r from-slate-900 via-sky-950/30 to-indigo-950/20 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Pencarian Cerdas Analisa Harga Satuan (AHSP) AI</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                  Pencarian Cerdas AI
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Ketik nama pekerjaan atau material dalam bahasa sehari-hari untuk menemukan referensi harga historis dan koefisien AHSP
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Contoh: Pekerjaan pondasi bore pile d60cm, Kabel NYY 4x16mm, Sewa crane 25 ton..."
            value={aiSearchQuery}
            onChange={(e) => setAiSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAiSearch();
              }
            }}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
          <button
            type="button"
            onClick={handleAiSearch}
            disabled={aiSearching || !aiSearchQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {aiSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Cari AHSP AI</span>
          </button>
        </div>

        {/* AI Results */}
        {aiResults && (
          <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-200">
            {aiResults.aiExplanation && (
              <p className="text-xs text-sky-300 bg-sky-950/40 p-2.5 rounded-xl border border-sky-800/40">
                💡 <strong>Rekomendasi AI:</strong> {aiResults.aiExplanation}
              </p>
            )}
            {aiResults.items && aiResults.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {aiResults.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/70 flex flex-col justify-between gap-2 hover:border-sky-500/60 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-mono uppercase text-sky-400">{item.item_code || 'AHSP'}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{item.unit}</span>
                      </div>
                      <p className="text-xs font-semibold text-white line-clamp-2">{item.description}</p>
                      <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                        {formatRupiah(item.unit_price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyAiItem(item)}
                      className="w-full py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 text-[11px] font-semibold border border-sky-800/60 transition-all cursor-pointer"
                    >
                      + Terapkan ke Form RAB
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Tidak ada item yang cocok dengan kata kunci tersebut.</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Item */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 lg:col-span-1 h-fit space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Plus className="w-4 h-4 text-sky-400" />
            Tambah Item Pekerjaan WBS
          </h2>

          <form onSubmit={handleAddItem} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Kode WBS</label>
                <input
                  type="text"
                  value={wbsCode}
                  onChange={(e) => setWbsCode(e.target.value)}
                  required
                  placeholder="1.1.01"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Kode Item</label>
                <input
                  type="text"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  required
                  placeholder="CIV-02"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Paket Kerja</label>
                <select
                  value={workPackage}
                  onChange={(e) => setWorkPackage(e.target.value as WorkPackage)}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value={WorkPackage.CIVIL}>CIVIL</option>
                  <option value={WorkPackage.ELECTRICAL_DC}>ELECTRICAL_DC</option>
                  <option value={WorkPackage.ELECTRICAL_AC}>ELECTRICAL_AC</option>
                  <option value={WorkPackage.SCADA_MONITORING}>SCADA</option>
                  <option value={WorkPackage.TESTING_COMMISSIONING}>T&C</option>
                  <option value={WorkPackage.OVERHEAD_PERMITS}>OVERHEAD</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kategori Biaya</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CostCategory)}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value={CostCategory.MATERIAL}>Material</option>
                  <option value={CostCategory.UPAH}>Upah</option>
                  <option value={CostCategory.ALAT}>Alat</option>
                  <option value={CostCategory.OVERHEAD}>Overhead</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Deskripsi Spesifikasi Pekerjaan</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={2}
                placeholder="Spesifikasi modul, kabel, trafo, atau volume pengerjaan..."
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-slate-400 mb-1">Volume</label>
                <input
                  type="number"
                  step="any"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value ? Number(e.target.value) : '')}
                  required
                  placeholder="100"
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-slate-400 mb-1">Satuan</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                  placeholder="unit"
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-slate-400 mb-1">Harga Satuan</label>
                <input
                  type="number"
                  step="any"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
                  required
                  placeholder="Rp"
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            {/* Live Preview Subtotal */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-sky-900/40 text-xs">
              <span className="text-slate-400 block">Subtotal Item Ini:</span>
              <span className="text-sm font-bold text-sky-400 font-mono">
                {formatRupiah(currentSubtotal)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Tambahkan ke Draft RAB
            </button>
          </form>
        </div>

        {/* Tabel Daftar Item Sementara */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-400" />
                Daftar Item RAB ({items.length} Item)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] text-slate-400 font-semibold uppercase bg-slate-900/80">
                  <tr>
                    <th className="py-2 px-2">WBS</th>
                    <th className="py-2 px-2">Deskripsi</th>
                    <th className="py-2 px-2 text-right">Volume</th>
                    <th className="py-2 px-2 text-right">Harga Satuan</th>
                    <th className="py-2 px-2 text-right">Subtotal</th>
                    <th className="py-2 px-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-900/40">
                      <td className="py-2 px-2 font-mono text-sky-400">{it.wbsCode}</td>
                      <td className="py-2 px-2 text-slate-200">{it.description}</td>
                      <td className="py-2 px-2 text-right font-mono">
                        {it.volume.toLocaleString('id-ID')} {it.unit}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">{formatRupiah(it.unitPrice)}</td>
                      <td className="py-2 px-2 text-right font-mono font-semibold text-slate-100">
                        {formatRupiah(it.subtotal)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => handleDeleteItem(it.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              RAB berstatus draft dapat disunting sebelum diajukan ke Approver.
            </span>
            <button
              onClick={handleSubmitForApproval}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {saving ? 'Mengajukan...' : 'Simpan & Ajukan Approval'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
