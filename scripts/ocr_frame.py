"""
Tool 2: ocr_frame
Given a video frame (or video + timestamp), returns word-level bounding boxes.

Usage:
  python scripts/ocr_frame.py <image_path>
  python scripts/ocr_frame.py <video_path> --time 3.0
  python scripts/ocr_frame.py <video_path> --all --fps 2
  python scripts/ocr_frame.py <video_path> --all --fps 2 --subtitle-only

Output: JSON with word bounding boxes
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from paddleocr import PaddleOCR


def extract_frame(video_path: str, time_sec: float, output_path: str):
    """Extract a single frame from video at given timestamp."""
    subprocess.run(
        [
            "ffmpeg", "-y", "-ss", str(time_sec),
            "-i", video_path, "-frames:v", "1",
            "-q:v", "2", output_path,
        ],
        capture_output=True,
    )


def extract_frames_at_fps(video_path: str, fps: float, output_dir: str) -> list[str]:
    """Extract frames from video at given fps. Returns list of (time_sec, path) tuples."""
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", video_path,
            "-vf", f"fps={fps}",
            os.path.join(output_dir, "frame_%05d.png"),
        ],
        capture_output=True,
    )
    frames = sorted(Path(output_dir).glob("frame_*.png"))
    return [(i / fps, str(f)) for i, f in enumerate(frames)]


def ocr_image(ocr: PaddleOCR, image_path: str) -> list[dict]:
    """Run OCR on an image, return word bounding boxes."""
    result = ocr.predict(image_path)

    words = []
    if result:
        for res in result:
            data = res.json["res"]
            rec_scores = data.get("rec_scores", [])

            # Word-level boxes available via text_word + text_word_boxes
            text_words = data.get("text_word", [])
            text_word_boxes = data.get("text_word_boxes", [])

            if text_words and text_word_boxes:
                for line_idx, (line_words, line_boxes) in enumerate(
                    zip(text_words, text_word_boxes)
                ):
                    line_confidence = rec_scores[line_idx] if line_idx < len(rec_scores) else 0.0
                    for word, box in zip(line_words, line_boxes):
                        if word.strip() == "":
                            continue
                        # box is [x1, y1, x2, y2]
                        x, y = box[0], box[1]
                        w, h = box[2] - box[0], box[3] - box[1]
                        words.append({
                            "text": word.strip(),
                            "x": round(x),
                            "y": round(y),
                            "w": round(w),
                            "h": round(h),
                            "confidence": round(float(line_confidence), 4),
                            "bbox": [[round(box[0]), round(box[1])],
                                     [round(box[2]), round(box[1])],
                                     [round(box[2]), round(box[3])],
                                     [round(box[0]), round(box[3])]],
                        })
            else:
                # Fallback: line-level results
                rec_texts = data.get("rec_texts", [])
                rec_boxes = data.get("rec_boxes", [])
                for i, text in enumerate(rec_texts):
                    if rec_boxes and i < len(rec_boxes):
                        box = rec_boxes[i]
                        x, y = box[0], box[1]
                        w, h = box[2] - box[0], box[3] - box[1]
                    else:
                        continue
                    confidence = rec_scores[i] if i < len(rec_scores) else 0.0
                    words.append({
                        "text": text,
                        "x": round(x),
                        "y": round(y),
                        "w": round(w),
                        "h": round(h),
                        "confidence": round(float(confidence), 4),
                    })

    return words


def filter_subtitle_words(words: list[dict], frame_height: int) -> list[dict]:
    """
    Filter OCR words to only subtitle text using multiple heuristics:
    1. Position: subtitle is in the bottom ~40% of the frame
    2. Size: subtitle text is large (tall characters)
    3. Consistency: subtitle words cluster together (similar y, similar h)

    Returns only words that are likely subtitle text.
    """
    if not words:
        return []

    y_threshold = frame_height * 0.55

    # Step 1: filter by position (bottom of frame)
    bottom_words = [w for w in words if w["y"] >= y_threshold]
    if not bottom_words:
        return []

    # Step 2: find the dominant text size cluster (subtitle words are same size)
    # Group by height — subtitle words have similar h values
    heights = [w["h"] for w in bottom_words]
    if not heights:
        return []

    # The tallest cluster is likely the subtitle (bold, large text)
    max_h = max(heights)
    # Subtitle words should be at least 50% of the tallest word
    min_h = max_h * 0.5

    subtitle_words = [w for w in bottom_words if w["h"] >= min_h]

    # Step 3: if we still have too many words (>8), it's probably a text-heavy
    # frame — keep only the largest words (top N by area)
    if len(subtitle_words) > 8:
        subtitle_words.sort(key=lambda w: w["w"] * w["h"], reverse=True)
        subtitle_words = subtitle_words[:6]

    return subtitle_words


def main():
    parser = argparse.ArgumentParser(description="OCR word bounding boxes from video frames")
    parser.add_argument("input", help="Image or video file path")
    parser.add_argument("--time", type=float, help="Extract frame at this timestamp (seconds)")
    parser.add_argument("--all", action="store_true", help="Process all frames at --fps rate")
    parser.add_argument("--fps", type=float, default=2, help="Frames per second for --all mode")
    parser.add_argument("--output", "-o", help="Output JSON path")
    parser.add_argument("--subtitle-region", type=float, default=0.7,
                        help="Only return text in bottom N%% of frame (0.7 = bottom 30%%)")
    parser.add_argument("--subtitle-only", action="store_true",
                        help="Smart filter: only return subtitle-sized text (rejects article body text)")
    args = parser.parse_args()

    input_path = os.path.abspath(args.input)
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    # Init PaddleOCR (downloads model on first run)
    ocr = PaddleOCR(use_textline_orientation=True, lang="en", return_word_box=True)

    is_video = input_path.endswith((".mp4", ".mov", ".webm", ".mkv"))

    if is_video and args.all:
        # Process all frames
        with tempfile.TemporaryDirectory() as tmpdir:
            frame_pairs = extract_frames_at_fps(input_path, args.fps, tmpdir)
            results = []
            total_raw = 0
            total_kept = 0
            for time_sec, frame_path in frame_pairs:
                words = ocr_image(ocr, frame_path)
                total_raw += len(words)

                if args.subtitle_only:
                    from PIL import Image
                    img = Image.open(frame_path)
                    words = filter_subtitle_words(words, img.height)
                elif args.subtitle_region:
                    from PIL import Image
                    img = Image.open(frame_path)
                    h = img.height
                    threshold_y = h * args.subtitle_region
                    words = [w for w in words if w["y"] >= threshold_y]

                total_kept += len(words)
                if words:
                    results.append({
                        "timeSec": round(time_sec, 2),
                        "words": words,
                    })
                    print(f"  {time_sec:.1f}s: {[w['text'] for w in words]}", file=sys.stderr)

            if args.subtitle_only:
                print(f"Subtitle filter: {total_kept}/{total_raw} words kept", file=sys.stderr)

            output = {"source": input_path, "fps": args.fps, "frames": results}

    elif is_video and args.time is not None:
        # Single frame from video
        with tempfile.TemporaryDirectory() as tmpdir:
            frame_path = os.path.join(tmpdir, "frame.png")
            extract_frame(input_path, args.time, frame_path)
            words = ocr_image(ocr, frame_path)
            if args.subtitle_only:
                from PIL import Image
                img = Image.open(frame_path)
                words = filter_subtitle_words(words, img.height)
            output = {"source": input_path, "timeSec": args.time, "words": words}

    else:
        # Direct image input
        words = ocr_image(ocr, input_path)
        output = {"source": input_path, "words": words}

    json_str = json.dumps(output, indent=2)

    if args.output:
        os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
        with open(args.output, "w") as f:
            f.write(json_str)
        print(f"Saved: {args.output}", file=sys.stderr)
    else:
        print(json_str)


if __name__ == "__main__":
    main()
