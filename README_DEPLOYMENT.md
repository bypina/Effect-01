# BeatSync Video - Deployment Guide

This guide covers deploying both the mobile app and backend service for the BeatSync Video application.

## Architecture Overview

- **Frontend**: Expo React Native app (iOS/Android)
- **Backend**: Flask API server with video processing capabilities
- **Processing**: Python script (`main.py`) for beat-synchronized video effects

## Backend Deployment

### Option 1: Docker (Recommended)

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build -d
   ```

2. **The API will be available at:**
   ```
   http://localhost:5000
   ```

### Option 2: Manual Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Install system dependencies (Ubuntu/Debian):**
   ```bash
   sudo apt-get update
   sudo apt-get install ffmpeg libsndfile1 libgl1-mesa-glx
   ```

3. **Run the Flask server:**
   ```bash
   python app.py
   ```

### Production Deployment

For production, consider using:

- **Cloud Platforms**: AWS ECS, Google Cloud Run, Azure Container Instances
- **VPS**: DigitalOcean, Linode, Vultr with Docker
- **Serverless**: AWS Lambda (with custom runtime for video processing)

**Important**: Video processing is CPU-intensive. Use instances with adequate CPU/memory.

## Mobile App Deployment

### Development Testing

1. **Install Expo CLI:**
   ```bash
   npm install -g @expo/cli
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update backend URL in `App.js`:**
   ```javascript
   const BACKEND_URL = 'https://your-production-backend.com/api';
   ```

4. **Start development server:**
   ```bash
   npx expo start
   ```

### Production Build

1. **Configure EAS Build:**
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. **Update `app.json` with your bundle identifier and project ID**

3. **Build for iOS:**
   ```bash
   eas build --platform ios
   ```

4. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
FLASK_ENV=production
MAX_CONTENT_LENGTH=500000000
UPLOAD_FOLDER=uploads
PROCESSED_FOLDER=processed
```

### Mobile App Configuration

Update `app.json` with your details:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

## Security Considerations

1. **File Upload Limits**: Configured to 500MB max
2. **Video Duration**: Limited to 2 minutes
3. **File Type Validation**: Only allows video formats
4. **Timeout Protection**: 10-minute processing timeout
5. **CORS Configuration**: Update for production domains

## Monitoring and Maintenance

1. **Logs**: Check Docker logs for processing issues
2. **Cleanup**: Implement automated cleanup of processed files
3. **Scaling**: Consider horizontal scaling for high usage
4. **Storage**: Monitor disk usage for uploaded/processed videos

## Performance Tips

1. **Server Resources**: Use instances with at least 4GB RAM and 2 CPU cores
2. **Video Optimization**: Consider pre-processing to optimize file sizes
3. **CDN**: Use a CDN for serving processed videos
4. **Caching**: Implement Redis for job status tracking

## Troubleshooting

### Common Issues

1. **FFmpeg not found**: Ensure FFmpeg is installed on the server
2. **Processing timeout**: Increase timeout for longer videos
3. **Memory issues**: Increase server memory allocation
4. **iOS permissions**: Ensure all required permissions are in `app.json`

### Debug Commands

```bash
# Check backend health
curl http://localhost:5000/api/health

# Test video processing
curl -X POST -F "video=@test.mp4" http://localhost:5000/api/process-video

# View backend logs
docker-compose logs -f beatsync-api
```

## Cost Estimation

### Backend Hosting (Monthly)
- **Basic VPS**: $10-20 (2GB RAM, 1 CPU)
- **Cloud Run**: $20-50 (based on usage)
- **AWS ECS**: $30-80 (t3.medium instance)

### Mobile App
- **Expo Development**: Free
- **EAS Build**: $29/month for unlimited builds
- **App Store**: $99/year developer fee

## Support

For issues related to:
- **Video processing**: Check main.py script and dependencies
- **Mobile app**: Review Expo documentation and permissions
- **Deployment**: Check Docker logs and server resources