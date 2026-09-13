# SETUP.md — Setup & Deployment Guide (Docker & Kubernetes Pods)

## 1. Prasyarat

- Node.js LTS (>= v20), pnpm (>= v9)
- Docker & Docker Compose (untuk dev lokal ringkas)
- Kubernetes CLI (`kubectl`) & Cluster Lokal (opsional: `k3d`, `minikube`, atau `kind`)
- Akun Provider AI:
  - Anthropic API Key (Claude 3.5 Sonnet/Haiku)
  - OpenAI API Key (untuk `text-embedding-3-small` 1536 dim)

---

## 2. Struktur Konfigurasi & Secrets

### Backend (`.env` / Kubernetes Secret `karsa-secrets`):
```bash
# Database & Cache
DATABASE_URL=postgresql://karsa_user:karsa_secret_pass@karsa-postgres-svc:5432/karsa_db?sslmode=disable
REDIS_URL=redis://karsa-redis-svc:6379

# Auth Security
JWT_SECRET=super_secret_jwt_access_key_min_32_chars
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_min_32_chars

# S3 / MinIO Object Storage
OBJECT_STORAGE_ENDPOINT=http://karsa-minio-svc:9000
OBJECT_STORAGE_BUCKET=karsa-pantau-receipts
OBJECT_STORAGE_KEY=minio_admin_user
OBJECT_STORAGE_SECRET=minio_admin_password
OBJECT_STORAGE_USE_SSL=false

# 9Router AI Gateway Pod (Internal ClusterIP)
NINE_ROUTER_BASE_URL=http://karsa-9router-svc:20128/v1
NINE_ROUTER_API_KEY=nr-internal-cluster-key

# Web Push Notifications (VAPID)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@karsapantau.id
```

### Frontend (`.env.local` / Kubernetes ConfigMap):
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
```

> [!NOTE]
> Kredensial provider upstream (Anthropic API Key & OpenAI API Key) **hanya didaftarkan di 9Router**, tidak pernah dibagikan ke Backend maupun Frontend.

---

## 3. Topologi Layanan Lokal (Docker Compose)

File `docker-compose.yml` memetakan layanan pod secara 1-to-1:
- `karsa-postgres`: PostgreSQL 16 dengan pgvector (`pgvector/pgvector:pg16`)
- `karsa-redis`: Redis 7 Alpine dengan mode AOF
- `karsa-minio`: MinIO Server + create bucket hook
- `karsa-9router`: 9Router container (port 20128)
- `karsa-backend-api`: NestJS API container (port 3001)
- `karsa-worker`: NestJS BullMQ background runner
- `karsa-frontend`: Next.js PWA container (port 3000)

Langkah eksekusi cepat dev lokal:
```bash
# 1. Start core stateful services & AI gateway
docker compose up -d postgres redis minio 9router

# 2. Setup database schema & vector extension
pnpm --filter backend run migration:run
pnpm --filter backend run seed

# 3. Jalankan service secara lokal atau lewat compose
docker compose up -d backend worker frontend
```

---

## 4. Konfigurasi 9Router (Dual-Upstream Setup)

1. Buka dashboard 9Router di browser: `http://localhost:20128/dashboard`.
2. Login dan ganti kredensial default administrator.
3. Di menu **Providers**:
   - Tambahkan Provider **Anthropic** dengan API key `sk-ant-...`.
   - Tambahkan Provider **OpenAI** dengan API key `sk-proj-...` (khusus untuk routing embedding).
4. Di menu **Model Mappings / Combos**:
   - Buat routing alias `claude-3-5-sonnet` mengarah ke Anthropic Claude 3.5 Sonnet.
   - Buat routing alias `text-embedding-3-small` mengarah ke OpenAI Embedding (1536 dim).
5. Buat Client Access Token baru (`nr-...`) dan simpan ke `NINE_ROUTER_API_KEY`.

---

## 5. Deployment Kubernetes Pods (`k8s/`)

Struktur manifes Kubernetes di folder `k8s/`:
```
k8s/
├── 00-namespace.yaml
├── 01-configmap.yaml
├── 02-secrets.yaml
├── 03-network-policy.yaml
├── 10-postgres-statefulset.yaml
├── 11-redis-statefulset.yaml
├── 12-minio-statefulset.yaml
├── 20-9router-deployment.yaml
├── 21-backend-api-deployment.yaml
├── 22-worker-deployment.yaml
├── 23-frontend-deployment.yaml
└── 30-ingress.yaml
```

Langkah deployment ke cluster Kubernetes:
```bash
# 1. Terapkan namespace, config, secret, dan policy
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-configmap.yaml
kubectl apply -f k8s/02-secrets.yaml
kubectl apply -f k8s/03-network-policy.yaml

# 2. Terapkan stateful storage layer
kubectl apply -f k8s/10-postgres-statefulset.yaml
kubectl apply -f k8s/11-redis-statefulset.yaml
kubectl apply -f k8s/12-minio-statefulset.yaml

# Tunggu database siap
kubectl rollout status statefulset/karsa-postgres -n karsa-pantau

# 3. Terapkan AI gateway & workload pods
kubectl apply -f k8s/20-9router-deployment.yaml
kubectl apply -f k8s/21-backend-api-deployment.yaml
kubectl apply -f k8s/22-worker-deployment.yaml
kubectl apply -f k8s/23-frontend-deployment.yaml

# 4. Terapkan Ingress routing & TLS
kubectl apply -f k8s/30-ingress.yaml
```

---

## 6. Health Checks & Verification Pods

```bash
# Periksa status seluruh pod
kubectl get pods -n karsa-pantau -o wide

# Verifikasi liveness & readiness API
kubectl exec -it deployment/karsa-backend-api -n karsa-pantau -- curl http://localhost:3001/api/v1/health/readiness

# Periksa log isolasi AI Gateway
kubectl logs -f deployment/karsa-9router -n karsa-pantau
```
