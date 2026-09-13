#!/usr/bin/env bash
# ==============================================================================
# Karsa Pantau — Automated Deployment Script for DigitalOcean Droplet
# ==============================================================================
set -euo pipefail

echo "================================================================"
echo "  🚀 Memulai Deployment Karsa Pantau di DigitalOcean Droplet"
echo "================================================================"

# 1. Pastikan script dijalankan di server Linux (Ubuntu/Debian) atau bash lokal
if [ "$(id -u)" -ne 0 ]; then
  echo "⚠️ Menjalankan tanpa root. Pastikan user Anda memiliki akses sudo/docker."
  SUDO="sudo"
else
  SUDO=""
fi

# 2. Setup 2GB Swap Memory (Krusial untuk stabilitas Droplet Budget 4GB saat build)
if [ ! -f /swapfile ] && command -v swapon &> /dev/null; then
  if ! swapon --show | grep -q "/swapfile"; then
    echo "💾 Menyiapkan 2GB Swap Memory untuk stabilitas..."
    $SUDO fallocate -l 2G /swapfile 2>/dev/null || $SUDO dd if=/dev/zero of=/swapfile bs=1M count=2048
    $SUDO chmod 600 /swapfile
    $SUDO mkswap /swapfile
    $SUDO swapon /swapfile
    grep -q "/swapfile" /etc/fstab || echo '/swapfile none swap sw 0 0' | $SUDO tee -a /etc/fstab > /dev/null
  fi
fi

# 3. Instalasi Docker & Docker Compose Plugin jika belum ada
if ! command -v docker &> /dev/null; then
  echo "📦 Menginstal Docker Engine..."
  curl -fsSL https://get.docker.com | sh
  $SUDO systemctl enable --now docker
fi

if ! docker compose version &> /dev/null; then
  echo "📦 Menginstal Docker Compose Plugin..."
  $SUDO apt update && $SUDO apt install -y docker-compose-plugin
fi

# 3. Konfigurasi UFW Firewall (Hanya Port 22 SSH, 80 HTTP, dan 443 HTTPS)
if command -v ufw &> /dev/null; then
  echo "🛡️ Mengamankan Droplet dengan UFW Firewall..."
  $SUDO ufw allow OpenSSH || $SUDO ufw allow 22/tcp
  $SUDO ufw allow 80/tcp
  $SUDO ufw allow 443/tcp
  $SUDO ufw --force enable || true
fi

# 4. Inisialisasi file .env produksi jika belum tersedia
if [ ! -f ".env" ]; then
  echo "⚙️ Membuat file .env produksi otomatis dari template..."
  cp .env.production.example .env

  # Generate random secure keys
  RANDOM_DB_PASS=$(openssl rand -hex 16)
  RANDOM_JWT_SECRET=$(openssl rand -hex 32)
  RANDOM_JWT_REFRESH=$(openssl rand -hex 32)
  RANDOM_MINIO_PASS=$(openssl rand -hex 16)

  sed -i "s/ganti_dengan_password_database_yang_kuat_dan_acak/${RANDOM_DB_PASS}/g" .env
  sed -i "s/isi_dengan_random_secret_minimal_32_karakter_untuk_access_token/${RANDOM_JWT_SECRET}/g" .env
  sed -i "s/isi_dengan_random_secret_minimal_32_karakter_untuk_refresh_token/${RANDOM_JWT_REFRESH}/g" .env
  sed -i "s/karsa_minio_admin_password_kuat/${RANDOM_MINIO_PASS}/g" .env
fi

# Jika domain diberikan sebagai argumen script (contoh: ./scripts/deploy-droplet.sh namadomain.com)
INPUT_DOMAIN="${1:-}"
if [ -n "$INPUT_DOMAIN" ]; then
  echo "🌐 Mengonfigurasi domain: ${INPUT_DOMAIN}..."
  sed -i "s/^DOMAIN=.*/DOMAIN=${INPUT_DOMAIN}/g" .env
  sed -i "s|^NEXT_PUBLIC_API_BASE_URL=.*|NEXT_PUBLIC_API_BASE_URL=https://${INPUT_DOMAIN}/api/v1|g" .env
fi

# 5. Build & Jalankan Seluruh Container Produksi
echo "🔨 Membangun & Menjalankan Kontainer Produksi..."
docker compose -f docker-compose.prod.yml down --remove-orphans || true
docker compose -f docker-compose.prod.yml up -d --build

# 6. Tunggu Database PostgreSQL Sehat
echo "⏳ Menunggu PostgreSQL siap..."
until docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U karsa_user -d karsa_db > /dev/null 2>&1; do
  sleep 2
  echo -n "."
done
echo " Siap!"

# 7. Eksekusi Migrasi Database Skema & Initial Seed
echo "🔄 Menjalankan migrasi skema database..."
docker compose -f docker-compose.prod.yml exec -T backend node apps/backend/dist/database/run-migration.js

echo "🌱 Menjalankan seeding data contoh (Demo roles & Cirata 50MW)..."
docker compose -f docker-compose.prod.yml exec -T backend node apps/backend/dist/database/seeds/initial-seed.js || true

# 8. Verifikasi Liveness Probe
echo "🩺 Memverifikasi status kesehatan backend..."
sleep 5
docker compose -f docker-compose.prod.yml exec -T backend wget -qO- http://localhost:3001/api/v1/health/liveness || {
  echo "⚠️ Peringatan: Health check API belum merespons. Periksa logs:"
  docker compose -f docker-compose.prod.yml logs --tail=20 backend
}

echo "================================================================"
echo "  ✅ Karsa Pantau Berhasil Berjalan di Droplet DigitalOcean!"
echo "================================================================"
echo ""
echo "Daftar Container Aktif:"
docker compose -f docker-compose.prod.yml ps
echo ""
echo "Langkah Terakhir:"
echo "1. Pastikan DNS A-Record domain Anda (misal app.karsapantau.id) telah diarahkan ke IP Droplet ini."
echo "2. Caddy akan otomatis menerbitkan sertifikat SSL HTTPS Let's Encrypt saat domain pertama kali diakses."
