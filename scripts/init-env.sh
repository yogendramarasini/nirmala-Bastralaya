#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

if [[ -e .env ]]; then
  echo ".env already exists; refusing to overwrite it." >&2
  exit 1
fi

DB_PASSWORD="$(openssl rand -hex 32)"
AUTH_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
ADMIN_PASSWORD="Nb!$(openssl rand -hex 18)"
ADMIN_EMAIL="admin@nirmalavastralaya.com.np"

cat > .env <<EOF
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@localhost:5432/nirmala_bastralaya"
POSTGRES_PASSWORD="${DB_PASSWORD}"
NEXTAUTH_URL="https://nirmalavastralaya.com.np"
NEXTAUTH_SECRET="${AUTH_SECRET}"
ADMIN_EMAIL="${ADMIN_EMAIL}"
ADMIN_PASSWORD="${ADMIN_PASSWORD}"
ADMIN_TOTP_SECRET=""
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="nirmalavastralya@gmail.com"
SMTP_PASS=""
SMTP_FROM="Nirmala Vastralaya <nirmalavastralya@gmail.com>"
NEXT_PUBLIC_APP_URL="https://nirmalavastralaya.com.np"
NEXT_PUBLIC_SITE_NAME="Nirmala Vastralaya"
UPLOAD_STORAGE_PATH="/app/uploads-private"
MAX_FILE_SIZE="4194304"
EOF

chmod 600 .env
echo "Secure environment created."
echo "Admin email: ${ADMIN_EMAIL}"
echo "Admin password: ${ADMIN_PASSWORD}"
echo "Save this password now; it is not displayed again."
