# 1. Base Image
FROM python:3.9-slim

# 2. System Dependencies
# FIX APPLIED: Replaced 'libgl1-mesa-glx' with 'libgl1' and added 'libglib2.0-0'
RUN apt-get update && apt-get install -y \
    cmake \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 3. Work Directory
WORKDIR /app

# 4. Install Python Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy Source Code
COPY . .

# 6. Expose Port
EXPOSE 8000

# 7. Startup Command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]