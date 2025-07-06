# Beat-Synced Squares (Offline & Live)

Turn any video – or your webcam feed – into a pulsing network of labelled squares that dance to the beat.

![demo gif](docs/demo.gif) <!-- drop your gif here -->

## Features
• Beat-driven spawning of squares with ORB keypoints  
• LK optical-flow tracking with subtle jitter for organic motion  
• Optional ambient "noise" spawns so visuals never fall silent  
• Neighbor-link edges for a living graph aesthetic  
• Per-square color-inversion, random alphanumeric labels, vertical text option  
• Works in real-time via `realtime.py` (webcam + microphone)

## Installation
Requirements: Python 3.9+, FFmpeg on PATH.

```bash
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Quickstart

### 1. Offline processing
```bash
python main.py \
  --input sample_data/playing_dead.mp4 \
  --output output/playing_dead_boxes.mp4 \
  --life-frames 10 \
  --pts-per-beat 20 \
  --ambient-rate 5.0 \
  --jitter-px 0.5 \
  --neighbor-links 3
```

### 2. Live webcam + mic
```bash
python realtime.py --life-frames 12 --ambient-rate 8
```

All flags are optional; see below for full reference.

## CLI reference (excerpt)
| Flag | Default | Purpose |
|------|---------|---------|
| `--fps` | source FPS | Output frame-rate |
| `--life-frames` | 10 | Frames until a point expires |
| `--pts-per-beat` | 20 | Max squares spawned each beat |
| `--ambient-rate` | 5.0 | Avg ambient spawns per second |
| `--jitter-px` | 0.5 | Random pixel jitter per frame |
| `--min-size` / `--max-size` | 15 / 40 | Square size bounds |
| `--neighbor-links` | 3 | Edges per point |
| `--orb-fast-threshold` | 20 | FAST threshold for ORB |
| `--bell-width` | 4.0 | Controls bell curve for size |
| `--seed` | None | Reproducible randomness |

Run `python main.py -h` or `python realtime.py -h` to list all options.

## How it works
1. Extract audio, detect onsets with Librosa.  
2. At each onset, ORB keypoints are sampled; a subset spawns squares.  
3. Squares are tracked across frames with Lucas-Kanade optical flow; small Gaussian jitter adds life.  
4. Edges connect each square to its nearest neighbors.  
5. Squares invert colors within their bounds, display a random label, and expire after `life_frames`.  
6. Ambient Poisson spawns keep visuals active during silence.

## Project layout
```
Effect_v1
├── main.py          # offline renderer
├── realtime.py      # live webcam/mic renderer
├── sample_data/     # demo video
├── output/          # rendered results go here
├── requirements.txt
└── plan.md
```

## Roadmap / contributions
See `plan.md` for upcoming tasks. PRs and feature ideas are welcome! 
