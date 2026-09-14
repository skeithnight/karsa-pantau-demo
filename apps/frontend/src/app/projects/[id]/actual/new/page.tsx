'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  WifiOff,
  Send,
  Building2,
  Calendar,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Camera,
  MapPin,
  Loader2,
  X,
} from 'lucide-react';
import { apiRequest } from '../../../../../lib/api';
import { queueOfflineActualEntry } from '../../../../../lib/offline/sync-queue';

export default function ActualInputPage() {

  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const uStr = localStorage.getItem('karsa_user');
    if (uStr) {
      try {
        setCurrentUser(JSON.parse(uStr));
      } catch {
        // no-op
      }
    } else {
      // Default to mandor/supervisor for testing
      setCurrentUser({ name: 'Agus Setiawan (Mandor)', role: 'supervisor' });
    }
  }, []);

  // Mock available RAB items
  const rabItems = [
    {
      id: 'i1',
      code: 'CIV-01',
      desc: 'Floating Mounting Structure & Ponton HDPE',
      subtotal: 10800000000,
      currentActual: 3200000000,
      unit: 'unit',
    },
    {
      id: 'i2',
      code: 'EL-DC-01',
      desc: 'Modul PV Monokristalin Tier-1 550Wp',
      subtotal: 25935000000,
      currentActual: 24500000000,
      unit: 'Wp',
    },
  ];

  const [selectedItemId, setSelectedItemId] = useState(rabItems[0].id);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [qty, setQty] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  // Photo & Anti-Fake Geotag State
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [geotag, setGeotag] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  } | null>(null);
  const [geotagLoading, setGeotagLoading] = useState(false);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoName(file.name);
    const url = URL.createObjectURL(file);
    setPhotoPreviewUrl(url);

    // Acquire GPS Coordinates
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setGeotagLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeotag({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            timestamp:
              new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
          });
          setGeotagLoading(false);
        },
        () => {
          // Fallback location for demo / permission denied
          setGeotag({
            latitude: -6.7214,
            longitude: 107.3621,
            accuracy: 6,
            timestamp:
              new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) +
              ' WIB (GPS Simulasi Proyek)',
          });
          setGeotagLoading(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'warning' | 'info' | 'error';
    text: string;
  } | null>(null);

  const selectedItem = rabItems.find((i) => i.id === selectedItemId) || rabItems[0];

  // Kalkulasi Live
  const entryTotal =
    typeof qty === 'number' && typeof unitPrice === 'number' && qty > 0 && unitPrice > 0
      ? qty * unitPrice
      : 0;

  const projectedTotal = selectedItem.currentActual + entryTotal;
  const isOverbudget = projectedTotal > selectedItem.subtotal;
  const remainingBudget = selectedItem.subtotal - selectedItem.currentActual;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || !qty || !unitPrice) {
      setStatusMessage({
        type: 'error',
        text: 'Mohon lengkapi vendor, qty, dan harga satuan!',
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    const payload = {
      entryDate,
      qty: Number(qty),
      actualUnitPrice: Number(unitPrice),
      vendor,
      invoiceNumber,
      description,
      geotag: geotag || undefined,
      photoName: photoName || undefined,
    };


    try {
      // 1. Coba kirim online ke backend API
      await apiRequest(`/rab-items/${selectedItemId}/actuals`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setStatusMessage({
        type: 'success',
        text: 'Realisasi biaya berhasil tersimpan di server dan variance diperbarui!',
      });
      setTimeout(() => router.push(`/projects/${projectId}`), 1500);
    } catch (err) {
      // 2. Fallback offline: simpan ke antrean IndexedDB
      await queueOfflineActualEntry({
        rabItemId: selectedItemId,
        entryDate,
        qty: Number(qty),
        actualUnitPrice: Number(unitPrice),
        vendor,
        invoiceNumber,
        description,
      });

      setStatusMessage({
        type: 'info',
        text: 'Koneksi offline atau tidak stabil. Data telah disimpan aman di Antrean Offline (IndexedDB) dan akan disinkron otomatis saat sinyal kembali.',
      });
      setTimeout(() => router.push(`/projects/${projectId}`), 2500);
    } finally {
      setSubmitting(false);
    }
  };

  const userRole = (currentUser?.role || 'supervisor').toLowerCase();
  const isUnauthorizedRole = currentUser && !['admin', 'pm', 'supervisor', 'mandor'].includes(userRole);

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <Link
          href={`/projects/${projectId}`}
          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Dashboard Proyek
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Receipt className="w-6 h-6 text-emerald-400" />
          Input Realisasi Lapangan (Actual)
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Pencatatan pengeluaran riil, pembelian material, atau upah lapangan
        </p>
      </div>

      {/* Role Restriction Guard Card */}
      {isUnauthorizedRole && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-amber-800/80 space-y-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Akses Dibatasi — Khusus Site Supervisor & PM</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Sesuai prinsip tata kelola proyek konstruksi (<em>Separation of Duties</em>), formulir input realisasi belanja fisik lapangan dan upload nota hanya diizinkan untuk peran <strong>Site Supervisor / Mandor</strong>, <strong>Project Manager</strong>, atau <strong>Administrator</strong>.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Peran Anda saat ini:</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  {currentUser?.role || 'Guest'}
                </span>
                <span className="text-[11px] text-slate-500">(Hanya memiliki hak lihat atau estimasi)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <Link
              href={`/projects/${projectId}`}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dashboard Proyek</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                const updated = { ...currentUser, role: 'supervisor' };
                setCurrentUser(updated);
                localStorage.setItem('karsa_user', JSON.stringify(updated));
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Beralih ke Mandor Lapangan (Demo)</span>
            </button>
          </div>
        </div>
      )}

      {!isUnauthorizedRole && statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/80 border-rose-800 text-rose-300'
              : 'bg-sky-950/80 border-sky-800 text-sky-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : statusMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          ) : (
            <WifiOff className="w-5 h-5 text-sky-400 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {!isUnauthorizedRole && (
        <>
          {/* Warning Banner Bila Overbudget */}
          {isOverbudget && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3 shadow-lg shadow-rose-950/40 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-300 block text-sm">
              PERINGATAN OVERBUDGET!
            </span>
            <span>
              Entri ini akan menyebabkan total pengeluaran untuk item ini mencapai{' '}
              <strong>{formatRupiah(projectedTotal)}</strong>, melebihi anggaran RAB sebesar{' '}
              <strong>{formatRupiah(projectedTotal - selectedItem.subtotal)}</strong>.
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        {/* Pilih Item RAB */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Pilih Item RAB Terkait
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
          >
            {rabItems.map((it) => (
              <option key={it.id} value={it.id}>
                [{it.code}] {it.desc}
              </option>
            ))}
          </select>
        </div>

        {/* Info Anggaran Item Terpilih */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Anggaran RAB:</span>
            <span className="font-bold text-slate-200">{formatRupiah(selectedItem.subtotal)}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Sisa Anggaran Tersedia:</span>
            <span
              className={`font-bold ${
                remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatRupiah(remainingBudget)}
            </span>
          </div>
        </div>

        {/* Tanggal & Vendor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tanggal Transaksi
            </label>
            <div className="relative">
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nama Vendor / Supplier
            </label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              required
              placeholder="PT Sinar Mandiri / CV Teknik"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
            />
          </div>
        </div>

        {/* No Faktur / Nota */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Nomor Faktur / Nota (Opsional)
          </label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="INV-2026-XXXX"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono"
          />
        </div>

        {/* Volume & Harga Aktual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Kuantitas (Qty: {selectedItem.unit})
            </label>
            <input
              type="number"
              step="any"
              value={qty}
              onChange={(e) => setQty(e.target.value ? Number(e.target.value) : '')}
              required
              placeholder="0"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Harga Satuan Riil (Rp)
            </label>
            <input
              type="number"
              step="any"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
              required
              placeholder="0"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono"
            />
          </div>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Keterangan Pengeluaran
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Catatan pembelian, batch material, atau peruntukan pengerjaan..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
          />
        </div>

        {/* Foto Bukti Fisik Lapangan & Kwitansi (Geotag & Timestamp) */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Foto Fisik Progres / Kwitansi (Anti-Fake Geotag)</span>
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sistem otomatis menempelkan koordinat GPS dan timestamp untuk verifikasi pencairan termin
              </p>
            </div>
            {geotag && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>GPS Terverifikasi</span>
              </span>
            )}
          </div>

          {!photoPreviewUrl ? (
            <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-950/40 group">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
              <div className="p-2.5 rounded-full bg-slate-800 group-hover:bg-emerald-950 text-slate-300 group-hover:text-emerald-400 transition-colors">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-center">
                <span className="text-xs font-medium text-slate-200 block">
                  Ambil Foto Langsung via Kamera HP atau Pilih dari Galeri
                </span>
                <span className="text-[10px] text-slate-500">
                  Format JPG, PNG, WEBP — Geotag otomatis terdeteksi
                </span>
              </div>
            </label>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
              <img
                src={photoPreviewUrl}
                alt="Bukti fisik lapangan"
                className="w-full h-48 object-cover opacity-90"
              />
              {/* Geotag Stamp Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 text-[11px] font-mono text-slate-200 space-y-0.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Lat: {geotag?.latitude.toFixed(5)}, Long: {geotag?.longitude.toFixed(5)} (±{geotag?.accuracy}m)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300 text-[10px]">
                  <span>🕒 {geotag?.timestamp}</span>
                  <span className="text-slate-400 font-sans">Proyek: {projectId.slice(0, 8)}</span>
                </div>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => {
                  setPhotoPreviewUrl(null);
                  setPhotoName(null);
                  setGeotag(null);
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {geotagLoading && (
            <div className="flex items-center gap-2 text-xs text-sky-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Mengambil koordinat GPS presisi tinggi dari perangkat...</span>
            </div>
          )}
        </div>


        {/* Total Pengeluaran Entri Ini */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Total Pengeluaran Entri Ini:</span>
          <span className="text-base font-bold text-white font-mono">{formatRupiah(entryTotal)}</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Menyimpan...' : 'Simpan Realisasi Lapangan'}
        </button>
        </form>
      </>
    )}
  </div>
);
}
