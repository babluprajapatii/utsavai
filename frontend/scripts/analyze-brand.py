"""Analyze the brand image more carefully to extract components."""
from PIL import Image
import os

SRC = "/home/z/my-project/upload/UtsavAI Festive Brand Identity.png"
OUT = "/home/z/my-project/public/brand"
img = Image.open(SRC).convert("RGBA")
W, H = img.size

# The full image is 1774x887 with transparent background
# Left half (0-887): full logo - flower mark on top, "UtsavAI" wordmark, tagline
# Right half (887-1774): app icon - flower on cream rounded square

left = img.crop((0, 0, 887, 887))
right = img.crop((887, 0, 1774, 887))

# Save downsized preview to inspect
preview = img.resize((400, 200), Image.LANCZOS)
preview.save(f"{OUT}/_preview.png")

# For the LEFT half, find content bounding box
alpha_l = left.split()[-1]
# Threshold: any pixel with alpha > 20
from PIL import ImageOps
mask_l = alpha_l.point(lambda p: 255 if p > 20 else 0)
bbox_l = mask_l.getbbox()
print(f"Left content bbox: {bbox_l}")

# For the RIGHT half - this is the app icon, find its bbox
alpha_r = right.split()[-1]
mask_r = alpha_r.point(lambda p: 255 if p > 20 else 0)
bbox_r = mask_r.getbbox()
print(f"Right content bbox: {bbox_r}")

# Now within the left half, find where the flower mark ends and text begins
# The flower is on top, text below. Let's find horizontal bands of content
left_cropped = left.crop(bbox_l)
lw, lh = left_cropped.size
print(f"\nLeft cropped: {lw}x{lh}")

# Find rows with significant content
import numpy as np
arr = np.array(left_cropped)
alpha = arr[:, :, 3]
# For each row, count opaque pixels
row_counts = (alpha > 30).sum(axis=1)
# Find the gap between flower and text (a row range with very few pixels)
print("\nRow density (every 40px):")
for y in range(0, lh, 40):
    bar = "#" * (row_counts[y] // 20)
    print(f"y={y:4d}: {row_counts[y]:4d} {bar}")

# Find the gap
gaps = []
for y in range(10, lh - 10):
    if row_counts[y] < 20 and row_counts[y-1] >= 20:
        # check it's a real gap (at least 10 rows of low density)
        if all(row_counts[y+k] < 30 for k in range(10)):
            gaps.append(y)
            break
print(f"\nFirst gap (flower/text boundary): y={gaps[0] if gaps else 'none'}")

# Also find where wordmark+tagline ends
text_end = lh
for y in range(lh - 1, 0, -1):
    if row_counts[y] > 20:
        text_end = y
        break

if gaps:
    flower_bbox = (0, 0, lw, gaps[0])
    text_bbox = (0, gaps[0], lw, text_end)
    flower = left_cropped.crop(flower_bbox)
    text = left_cropped.crop(text_bbox)
    flower.save(f"{OUT}/_flower_raw.png")
    text.save(f"{OUT}/_text_raw.png")
    print(f"Flower raw: {flower.size}")
    print(f"Text raw: {text.size}")

# Also save the right (app icon) cropped to bbox
right_cropped = right.crop(bbox_r)
right_cropped.save(f"{OUT}/_icon_raw.png")
print(f"\nIcon raw: {right_cropped.size}")
