FROM python:3.11-slim

WORKDIR /app

# System dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml ./
RUN pip install --no-cache-dir .

# Copy backend
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Render provides PORT automatically
ENV PYTHONUNBUFFERED=1

CMD ["sh", "-c", "python -m alembic upgrade head && uvicorn app.fastapi_server:app --host 0.0.0.0 --port ${PORT:-8001}"]
