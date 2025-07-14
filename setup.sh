#!/bin/bash

echo "🎵 BeatSync Video App Setup"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install Expo CLI globally
echo "📱 Installing Expo CLI..."
npm install -g @expo/cli

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Create assets directory if it doesn't exist
mkdir -p assets

# Check if Python 3 is installed (for backend)
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 is available: $(python3 --version)"
    
    # Set up backend
    echo "🐍 Setting up backend..."
    cd backend
    
    # Create virtual environment
    python3 -m venv venv
    source venv/bin/activate
    
    # Install backend dependencies
    pip install -r requirements.txt
    
    echo "✅ Backend dependencies installed"
    cd ..
else
    echo "⚠️  Python 3 not found. Backend setup skipped."
    echo "   Install Python 3 to run the video processing backend."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the BACKEND_URL in App.js with your backend server URL"
echo "2. Start the development server: npx expo start"
echo "3. For backend: cd backend && python app.py (or use Docker)"
echo ""
echo "For deployment instructions, see: README_DEPLOYMENT.md"