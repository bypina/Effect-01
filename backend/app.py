#!/usr/bin/env python3
"""
Flask backend for BeatSync Video processing.
Handles video uploads, runs the main.py script, and serves processed videos.
"""

import os
import uuid
import tempfile
import subprocess
import logging
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import shutil

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB max file size
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv'}

app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_video_duration(video_path):
    """Get video duration in seconds using ffprobe."""
    try:
        cmd = [
            'ffprobe', '-v', 'quiet', '-print_format', 'json',
            '-show_format', str(video_path)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        import json
        data = json.loads(result.stdout)
        duration = float(data['format']['duration'])
        return duration
    except Exception as e:
        logger.error(f"Error getting video duration: {e}")
        return None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'message': 'BeatSync Video API is running'})

@app.route('/api/process-video', methods=['POST'])
def process_video():
    """Process uploaded video with BeatSync effects."""
    try:
        # Check if video file is present
        if 'video' not in request.files:
            return jsonify({'success': False, 'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'Invalid file type. Please upload MP4, MOV, AVI, or MKV files.'}), 400
        
        # Generate unique ID for this processing job
        job_id = str(uuid.uuid4())
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        input_path = Path(UPLOAD_FOLDER) / f"{job_id}_{filename}"
        file.save(str(input_path))
        
        logger.info(f"Saved uploaded file: {input_path}")
        
        # Check video duration (max 2 minutes = 120 seconds)
        duration = get_video_duration(input_path)
        if duration and duration > 120:
            os.remove(input_path)
            return jsonify({'success': False, 'error': 'Video is too long. Maximum duration is 2 minutes.'}), 400
        
        # Get processing parameters from request
        pts_per_beat = int(request.form.get('pts_per_beat', 20))
        ambient_rate = float(request.form.get('ambient_rate', 5.0))
        life_frames = int(request.form.get('life_frames', 10))
        jitter_px = float(request.form.get('jitter_px', 0.5))
        min_size = int(request.form.get('min_size', 15))
        max_size = int(request.form.get('max_size', 40))
        neighbor_links = int(request.form.get('neighbor_links', 3))
        
        # Output path for processed video
        output_path = Path(PROCESSED_FOLDER) / f"{job_id}_processed.mp4"
        
        # Run the main.py script
        cmd = [
            'python3', 'main.py',
            '--input', str(input_path),
            '--output', str(output_path),
            '--pts-per-beat', str(pts_per_beat),
            '--ambient-rate', str(ambient_rate),
            '--life-frames', str(life_frames),
            '--jitter-px', str(jitter_px),
            '--min-size', str(min_size),
            '--max-size', str(max_size),
            '--neighbor-links', str(neighbor_links),
            '--log-level', 'INFO'
        ]
        
        logger.info(f"Running processing command: {' '.join(cmd)}")
        
        # Run the processing script
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600,  # 10 minute timeout
            cwd='..'  # Run from parent directory where main.py is located
        )
        
        # Clean up input file
        try:
            os.remove(input_path)
        except:
            pass
        
        if result.returncode != 0:
            logger.error(f"Processing failed: {result.stderr}")
            return jsonify({'success': False, 'error': f'Video processing failed: {result.stderr}'}), 500
        
        # Check if output file was created
        if not output_path.exists():
            logger.error("Output file was not created")
            return jsonify({'success': False, 'error': 'Processing completed but output file was not created'}), 500
        
        logger.info(f"Processing completed successfully: {output_path}")
        
        return jsonify({
            'success': True,
            'videoId': job_id,
            'message': 'Video processed successfully'
        })
        
    except subprocess.TimeoutExpired:
        return jsonify({'success': False, 'error': 'Processing timeout. Video might be too complex or long.'}), 408
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

@app.route('/api/download/<video_id>', methods=['GET'])
def download_video(video_id):
    """Download processed video."""
    try:
        output_path = Path(PROCESSED_FOLDER) / f"{video_id}_processed.mp4"
        
        if not output_path.exists():
            return jsonify({'error': 'Video not found'}), 404
        
        return send_file(
            str(output_path),
            as_attachment=True,
            download_name=f"beatsync_video_{video_id}.mp4",
            mimetype='video/mp4'
        )
        
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/api/cleanup/<video_id>', methods=['DELETE'])
def cleanup_video(video_id):
    """Clean up processed video file."""
    try:
        output_path = Path(PROCESSED_FOLDER) / f"{video_id}_processed.mp4"
        
        if output_path.exists():
            os.remove(output_path)
            return jsonify({'success': True, 'message': 'Video cleaned up successfully'})
        else:
            return jsonify({'success': False, 'message': 'Video not found'})
            
    except Exception as e:
        logger.error(f"Cleanup error: {str(e)}")
        return jsonify({'success': False, 'error': f'Cleanup failed: {str(e)}'}), 500

if __name__ == '__main__':
    # Check if main.py exists in parent directory
    main_py_path = Path('../main.py')
    if not main_py_path.exists():
        logger.error("main.py not found in parent directory!")
        exit(1)
    
    logger.info("Starting BeatSync Video API server...")
    app.run(host='0.0.0.0', port=5000, debug=False)