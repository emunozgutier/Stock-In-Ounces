FROM python:3.10-slim

WORKDIR /app

# Install git and openssh-client
RUN apt-get update && apt-get install -y git openssh-client && rm -rf /var/lib/apt/lists/*

# Configure Git to trust the workspace directory globally
RUN git config --global --add safe.directory '*'

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Entrypoint script for looping and pushing
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
