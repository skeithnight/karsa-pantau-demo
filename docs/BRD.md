# BRD — Business Requirements Document

## 1. Latar Belakang

Proyek pembangunan PLTS saat ini mengelola RAB dan realisasi biaya secara manual (spreadsheet/laporan terpisah). Ini menyebabkan keterlambatan deteksi overbudget, kesulitan memantau kebutuhan tenaga kerja real-time, dan tidak ada histori harga terpusat untuk estimasi proyek berikutnya.

## 2. Masalah yang Dipecahkan

- Tidak ada visibilitas real-time antara RAB dan realisasi biaya di lapangan
- Deteksi overbudget baru diketahui saat laporan periodik, bukan saat kejadian
- Estimasi RAB proyek baru tidak memanfaatkan data harga dari proyek sebelumnya
- Pemantauan kebutuhan tenaga kerja per tahapan pekerjaan tidak terstruktur

## 3. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Direktur/Approver | Kontrol anggaran, keputusan approval RAB |
| Project Manager | Visibilitas status proyek, pengambilan keputusan cepat |
| Estimator | Kecepatan & akurasi penyusunan RAB |
| Site Supervisor | Kemudahan input data lapangan |

## 4. Tujuan Bisnis

- Mengurangi selisih (overrun) biaya proyek lewat deteksi dini
- Mempercepat proses penyusunan RAB dengan data histori harga
- Meningkatkan akurasi perencanaan tenaga kerja
- Membangun basis data historis proyek untuk estimasi yang makin akurat dari waktu ke waktu

## 5. Metrik Keberhasilan (KPI)

- Waktu penyusunan RAB berkurang (dibandingkan proses manual sebelumnya)
- Waktu deteksi overbudget: dari "diketahui saat laporan bulanan" menjadi "real-time/harian"
- Tingkat akurasi estimasi RAB terhadap realisasi akhir (variance %) menurun dari proyek ke proyek
- Adopsi: persentase proyek yang menggunakan sistem ini dibanding metode manual

## 6. Batasan & Asumsi

- Sistem digunakan internal, tidak untuk klien eksternal di fase awal
- Data harga historis diinput manual di awal (migrasi dari spreadsheet lama)
- Ketergantungan pada koneksi internet untuk fitur AI (fallback manual bila offline — lihat 06-roadmap-dan-nonfungsional)
