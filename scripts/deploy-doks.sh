#!/usr/bin/env bash
# ==============================================================================
# Karsa Pantau — Production Deployment Script for DigitalOcean Kubernetes (DOKS)
# ==============================================================================
set -euo pipefail

# Konfigurasi Default
REGION="${DO_REGION:-sgp1}"
CLUSTER_NAME="${DO_CLUSTER_NAME:-karsa-pantau-cluster}"
REGISTRY_NAME="${DO_REGISTRY_NAME:-karsa-registry}"
NAMESPACE="karsa-pantau"
VERSION_TAG="${VERSION_TAG:-v1.0.0}"

echo "================================================================"
echo "  🚀 Memulai Deployment Karsa Pantau ke DigitalOcean (DOKS)"
echo "  Region   : ${REGION}"
echo "  Cluster  : ${CLUSTER_NAME}"
echo "  Registry : ${REGISTRY_NAME}"
echo "  Tag      : ${VERSION_TAG}"
echo "================================================================"

# 1. Validasi Tools
for cmd in doctl kubectl docker; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "❌ Error: '$cmd' belum terinstal. Silakan pasang terlebih dahulu."
    exit 1
  fi
done

# 2. Verifikasi Autentikasi doctl
echo "🔍 Memeriksa autentikasi DigitalOcean (doctl)..."
doctl account get > /dev/null || {
  echo "❌ Error: doctl belum terautentikasi. Jalankan 'doctl auth init'."
  exit 1
}

# 3. Setup DigitalOcean Container Registry (DOCR)
echo "📦 Menyiapkan Container Registry: ${REGISTRY_NAME}..."
if ! doctl registry get "${REGISTRY_NAME}" &> /dev/null; then
  echo "✨ Membuat registry baru '${REGISTRY_NAME}'..."
  doctl registry create "${REGISTRY_NAME}" --subscription-tier basic
fi
doctl registry login

# 4. Build & Push Docker Images
BACKEND_IMAGE="registry.digitalocean.com/${REGISTRY_NAME}/backend-api:${VERSION_TAG}"
FRONTEND_IMAGE="registry.digitalocean.com/${REGISTRY_NAME}/frontend:${VERSION_TAG}"

echo "🔨 Building backend image: ${BACKEND_IMAGE}..."
docker build -t "${BACKEND_IMAGE}" -t "registry.digitalocean.com/${REGISTRY_NAME}/backend-api:latest" -f apps/backend/Dockerfile .

echo "🔨 Building frontend image: ${FRONTEND_IMAGE}..."
docker build -t "${FRONTEND_IMAGE}" -t "registry.digitalocean.com/${REGISTRY_NAME}/frontend:latest" -f apps/frontend/Dockerfile .

echo "⬆️ Pushing images ke DOCR..."
docker push "${BACKEND_IMAGE}"
docker push "registry.digitalocean.com/${REGISTRY_NAME}/backend-api:latest"
docker push "${FRONTEND_IMAGE}"
docker push "registry.digitalocean.com/${REGISTRY_NAME}/frontend:latest"

# 5. Verifikasi / Buat Cluster DOKS
echo "☸️ Memeriksa cluster DOKS '${CLUSTER_NAME}'..."
if ! doctl kubernetes cluster get "${CLUSTER_NAME}" &> /dev/null; then
  echo "✨ Membuat cluster DOKS baru di region ${REGION} (2 node pool s-4vcpu-8gb)..."
  doctl kubernetes cluster create "${CLUSTER_NAME}" \
    --region "${REGION}" \
    --version latest \
    --node-pool "name=karsa-workers;size=s-4vcpu-8gb;count=2;auto-scale=true;min-nodes=2;max-nodes=5"
fi

echo "🔌 Mengambil kubeconfig cluster..."
doctl kubernetes cluster kubeconfig save "${CLUSTER_NAME}"

# Integrasi DOCR secret ke K8s agar Pod bisa pull image privat
doctl registry kubernetes-manifest | kubectl apply -f -

