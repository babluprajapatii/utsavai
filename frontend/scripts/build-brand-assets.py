"""Create final polished brand assets for the website."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os

SRC = "/home/z/my-project/upload/UtsavAI Festive Brand Identity.png"
OUT = "/home/z/my-project/public/brand"
os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert("RGBA")
W, H = img.size

# ───────────────────────────────────────────────────────────────────────────
# 1. App icon (right side) - flower on cream rounded square
# ───────────────────────────────────────────────────────────────────────────
right = img.crop((887, 0, 1774, 887))
arr_r = np.array(right)
alpha_r = arr_r[:, :, 3]
content_rows = np.where((alpha_r > 30).any(axis=1))[0]
content_cols = np.where((alpha_r > 30).any(axis=0))[0]
icon = right.crop((
    content_cols[0], content_rows[0],
    content_cols[-1] + 1, content_rows[-1] + 1
))
print(f"App icon: {icon.size}")

# Save multiple sizes
icon.save(f"{OUT}/apple-touch-icon.png")  # 180 standard, but we save full
for size in [16, 32, 48, 64, 128, 180, 192, 512]:
    icon.resize((size, size), Image.LANCZOS).save(f"{OUT}/icon-{size}.png")
    if size in [16, 32]:
        icon.resize((size, size), Image.LANCZOS).save(f"{OUT}/favicon-{size}.png")
print("Saved app icon variants")

# ───────────────────────────────────────────────────────────────────────────
# 2. Flower mark (transparent background, just the tulip/flower)
# ───────────────────────────────────────────────────────────────────────────
left = img.crop((0, 0, 887, 887))
arr_l = np.array(left)
alpha_l = arr_l[:, :, 3]
content_rows = np.where((alpha_l > 30).any(axis=1))[0]
content_cols = np.where((alpha_l > 30).any(axis=0))[0]
left_cropped = left.crop((
    content_cols[0], content_rows[0],
    content_cols[-1] + 1, content_rows[-1] + 1
))

# Determine flower/text boundary using HSV analysis
def rgb_to_hsv_vec(arr_rgb):
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

arr = np.array(left_cropped)
h, s, v = rgb_to_hsv_vec(arr[:, :, :3])
a = arr[:, :, 3]
dark_mask = (a > 100) & (v < 0.3) & (s < 0.5)
dark_per_row = dark_mask.sum(axis=1)

# Find boundary: first row with substantial dark text content
boundary = None
for y in range(50, left_cropped.size[1] - 50):
    if dark_per_row[y] > 30:
        if all(dark_per_row[y+k] > 20 for k in range(20)):
            boundary = y
            break
print(f"Boundary at y={boundary}")

# Extract flower with some padding
flower = left_cropped.crop((0, 0, left_cropped.size[0], boundary))
# Tight crop on flower alpha
farr = np.array(flower)
falpha = farr[:, :, 3]
frows = np.where((falpha > 30).any(axis=1))[0]
fcols = np.where((falpha > 30).any(axis=0))[0]
flower_tight = flower.crop((
    fcols[0], frows[0], fcols[-1] + 1, frows[-1] + 1
))
print(f"Flower tight: {flower_tight.size}")

# Save flower mark at various sizes for different uses
flower_tight.save(f"{OUT}/logo-mark.png")
for size in [32, 48, 64, 96, 128, 256]:
    flower_tight.resize((size, size), Image.LANCZOS).save(f"{OUT}/logo-mark-{size}.png")
print("Saved flower mark variants")

# ───────────────────────────────────────────────────────────────────────────
# 3. Full logo lockup (flower + wordmark, transparent background)
# ───────────────────────────────────────────────────────────────────────────
left_cropped.save(f"{OUT}/logo-full.png")
print(f"Full logo: {left_cropped.size}")

# Also save a wider version with more padding
padded = Image.new("RGBA", (left_cropped.size[0] + 80, left_cropped.size[1] + 80), (0, 0, 0, 0))
padded.paste(left_cropped, (40, 40), left_cropped)
padded.save(f"{OUT}/logo-full-padded.png")

# ───────────────────────────────────────────────────────────────────────────
# 4. White version of the flower mark for dark backgrounds
# ───────────────────────────────────────────────────────────────────────────
# Take the flower mark and make a white silhouette version
def make_white_silhouette(im):
    """Convert any non-transparent pixel to white, preserve alpha."""
    arr = np.array(im)
    out = arr.copy()
    # For each pixel: keep alpha, set RGB to white
    out[:, :, 0] = 255
    out[:, :, 1] = 255
    out[:, :, 2] = 255
    return Image.fromarray(out, "RGBA")

# Light version (white) for dark backgrounds
white_flower = make_white_silhouette(flower_tight)
white_flower.save(f"{OUT}/logo-mark-light.png")
for size in [32, 48, 64, 128]:
    white_flower.resize((size, size), Image.LANCZOS).save(f"{OUT}/logo-mark-light-{size}.png")
print("Saved white silhouette variants")

# ───────────────────────────────────────────────────────────────────────────
# 5. favicon.ico (multi-size)
# ───────────────────────────────────────────────────────────────────────────
icon_16 = icon.resize((16, 16), Image.LANCZOS)
icon_32 = icon.resize((32, 32), Image.LANCZOS)
icon_48 = icon.resize((48, 48), Image.LANCZOS)
icon_16.save(f"{OUT}/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print("Saved favicon.ico")

# Copy favicon to public root for browser default discovery
icon_32.save("/home/z/my-project/public/favicon-32.png")
icon_16.save("/home/z/my-project/public/favicon-16.png")
icon_180 = icon.resize((180, 180), Image.LANCZOS)
icon_180.save("/home/z/my-project/public/apple-touch-icon.png")
icon_32.save("/home/z/my-project/public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32)])
print("Copied favicons to public root")

# ───────────────────────────────────────────────────────────────────────────
# 6. OG image - full logo on warm cream background
# ───────────────────────────────────────────────────────────────────────────
og = Image.new("RGB", (1200, 630), (250, 246, 238))  # warm cream
# Paste flower centered, large
flower_large = flower_tight.resize((400, 400), Image.LANCZOS)
# Center it
fx = (1200 - 400) // 2
fy = (630 - 400) // 2 - 40
og.paste(flower_large, (fx, fy), flower_large)
og.save(f"{OUT}/og-image.png", "PNG")
print("Saved og-image.png")

print("\n✅ All brand assets generated in /home/z/my-project/public/brand/")
print("Files:")
for f in sorted(os.listdir(OUT)):
    if not f.startswith("_"):
        path = os.path.join(OUT, f)
        size = os.path.getsize(path)
        print(f"  {f} ({size} bytes)")
