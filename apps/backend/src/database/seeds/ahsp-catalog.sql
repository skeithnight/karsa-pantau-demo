-- Seed Data: Katalog AHSP Standar Nasional (PUPR & SNI) untuk General EPC & Konstruksi
INSERT INTO rab_item_history (id, item_code, work_package, category, description, unit, unit_price, recorded_at)
VALUES
  (gen_random_uuid(), 'CIV-SNI-01', 'CIVIL', 'upah', 'Galian Tanah Biasa Kedalaman 1-2 Meter (Standar PUPR)', 'm3', 85000.00, now()),
  (gen_random_uuid(), 'CIV-SNI-02', 'CIVIL', 'material', 'Urugan Pasir Bawah Pondasi & Lantai Padat', 'm3', 295000.00, now()),
  (gen_random_uuid(), 'CIV-SNI-03', 'CIVIL', 'material', 'Beton Ready Mix Mutu K-250 / fc 20 MPa Cor di Tempat', 'm3', 1050000.00, now()),
  (gen_random_uuid(), 'CIV-SNI-04', 'CIVIL', 'material', 'Beton Ready Mix Mutu K-300 / fc 25 MPa Struktur Kolom & Balok', 'm3', 1150000.00, now()),
  (gen_random_uuid(), 'CIV-SNI-05', 'CIVIL', 'material', 'Pembesian Besi Beton Ulir BJTD-40 D10 s/d D25 Terpasang', 'kg', 16800.00, now()),
  (gen_random_uuid(), 'CIV-SNI-06', 'CIVIL', 'material', 'Pasang Bekisting Balok, Kolom & Lantai Kayu Meranti / Multiplex', 'm2', 235000.00, now()),
  (gen_random_uuid(), 'CIV-STR-01', 'CIVIL', 'material', 'Struktur Baja Profil WF / H-Beam Fabrikasi & Erection Crane', 'kg', 34500.00, now()),
  (gen_random_uuid(), 'ARC-SNI-01', 'CIVIL', 'material', 'Pasangan Dinding Bata Ringan Hebel Tebal 10cm + Perekat Mortar', 'm2', 145000.00, now()),
  (gen_random_uuid(), 'ARC-SNI-02', 'CIVIL', 'material', 'Plesteran Dinding Campuran 1:4 Tebal 15mm & Acian Halus', 'm2', 68000.00, now()),
  (gen_random_uuid(), 'ARC-SNI-03', 'CIVIL', 'material', 'Pengecatan Dinding Eksterior / Interior Tahan Cuaca Weathercoat', 'm2', 42000.00, now()),
  (gen_random_uuid(), 'EL-SNI-01', 'ELECTRICAL_AC', 'material', 'Kabel Power NYY 4x16 mm2 Supreme / Kabelmetal SPLN', 'meter', 145000.00, now()),
  (gen_random_uuid(), 'EL-SNI-02', 'ELECTRICAL_AC', 'material', 'Kabel Instalasi Penerangan NYM 3x2.5 mm2 dalam Conduit PVC', 'meter', 24000.00, now()),
  (gen_random_uuid(), 'EL-PV-01', 'ELECTRICAL_DC', 'material', 'Modul Surya PV Tier-1 Monokristalin Bifacial 550Wp', 'unit', 1650000.00, now()),
  (gen_random_uuid(), 'EL-PV-02', 'ELECTRICAL_AC', 'alat', 'Inverter String On-Grid 50 kW 3-Phase Smart Grid Support', 'unit', 62000000.00, now()),
  (gen_random_uuid(), 'MEP-SNI-01', 'CIVIL', 'material', 'Pipa Air Bersih PVC Kelas AW Diameter 2 Inch Wavin / Rucika', 'meter', 48000.00, now()),
  (gen_random_uuid(), 'MEP-SNI-02', 'CIVIL', 'material', 'Pipa Tekan HDPE PN-10 Diameter 63mm Saluran Distribusi', 'meter', 65000.00, now()),
  (gen_random_uuid(), 'LAB-SNI-01', 'CIVIL', 'upah', 'Upah Tukang Batu / Tukang Besi / Tukang Kayu Berpengalaman', 'mandays', 180000.00, now()),
  (gen_random_uuid(), 'LAB-SNI-02', 'CIVIL', 'upah', 'Upah Mandor Lapangan / Site Inspector', 'mandays', 220000.00, now()),
  (gen_random_uuid(), 'EQP-SNI-01', 'CIVIL', 'alat', 'Sewa Excavator Standard 0.8 m3 + Bahan Bakar Solar & Operator', 'jam', 450000.00, now()),
  (gen_random_uuid(), 'EQP-SNI-02', 'CIVIL', 'alat', 'Sewa Mobile Crane 25 Ton Erection Konstruksi & Asuransi Alat', 'hari', 8500000.00, now())
ON CONFLICT DO NOTHING;
