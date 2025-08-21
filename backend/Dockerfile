# FROM python:3.11-slim

# WORKDIR /app
# COPY requirements.txt ./
# RUN pip install --no-cache-dir -r requirements.txt

# COPY app ./app
# COPY cert.pem key.pem /app/

# # Run FastAPI with HTTPS
# CMD uvicorn app.main:app --host 0.0.0.0 --port 8000 \
#     --ssl-keyfile=key.pem --ssl-certfile=cert.pem



# Use Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY app ./app

# Copy SSL certificates
COPY cert.pem key.pem ./

# Run backend with HTTPS
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
