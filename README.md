# BeatSync Video - Complete Solution

Transform videos with beat-synchronized visual effects! This repository contains both the original Python processing script and a complete iOS/Android mobile app built with Expo.

## 🎵 What's Included

### Original Python Script (`main.py`)
- Beat-driven spawning of squares with ORB keypoints  
- LK optical-flow tracking with subtle jitter for organic motion  
- Optional ambient "noise" spawns so visuals never fall silent  
- Neighbor-link edges for a living graph aesthetic  
- Per-square color-inversion, random alphanumeric labels, vertical text option  

### Mobile App (iOS/Android)
- **Video Upload**: Select from gallery or record new videos (max 2 minutes)
- **Beat Processing**: Automatic beat detection and synchronized effects
- **iOS Integration**: Proper permissions and gallery saving
- **Beautiful UI**: Modern gradient design with loading animations
- **Cross-Platform**: Built with Expo for iOS and Android

### Backend API
- Flask server that handles video uploads
- Runs the Python processing script
- Serves processed videos for download
- Docker support for easy deployment

## 🚀 Quick Start

### 1. Mobile App Development

```bash
# Run the setup script
./setup.sh

# Start the Expo development server
npx expo start

# Scan QR code with Expo Go app on your phone
```

### 2. Backend (Choose one option)

**Option A: Docker (Recommended)**
```bash
docker-compose up --build
```

**Option B: Manual Setup**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. Original Script (CLI)
```bash
python main.py \
  --input your_video.mp4 \
  --output processed_video.mp4 \
  --pts-per-beat 20 \
  --ambient-rate 5.0
```

## 📱 Mobile App Features

- **Video Selection**: Choose from gallery or record new videos
- **Real-time Processing**: Upload, process, and download seamlessly  
- **iOS Permissions**: Proper camera and photo library access
- **Progress Tracking**: Visual feedback during processing
- **Gallery Integration**: Save directly to iOS Photos app
- **Error Handling**: Graceful error messages and recovery

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │───▶│   Flask API      │───▶│  main.py Script │
│  (Expo/React)   │    │   (Python)       │    │  (Processing)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
   iOS Gallery              File Storage            Video Processing
```

## 📝 Configuration

### Mobile App
Update `BACKEND_URL` in `App.js`:
```javascript
const BACKEND_URL = 'https://your-backend-url.com/api';
```

### iOS Permissions (app.json)
- `NSPhotoLibraryUsageDescription`
- `NSPhotoLibraryAddUsageDescription`  
- `NSCameraUsageDescription`
- `NSMicrophoneUsageDescription`

## 🚢 Deployment

### Mobile App (iOS App Store)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure and build
eas build:configure
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Backend (Production)
- **Docker**: Use `docker-compose.yml` for easy deployment
- **Cloud**: AWS ECS, Google Cloud Run, Azure Container Instances
- **VPS**: DigitalOcean, Linode, Vultr with Docker support

## 📊 Processing Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `pts_per_beat` | 20 | Max new points per beat |
| `ambient_rate` | 5.0 | Random spawns per second |
| `life_frames` | 10 | Point lifespan in frames |
| `jitter_px` | 0.5 | Motion jitter amount |
| `min_size` | 15 | Minimum square size |
| `max_size` | 40 | Maximum square size |
| `neighbor_links` | 3 | Edges per point |

## 🛠️ Requirements

### Mobile App
- Node.js 18+
- Expo CLI
- iOS device or simulator
- Xcode (for iOS builds)

### Backend
- Python 3.9+
- FFmpeg
- OpenCV dependencies
- 4GB+ RAM recommended

## 📁 Project Structure

```
beatsync-video/
├── main.py                 # Original processing script
├── requirements.txt        # Python dependencies
├── App.js                  # Main mobile app component  
├── package.json           # Node.js dependencies
├── app.json               # Expo configuration
├── backend/               # Flask API server
│   ├── app.py            # API endpoints
│   ├── requirements.txt  # Backend dependencies
│   └── Dockerfile        # Container config
├── assets/               # App icons and images
└── README_DEPLOYMENT.md  # Detailed deployment guide
```

## 🎯 Use Cases

- **Social Media**: Create engaging beat-synced content
- **Music Videos**: Add dynamic visual effects automatically  
- **Live Events**: Process recorded performances
- **Educational**: Demonstrate audio-visual synchronization
- **Art Projects**: Generate algorithmic video art

## 💡 Customization

The mobile app sends these parameters to the backend:
- Processing intensity levels
- Visual style preferences  
- Custom beat detection settings
- Export quality options

## 🐛 Troubleshooting

### Common Issues
- **Permissions**: Ensure all iOS permissions are granted
- **Backend**: Check Docker logs for processing errors
- **Network**: Verify backend URL is accessible from mobile
- **Video Length**: Maximum 2 minutes supported

### Debug Commands
```bash
# Check backend health
curl http://localhost:5000/api/health

# View backend logs
docker-compose logs -f beatsync-api

# Test video processing
curl -X POST -F "video=@test.mp4" http://localhost:5000/api/process-video
```

## 📄 License

This project is open source. See individual files for specific license information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Ready to create amazing beat-synced videos?** Start with `./setup.sh` and follow the Quick Start guide above!
