"""Find flower/text boundary by analyzing color saturation."""
from PIL import Image
import numpy as np

SRC = "/home/z/my-project/upload/UtsavAI Festive Brand Identity.png"
OUT = "/home/z/my-project/public/brand"
img = Image.open(SRC).convert("RGBA")

# Work on left half only
left = img.crop((0, 0, 887, 887))
arr = np.array(left)
H, W = arr.shape[:2]

# Find bbox of content
alpha = arr[:, :, 3]
content_rows = np.where((alpha > 30).any(axis=1))[0]
content_cols = np.where((alpha > 30).any(axis=0))[0]
y0, y1 = content_rows[0], content_rows[-1]
x0, x1 = content_cols[0], content_cols[-1]
print(f"Content bbox in left: x={x0}-{x1}, y={y0}-{y1}")

left_cropped = left.crop((x0, y0, x1 + 1, y1 + 1))
arr = np.array(left_cropped)
H, W = arr.shape[:2]
print(f"Cropped: {W}x{H}")

# Identify "colorful" pixels (flower) vs "dark text" pixels vs "transparent"
# Flower: orange/coral, hue ~10-40, high saturation, medium-high value
# Text "Utsav": dark brown, low value, low-medium saturation
# Text "AI": orange-red, high saturation, medium-high value
# Background: transparent (alpha=0) but originally black

import colorsys
def rgb_to_hsv_vec(arr_rgb):
    """Convert RGB array to HSV."""
    r, g, b = arr_rgb[:,:,0]/255, arr_rgb[:,:,1]/255, arr_rgb[:,:,2]/255
    maxc = np.maximum(r, np.maximum(g, b))
    minc = np.minimum(r, np.minimum(g, b))
    v = maxc
    delta = maxc - minc
    s = np.where(maxc > 0, delta / np.maximum(maxc, 1e-10), 0)
    rc = np.where(delta > 0, (maxc - r) / np.maximum(delta, 1e-10), 0)
    gc = np.where(delta > 0, (maxc - g) / np.maximum(delta, 1e-10), 0)
    bc = np.where(delta > 0, (maxc - b) / np.maximum(delta, 1e-10), 0)
    h = np.where(r == maxc, bc - gc, np.where(g == maxc, 2.0 + rc - bc, 4.0 + gc - rc))
    h = (h / 6.0) % 1.0
    return h, s, v

rgb = arr[:, :, :3]
h, s, v = rgb_to_hsv_vec(rgb)
a = arr[:, :, 3]

# Classify pixels
# Transparent: alpha < 30
# Flower (warm orange/coral): hue 0.02-0.12 (red-orange-yellow), saturation > 0.4, value > 0.3
# Dark text: value < 0.3, alpha > 100
flower_mask = (a > 50) & (h > 0.0) & (h < 0.15) & (s > 0.4) & (v > 0.3)
dark_mask = (a > 100) & (v < 0.3) & (s < 0.5)

# Find rows where dark text dominates vs where flower dominates
flower_per_row = flower_mask.sum(axis=1)
dark_per_row = dark_mask.sum(axis=1)
total_per_row = (a > 50).sum(axis=1)

print("\nRow analysis (every 20 rows):")
print(f"{'y':>5} {'flower':>7} {'dark':>6} {'total':>6}")
for y in range(0, H, 20):
    print(f"{y:5d} {flower_per_row[y]:7d} {dark_per_row[y]:6d} {total_per_row[y]:6d}")

# Find the boundary: first row where dark text count exceeds flower count significantly
# Or where dark text starts dominating
boundary = None
for y in range(50, H - 50):
    # Look for transition: above is mostly flower, below has substantial dark text
    if dark_per_row[y] > 30 and dark_per_row[y] > flower_per_row[y] * 0.5:
        # Check this is a sustained transition
        if all(dark_per_row[y+k] > 20 for k in range(20)):
            boundary = y
            break

print(f"\nFlower/text boundary: y={boundary}")

# Save flower-only and text-only regions
if boundary:
    flower = left_cropped.crop((0, 0, W, boundary))
    text = left_cropped.crop((0, boundary, W, H))
    flower.save(f"{OUT}/_flower.png")
    text.save(f"{OUT}/_text.png")
    print(f"Flower: {flower.size}, Text: {text.size}")
    
    # Find flower bbox (tight crop)
    farr = np.array(flower)
    falpha = farr[:, :, 3]
    fmask = (falpha > 30)
    frows = np.where(fmask.any(axis=1))[0]
    fcols = np.where(fmask.any(axis=0))[0]
    if len(frows) > 0:
        fbbox = (fcols[0], frows[0], fcols[-1] + 1, frows[-1] + 1)
        flower_tight = flower.crop(fbbox)
        flower_tight.save(f"{OUT}/logo-mark.png")
        print(f"Flower tight: {flower_tight.size} -> logo-mark.png")

# Save full left logo (transparent)
left_cropped.save(f"{OUT}/logo-full-transparent.png")
print(f"\nFull left logo: {left_cropped.size} -> logo-full-transparent.png")
