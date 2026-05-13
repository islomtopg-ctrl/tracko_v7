FROM python:3.11-slim

# Install necessary system dependencies (e.g., for sqlite or crypto if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install python dependencies including gunicorn for production server
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application code
COPY . .

# Create volume mount points so they have the correct permissions
RUN mkdir -p /app/static/photos /app/static/signatures /app/logs /app/backups \
    && chmod 755 /app/static/photos /app/static/signatures /app/logs /app/backups

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--threads", "2", \
     "--timeout", "60", "--access-logfile", "/app/logs/access.log", \
     "--error-logfile", "/app/logs/error.log", "app:app"]
