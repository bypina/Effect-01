# Beat-Synced Squares Effect

This repo demonstrates how to overlay randomly-placed squares that appear on musical onsets and connect to each other with lines.

## Installation
```bash
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```
MoviePy relies on **FFmpeg**.  Make sure it is available in your `PATH` (e.g. `brew install ffmpeg`).

## Usage
```bash
python main.py \
  --input sample_data/playing_dead.mp4 \
  --output output_with_boxes.mp4 \
  --lifetime 0.15 \
  --match-pairs 5 \
  --orb-fast-threshold 15
```
CLI flags are optional; defaults are shown in `main.py`.

## How it works
1. The script extracts the audio track and runs onset detection (`librosa`).
2. Each onset spawns a square at a random screen location.
3. Squares fade out after the specified lifetime.
4. Lines connect the most recent *N* squares for a dynamic network look. 