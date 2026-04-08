FROM python:3.11-slim

# Set working directory to match the relative paths expected by serve.py
WORKDIR /app/ml-pipelines

# Install system dependencies if any are needed for pandas/scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create the models directory
RUN mkdir -p models

# Copy the rest of the ML service code
COPY . .

# Create the CSV directory expected by serve.py at the parent level
RUN mkdir -p /app/lighthouse_csv_v7

# Expose the default port
EXPOSE 5050

# Run the application using gunicorn for production readiness
CMD ["gunicorn", "--bind", "0.0.0.0:5050", "--workers", "2", "--timeout", "120", "serve:app"]