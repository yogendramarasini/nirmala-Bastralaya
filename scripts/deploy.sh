#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

if [[ ! -f .env ]]; then
  echo "Missing .env file. Copy .env.example to .env and configure it first." >&2
  exit 1
fi

docker compose config --quiet

mkdir -p uploads-private/{product,qr,payment,general} certbot_conf certbot_www backups
chmod 750 uploads-private backups

docker compose build --pull app migrate
docker compose up -d postgres
docker compose run --rm migrate
docker compose run --rm migrate node --import tsx prisma/seed.ts
docker compose up -d app

if [[ ! -f certbot_conf/live/nirmalavastralaya.com.np/fullchain.pem ]]; then
  docker run --rm -p 80:80 \
    -v "$PROJECT_DIR/certbot_conf:/etc/letsencrypt" \
    certbot/certbot certonly --standalone \
    -d nirmalavastralaya.com.np \
    -d www.nirmalavastralaya.com.np \
    --email nirmalavastralya@gmail.com \
    --agree-tos --no-eff-email
fi

docker compose up -d nginx
docker compose ps
