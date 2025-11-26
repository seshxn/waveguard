FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (iw for Wi-Fi)
RUN apt-get update && apt-get install -y \
    iw \
    wireless-tools \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Copy configuration
COPY pyproject.toml poetry.lock* ./

# Disable virtualenv creation
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root

# Copy application code
COPY . .

# Run command
CMD ["python", "-m", "src.main"]
