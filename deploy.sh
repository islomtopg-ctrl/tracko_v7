#!/bin/bash
set -e
echo "=== Tracko Deploy ==="
sudo apt-get update -qq
sudo apt-get install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx
APP_DIR="/opt/tracko"
sudo mkdir -p $APP_DIR && sudo chown $USER:$USER $APP_DIR
cp -r . $APP_DIR/ && cd $APP_DIR
python3 -m venv venv && source venv/bin/activate
pip install -q -r requirements.txt gunicorn
if [ ! -f .env ]; then
  echo "SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')" > .env
  echo "PORT=8000" >> .env
  echo "HOST=127.0.0.1" >> .env
  echo "FLASK_ENV=production" >> .env
  echo "SECURE_COOKIES=True" >> .env
fi
echo "Done. Run: sudo certbot --nginx -d yourdomain.com"
