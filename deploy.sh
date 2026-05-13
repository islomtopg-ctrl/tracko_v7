#!/bin/bash
set -e
echo "=== Tracko Deploy ==="

APP_DIR="/opt/tracko"
SERVICE="tracko"
PYTHON="python3"

# 1. System packages
sudo apt-get update -qq
sudo apt-get install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx

# 2. App directory
sudo mkdir -p $APP_DIR && sudo chown $USER:$USER $APP_DIR
rsync -a --exclude='.git' --exclude='__pycache__' --exclude='*.pyc' . $APP_DIR/
cd $APP_DIR

# 3. Virtualenv + deps
$PYTHON -m venv venv
source venv/bin/activate
pip install -q -r requirements.txt

# 4. Env file (only on first deploy)
if [ ! -f .env ]; then
  SECRET=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
  cat > .env <<EOF
SECRET_KEY=$SECRET
PORT=5000
HOST=127.0.0.1
SECURE_COOKIES=True
JWT_EXPIRY=43200
MAX_UPLOAD_MB=16
EOF
  echo "✅ .env создан с новым SECRET_KEY"
fi

# 5. Directories + permissions
mkdir -p logs backups static/photos static/signatures
chmod 755 logs backups static/photos static/signatures

# 6. systemd service
sudo cp tracko.service /etc/systemd/system/${SERVICE}.service
sudo sed -i "s|/opt/tracko|$APP_DIR|g" /etc/systemd/system/${SERVICE}.service
sudo sed -i "s|www-data|$USER|g" /etc/systemd/system/${SERVICE}.service
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE
sudo systemctl restart $SERVICE
echo "✅ Сервис запущен: sudo systemctl status $SERVICE"

# 7. Cron: бэкап БД каждые 6 часов
CRON_JOB="0 */6 * * * $PYTHON $APP_DIR/backup.py >> $APP_DIR/logs/backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v "backup.py"; echo "$CRON_JOB") | crontab -
echo "✅ Cron для бэкапа добавлен (каждые 6 часов)"

# 8. Nginx (если конфиг не настроен)
if [ ! -f /etc/nginx/sites-enabled/tracko ]; then
  echo "⚠️  Настройте Nginx вручную:"
  echo "   sudo cp $APP_DIR/nginx.conf /etc/nginx/sites-available/tracko"
  echo "   sudo ln -s /etc/nginx/sites-available/tracko /etc/nginx/sites-enabled/"
  echo "   sudo certbot --nginx -d your-domain.com"
fi

echo ""
echo "=== Деплой завершён ==="
echo "Статус: sudo systemctl status $SERVICE"
echo "Логи:   sudo journalctl -u $SERVICE -f"
