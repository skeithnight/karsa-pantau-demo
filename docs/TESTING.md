# Testing Strategy

## 1. Prinsip

Logic finansial (total RAB, variance, EVM) adalah bagian paling kritis — kesalahan di sini berdampak langsung ke keputusan bisnis. Bagian ini butuh coverage tertinggi dan tidak boleh bergantung pada AI (lihat 05-implementasi-ai.md §6 — AI tidak menghitung angka).

## 2. Unit Test

**Wajib 100% coverage untuk:**
- Kalkulasi subtotal item RAB (`volume × unitPrice`)
- Kalkulasi total RAB (sum semua item)
- Kalkulasi variance (`(realisasi - RAB) / RAB`)
- Kalkulasi EVM (PV, EV, AC, CPI, SPI, EAC — lihat 05-implementasi-ai.md §3)
- Validasi state transition RAB (`draft → submitted → approved/rejected`, tidak boleh loncat status)

**Tools:** Jest untuk backend (NestJS), React Testing Library untuk komponen frontend dengan logic (form kalkulasi real-time).

## 3. Integration Test

- Tiap endpoint di `API_SPEC.md` diuji dengan database test terpisah (bukan mock) untuk memastikan query & relasi benar
- Skenario wajib: RAB dengan status `draft` menolak request POST ke `actual_entries` (aturan bisnis di 01-ringkasan-dan-alur-bisnis.md)
- AI service (search, anomaly, chat) diuji dengan **mock response dari 9Router** — jangan panggil Claude asli di test suite, supaya test cepat, deterministik, dan tidak kena biaya token

## 4. End-to-End Test

Skenario kritis yang wajib punya E2E test (Playwright/Cypress):
1. Estimator buat RAB → submit → Approver approve → status berubah jadi `approved`
2. Site Supervisor input actual pada RAB yang `approved` → dashboard menampilkan variance ter-update
3. Input actual pada RAB berstatus `draft` → sistem menolak dengan error yang jelas
4. Approver reject RAB tanpa catatan → sistem menolak submit reject (validasi wajib catatan)

## 5. Testing Fitur AI

- **Unit:** fungsi pembentuk prompt (context builder untuk chat/anomaly) diuji terpisah dari pemanggilan Claude — pastikan context yang dikirim benar
- **Contract test:** pastikan format request ke 9Router sesuai OpenAI-compatible schema yang diharapkan
- **Manual/QA berkala:** kualitas jawaban AI (relevansi search, akurasi ringkasan anomali) dievaluasi manual secara periodik, bukan otomatis — simpan sample hasil di `ai_insights` untuk review

## 6. Non-Functional Testing

- **Performance:** dashboard harus render <2 detik untuk proyek dengan ≤200 item RAB (load test dengan data dummy sebesar itu)
- **Offline/PWA:** uji manual matrix — buat RAB saat offline → cek tersimpan di IndexedDB → online kembali → cek tersinkron ke server tanpa duplikasi
- **Security:** test RBAC — pastikan role Estimator tidak bisa memanggil endpoint approve/reject (403, bukan 500)

## 7. CI Gate

Pipeline CI wajib menjalankan: lint → unit test → integration test sebelum merge ke branch utama. E2E dijalankan di staging sebelum rilis ke production.
