import './globals.css';
import React from 'react';
import { Providers } from '../components/Providers';
import { Navigation } from '../components/Navigation';

export const metadata = {
  title: 'Karsa Pantau — Sistem Budgeting & Monitoring Proyek Konstruksi PLTS',
  description: 'Aplikasi Enterprise PWA untuk RAB, Realisasi Biaya, dan EVM Proyek Pembangkit Listrik Tenaga Surya',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        <Providers>
          <Navigation />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
            Karsa Pantau EPC PLTS &copy; {new Date().getFullYear()} — Enterprise Construction Intelligence
          </footer>
        </Providers>
      </body>
    </html>
  );
}
