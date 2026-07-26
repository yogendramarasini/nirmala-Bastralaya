#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="nirmala_db_$DATE.sql.gz"
UPLOAD_FILENAME="nirmala_uploads_$DATE.tar.gz"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

echo "📦 Backing up database..."
cd "$PROJECT_DIR"
docker compose exec -T postgres pg_dump -U postgres nirmala_bastralaya | gzip > "$BACKUP_DIR/$FILENAME"

if [[ -d "$PROJECT_DIR/uploads-private" ]]; then
  tar -C "$PROJECT_DIR" -czf "$BACKUP_DIR/$UPLOAD_FILENAME" uploads-private
fi

echo "✅ Backup saved: $BACKUP_DIR/$FILENAME"

# Delete backups older than 30 days
find "$BACKUP_DIR" -type f \( -name "*.sql.gz" -o -name "*.tar.gz" \) -mtime +30 -delete
echo "🧹 Old backups cleaned up"
