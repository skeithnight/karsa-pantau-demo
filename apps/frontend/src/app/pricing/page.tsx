'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Zap, 
  Sparkles, 
  Building2, 
  Shield, 
  ArrowRight, 
  MessageSquare, 
  CheckCircle2, 
  Send,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';

export default function PricingPage() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    company: '',
    email: '',
    expectedBudget: '1-3jt',
    notes: '',
  });

  const plans = [
    {
      code: 'TRIAL',
      name: 'Free Trial',
      tierLabel: 'Pilot Partner Program',
      description: 'Akses penuh evaluasi untuk menguji sistem budgeting & Kurva S Karsa Pantau pada proyek nyata Anda.',
      priceDisplay: 'Rp 0',
      priceSubtext: 'Gratis selama masa evaluasi Beta',
      badge: 'Coba Gratis',
      features: [
        '1 Proyek Konstruksi Riil',
        '3 Pengguna (PM, Estimator, Lapangan)',
        '50 Ekstraksi Struk OCR / Bulan',
        'Kalkulator EVM & Kurva S Otomatis',
        'Akses Aplikasi Lapangan PWA Offline',
      ],
      ctaText: 'Mulai Free Trial 14 Hari',
      ctaHref: '/register?plan=TRIAL',
      isFeedback: false,
      popular: false,
    },
    {
      code: 'STARTER',
      name: 'Starter EPC',
      tierLabel: 'Co-Creation / Design Partner',
      description: 'Kapasitas fleksibel untuk kontraktor umum, spesialis sipil, MEP, dan energi dengan multi-proyek.',
      priceDisplay: 'TBA',
      priceSubtext: 'To Be Announced (Dalam Diskusi Klien)',
      badge: 'Rekomendasi Kontraktor',
      features: [
        'Hingga 5 Proyek Aktif Simultan',
        '10 Pengguna Lapangan & Kantor',
        '300 Ekstraksi Struk OCR / Bulan',
        'Deteksi Anomali Biaya Real-Time',
        'Ekspor Laporan PDF Direksi & Excel',
        'Prioritas Fitur Sesuai Masukan Anda',
      ],
      ctaText: 'Beri Masukan Harga / Request Akses',
      ctaHref: '#',
      isFeedback: true,
      popular: true,
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise EPC',
      tierLabel: 'General Contractor & Konsorsium',
      description: 'Dukungan khusus konsorsium kontraktor skala besar dengan integrasi ERP custom & AI throughput tinggi.',
      priceDisplay: 'Konsultasi',
      priceSubtext: 'Custom Sesuai Kebutuhan',
      badge: 'Skala Korporat',
      features: [
        'Unlimited Proyek & Anggota Tim',
        'Dedicated Throughput AI Enterprise',
        'Kustom Master AHSP Perusahaan',
        'Opsi On-Premise / Private Cloud',
        'SLA 99.9% & Dedicated Account Manager',
      ],
      ctaText: 'Hubungi Tim Pengembang',
      ctaHref: 'mailto:support@karsapantau.com?subject=Inquiry%20Enterprise%20Karsa%20Pantau',
      isFeedback: false,
      popular: false,
    },
  ];

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSubmitted(false);
      setFeedbackData({
        name: '',
        company: '',
        email: '',
        expectedBudget: '1-3jt',
        notes: '',
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Title & Early Adopter Explainer */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-xs font-semibold text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Program Pilot Partner & Co-Creation EPC</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Paket Berlangganan Tahap Awal
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Karsa Pantau sedang dalam tahap validasi pilot bersama praktisi kontraktor EPC & konstruksi. 
          Kami menyediakan <strong>Free Trial</strong> untuk evaluasi langsung, dan membuka program 
          <strong> Starter EPC</strong> dengan harga yang disesuaikan dari masukan Anda.
        </p>
      </div>

      {/* Plan Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.code}
            className={`rounded-3xl p-8 border flex flex-col justify-between transition-all relative ${
              plan.popular
                ? 'bg-slate-900/90 border-2 border-sky-500 shadow-2xl shadow-sky-500/10'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                Paling Diminati Kontraktor
              </div>
            )}

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  {plan.tierLabel}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">{plan.name}</h2>
                <p className="text-xs text-slate-400 mt-2 min-h-[36px]">{plan.description}</p>
              </div>

              <div className="pt-2">
                <div className="text-4xl font-black text-white flex items-baseline gap-1">
                  <span className={plan.code === 'STARTER' ? 'text-amber-400' : ''}>
                    {plan.priceDisplay}
                  </span>
                </div>
                <span className="text-xs text-slate-400 block mt-1">{plan.priceSubtext}</span>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Fitur & Kapasitas:
                </span>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              {plan.isFeedback ? (
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20 text-center transition-all cursor-pointer block"
                >
                  {plan.ctaText} &rarr;
                </button>
              ) : (
                <Link
                  href={plan.ctaHref}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-center transition-all block ${
                    plan.popular
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {plan.ctaText} &rarr;
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Banner Ajakan Masukan Klien */}
      <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-amber-950/40 border border-sky-800/40 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">
          Ingin Menentukan Fitur & Skema Biaya yang Cocok untuk Proyek Anda?
        </h3>
        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          Kami mendengarkan langsung kebutuhan para kontraktor & pengembang proyek di Indonesia. Sampaikan ekspektasi harga 
          dan fitur prioritas Anda untuk mendapatkan status prioritas serta diskon khusus saat rilis publik.
        </p>
        <button
          type="button"
          onClick={() => setShowFeedbackModal(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Isi Kuesioner Masukan Klien (1 Menit)</span>
        </button>
      </div>

      {/* Client Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Masukan Klien Kontraktor & EPC</h3>
                  <p className="text-xs text-slate-400">Bantu kami merancang harga & kapasitas ideal.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">Terima Kasih Banyak!</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Masukan Anda sudah kami terima dan akan dipertimbangkan oleh tim produk Karsa Pantau.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hendra Wijaya"
                      value={feedbackData.name}
                      onChange={(e) => setFeedbackData({ ...feedbackData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nama Perusahaan / EPC</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PT Surya Cemerlang"
                      value={feedbackData.company}
                      onChange={(e) => setFeedbackData({ ...feedbackData, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Resmi / WhatsApp</label>
                  <input
                    type="email"
                    required
                    placeholder="hendra@suryacemerlang.id"
                    value={feedbackData.email}
                    onChange={(e) => setFeedbackData({ ...feedbackData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Berapa ekspektasi biaya langganan bulanan yang adil bagi perusahaan Anda?
                  </label>
                  <select
                    value={feedbackData.expectedBudget}
                    onChange={(e) => setFeedbackData({ ...feedbackData, expectedBudget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="under_1jt">&lt; Rp 1.000.000 / bulan</option>
                    <option value="1-3jt">Rp 1.000.000 – Rp 3.000.000 / bulan</option>
                    <option value="3-5jt">Rp 3.000.000 – Rp 5.000.000 / bulan</option>
                    <option value="above_5jt">&gt; Rp 5.000.000 / bulan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Fitur yang paling penting untuk kebutuhan proyek konstruksi & EPC Anda:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Butuh integrasi Kurva S mingguan, monitoring realisasi kuitansi lapangan, dan laporan progress ke Direksi..."
                    value={feedbackData.notes}
                    onChange={(e) => setFeedbackData({ ...feedbackData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Masukan Klien</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
