# 04 — Modul & Fitur Aplikasi

## 1. RAB Builder
- Form tambah item pekerjaan (kategori, deskripsi, volume, satuan, harga satuan)
- AI-assisted search harga satuan saat mengetik deskripsi item (lihat 05-implementasi-ai §1)
- Kalkulasi subtotal & total RAB otomatis
- Simpan sebagai draft atau ajukan langsung untuk approval

## 2. Approval Workflow
- Daftar RAB pending untuk role Approver
- Approve / reject dengan catatan wajib bila reject
- Notifikasi ke Estimator/PM saat status berubah
- Versioning: RAB yang sudah approved lalu direvisi membuat versi baru, versi lama tetap tersimpan untuk histori

## 3. Actual Input
- Pilih item RAB terkait, isi tanggal, qty, harga aktual, vendor
- Upload foto bukti — opsional diproses AI OCR untuk auto-isi field (lihat 05-implementasi-ai §5)
- Indikator langsung: sisa anggaran item tersebut setelah entri ini disimpan
- Riwayat entri per item (untuk audit pembelian bertahap)

## 4. Monitoring Dashboard
- Ringkasan: Total RAB, Realisasi, Varian, Progres fisik
- Breakdown RAB vs realisasi per kategori (bar/progress)
- Daftar alert dari AI (overbudget, keterlambatan) — lihat 05-implementasi-ai §2
- S-curve rencana vs realisasi dari waktu ke waktu

## 5. Manpower Tracker
- Input target headcount per tim per tahapan pekerjaan
- Input realisasi headcount harian dari Site Supervisor
- Rekomendasi AI bila ada gap signifikan (mis. "tim instalasi kurang 4 orang dari target")

## 6. AI Assistant (chat)
- Antarmuka chat di dalam dashboard proyek
- Jawaban grounded ke data proyek yang sedang dibuka (RAG — lihat 05-implementasi-ai §4)
- Riwayat percakapan tersimpan per proyek untuk kontinuitas

## 7. Reporting
- Laporan mingguan/bulanan otomatis (PDF/export)
- Ringkasan naratif dari AI di bagian awal laporan, diikuti data detail
- Riwayat laporan sebelumnya dapat diakses kembali

## 8. Pemetaan ke Desain Layar (mockup awal)
- Dashboard monitoring → mockup "PLTS Cianjur 5MW" dengan metric cards & breakdown kategori
- RAB Builder → mockup "Buat RAB baru" dengan daftar item & total
- Actual Input → mockup "Input realisasi" dengan warning otomatis saat item over budget
