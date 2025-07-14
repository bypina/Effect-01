FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libxrender1 \
    libxext6 \
    libsm6 \
    libice6 \
    libfontconfig1 \
    libxss1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the main processing script
COPY main.py .

# Copy backend code
COPY backend/ ./backend/

# Create necessary directories
RUN mkdir -p uploads processed

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=backend/app.py

# Expose port
EXPOSE 5000

# Change to backend directory and run the app
WORKDIR /app/backend
CMD ["python", "app.py"]