# 6. Install Ingress-Nginx Controller & Cert-Manager jika belum ada
echo "🌐 Memeriksa Nginx Ingress Controller..."
if ! kubectl get namespace ingress-nginx &> /dev/null; then
  echo "✨ Memasang Ingress Nginx Controller untuk DigitalOcean..."
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/do/deploy.yaml
fi

echo "🔒 Memeriksa cert-manager..."
if ! kubectl get namespace cert-manager &> /dev/null; then
  echo "✨ Memasang cert-manager untuk otomatisasi SSL Let's Encrypt..."
  kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.4/cert-manager.yaml
  echo "Menunggu cert-manager webhook siap..."
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=webhook -n cert-manager --timeout=90s
fi

# 7. Terapkan Manifes Karsa Pantau
echo "📄 Menerapkan manifes Kubernetes..."
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-configmap.yaml

# Cek apakah secret karsa-secrets sudah dibuat
if ! kubectl get secret karsa-secrets -n "${NAMESPACE}" &> /dev/null; then
  echo "⚠️ PERINGATAN: Secret 'karsa-secrets' belum ada di namespace ${NAMESPACE}."
  echo "Menerapkan k8s/02-secrets-example.yaml sebagai placeholder. HARAP PERBARUI DENGAN KUNCI PRODUKSI ANDA!"
  kubectl apply -f k8s/02-secrets-example.yaml
fi

kubectl apply -f k8s/03-network-policy.yaml
kubectl apply -f k8s/31-cert-manager-issuer.yaml

# 8. Terapkan Stateful Storage
echo "💾 Menjalankan Storage StatefulSets (PostgreSQL, Redis, MinIO)..."
kubectl apply -f k8s/10-postgres-statefulset.yaml
kubectl apply -f k8s/11-redis-statefulset.yaml
kubectl apply -f k8s/12-minio-statefulset.yaml

echo "⏳ Menunggu database PostgreSQL siap..."
kubectl rollout status statefulset/karsa-postgres -n "${NAMESPACE}" --timeout=120s

# 9. Jalankan Database Migration Job
echo "🔄 Menjalankan migrasi skema database..."
kubectl delete job karsa-db-migration -n "${NAMESPACE}" --ignore-not-found=true
kubectl apply -f k8s/40-migration-job.yaml
kubectl wait --for=condition=complete job/karsa-db-migration -n "${NAMESPACE}" --timeout=120s || {
  echo "⚠️ Job migrasi belum selesai atau error. Cek logs dengan: kubectl logs job/karsa-db-migration -n ${NAMESPACE}"
}

# 10. Terapkan Deployments (AI Gateway, Backend API, Worker, Frontend)
echo "🚀 Menerapkan Workload Pods..."
# Update image di deployment ke image DOCR
kubectl set image -f k8s/21-backend-api-deployment.yaml backend-api="${BACKEND_IMAGE}" --local -o yaml | kubectl apply -f -
kubectl set image -f k8s/22-worker-deployment.yaml worker="${BACKEND_IMAGE}" --local -o yaml | kubectl apply -f -
kubectl set image -f k8s/23-frontend-deployment.yaml frontend="${FRONTEND_IMAGE}" --local -o yaml | kubectl apply -f -
kubectl apply -f k8s/20-9router-deployment.yaml
kubectl apply -f k8s/30-ingress.yaml

# 11. Status Rollout & Verifikasi
echo "⏳ Memverifikasi rollout status..."
kubectl rollout status deployment/karsa-backend-api -n "${NAMESPACE}" --timeout=180s
kubectl rollout status deployment/karsa-frontend -n "${NAMESPACE}" --timeout=180s

echo "================================================================"
echo "  ✅ Deployment ke DigitalOcean Berhasil Selesai!"
echo "================================================================"
echo ""
echo "Periksa external IP Load Balancer untuk konfigurasi DNS domain:"
kubectl get svc -n ingress-nginx ingress-nginx-controller
echo ""
echo "Status Pods:"
kubectl get pods -n "${NAMESPACE}" -o wide
