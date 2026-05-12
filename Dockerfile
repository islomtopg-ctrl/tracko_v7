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
RUN mkdir -p /app/static/photos && chmod 777 /app/static/photos

EXPOSE 8000

# Run with Gunicorn instead of Flask development server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--threads", "2", "--timeout", "60", "app:app"]
