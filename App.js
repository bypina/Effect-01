import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Replace with your backend URL
const BACKEND_URL = 'https://your-backend-url.com/api';

export default function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [processedVideo, setProcessedVideo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(false);

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setHasMediaLibraryPermission(status === 'granted');
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to save your processed videos!'
      );
    }
  };

  const checkVideoDuration = async (uri) => {
    try {
      const { duration } = await new Promise((resolve, reject) => {
        const video = new Audio.Sound();
        video.loadAsync({ uri }, { shouldPlay: false })
          .then(() => {
            video.getStatusAsync().then(status => {
              resolve({ duration: status.durationMillis });
              video.unloadAsync();
            });
          })
          .catch(reject);
      });
      
      return duration;
    } catch (error) {
      console.log('Could not get video duration:', error);
      return null;
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 120, // 2 minutes max
      });

      if (!result.canceled && result.assets[0]) {
        const video = result.assets[0];
        
        // Check duration (2 minutes = 120,000 ms)
        if (video.duration && video.duration > 120000) {
          Alert.alert(
            'Video Too Long',
            'Please select a video that is 2 minutes or shorter.'
          );
          return;
        }

        setSelectedVideo(video);
        setProcessedVideo(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video. Please try again.');
      console.error('Video picker error:', error);
    }
  };

  const recordVideo = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 120, // 2 minutes max
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedVideo(result.assets[0]);
        setProcessedVideo(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record video. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const processVideo = async () => {
    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video first.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('video', {
        uri: selectedVideo.uri,
        type: 'video/mp4',
        name: 'input_video.mp4',
      });

      // Add processing parameters
      formData.append('pts_per_beat', '20');
      formData.append('ambient_rate', '5.0');
      formData.append('life_frames', '10');
      formData.append('jitter_px', '0.5');
      formData.append('min_size', '15');
      formData.append('max_size', '40');
      formData.append('neighbor_links', '3');

      // Upload and process
      const response = await fetch(`${BACKEND_URL}/process-video`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Download processed video
        const downloadUrl = `${BACKEND_URL}/download/${result.videoId}`;
        const downloadResponse = await FileSystem.downloadAsync(
          downloadUrl,
          FileSystem.documentDirectory + 'processed_video.mp4'
        );

        setProcessedVideo({
          uri: downloadResponse.uri,
          videoId: result.videoId,
        });
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      Alert.alert('Processing Error', error.message || 'Failed to process video. Please try again.');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const saveToGallery = async () => {
    if (!processedVideo || !hasMediaLibraryPermission) {
      Alert.alert('Error', 'No processed video to save or missing permissions.');
      return;
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(processedVideo.uri);
      await MediaLibrary.createAlbumAsync('BeatSync Videos', asset, false);
      
      Alert.alert(
        'Success!',
        'Your beat-synced video has been saved to your photo library!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save video to gallery.');
      console.error('Save error:', error);
    }
  };

  const resetApp = () => {
    setSelectedVideo(null);
    setProcessedVideo(null);
    setIsProcessing(false);
    setProgress(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>BeatSync Video</Text>
            <Text style={styles.subtitle}>Transform your videos with beat-synced effects</Text>
          </View>

          {/* Video Selection */}
          {!selectedVideo && !isProcessing && (
            <View style={styles.uploadSection}>
              <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
                <Ionicons name="videocam" size={40} color="#fff" />
                <Text style={styles.uploadButtonText}>Select Video</Text>
                <Text style={styles.uploadSubtext}>Choose from library (max 2 min)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadButton} onPress={recordVideo}>
                <Ionicons name="camera" size={40} color="#fff" />
                <Text style={styles.uploadButtonText}>Record Video</Text>
                <Text style={styles.uploadSubtext}>Record new video (max 2 min)</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Selected Video Preview */}
          {selectedVideo && !isProcessing && !processedVideo && (
            <View style={styles.videoSection}>
              <Text style={styles.sectionTitle}>Selected Video</Text>
              <Video
                source={{ uri: selectedVideo.uri }}
                style={styles.videoPreview}
                shouldPlay={false}
                isLooping={false}
                resizeMode="contain"
                useNativeControls
              />
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={resetApp}>
                  <Text style={styles.secondaryButtonText}>Choose Different Video</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.primaryButton} onPress={processVideo}>
                  <Ionicons name="color-wand" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Process Video</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Processing Screen */}
          {isProcessing && (
            <View style={styles.processingSection}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingTitle}>Creating Your BeatSync Video</Text>
              <Text style={styles.processingSubtext}>
                This may take a few minutes depending on video length...
              </Text>
              
              <View style={styles.processingSteps}>
                <Text style={styles.stepText}>🎵 Analyzing audio beats</Text>
                <Text style={styles.stepText}>👁️ Detecting visual features</Text>
                <Text style={styles.stepText}>✨ Generating synchronized effects</Text>
                <Text style={styles.stepText}>🎬 Rendering final video</Text>
              </View>
            </View>
          )}

          {/* Processed Video */}
          {processedVideo && !isProcessing && (
            <View style={styles.videoSection}>
              <Text style={styles.sectionTitle}>Your BeatSync Video</Text>
              <Video
                source={{ uri: processedVideo.uri }}
                style={styles.videoPreview}
                shouldPlay={false}
                isLooping={true}
                resizeMode="contain"
                useNativeControls
              />
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={resetApp}>
                  <Text style={styles.secondaryButtonText}>Create Another</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.primaryButton} onPress={saveToGallery}>
                  <Ionicons name="download" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Save to Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
  },
  uploadSection: {
    gap: 20,
    marginVertical: 40,
  },
  uploadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  uploadButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 5,
  },
  videoSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  videoPreview: {
    width: width - 40,
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  processingSection: {
    alignItems: 'center',
    marginVertical: 60,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  processingSubtext: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 30,
  },
  processingSteps: {
    gap: 15,
  },
  stepText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});