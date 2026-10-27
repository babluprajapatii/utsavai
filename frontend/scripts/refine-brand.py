"""Verify and refine brand assets. Make icon properly square."""
from PIL import Image, ImageDraw
import numpy as np
import os

SRC = "/home/z/my-project/upload/UtsavAI Festive Brand Identity.png"
OUT = "/home/z/my-project/public/brand"

img = Image.open(SRC).convert("RGBA")

# Right half is the app icon area
right = img.crop((887, 0, 1774, 887))

# Find the cream rounded square - it's opaque (alpha=255) and light colored
arr = np.array(right)
r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
# Cream/white pixels: high value, low saturation, opaque
cream_mask = (a > 200) & (r > 200) & (g > 180) & (b > 160) & (r >= g) & (g >= b)
print(f"Cream pixels: {cream_mask.sum()}")

# Find bbox of cream region
rows = np.where(cream_mask.any(axis=1))[0]
cols = np.where(cream_mask.any(axis=0))[0]
if len(rows) > 0:
    print(f"Cream region: y={rows[0]}-{rows[-1]}, x={cols[0]}-{cols[-1]}")
    print(f"  Width: {cols[-1] - cols[0]}, Height: {rows[-1] - rows[0]}")
    # The rounded square itself
    sq_size = max(cols[-1] - cols[0], rows[-1] - rows[0])
    cx = (cols[0] + cols[-1]) // 2
    cy = (rows[0] + rows[-1]) // 2
    half = sq_size // 2 + 4  # small padding
    square_crop = right.crop((cx - half, cy - half, cx + half, cy + half))
    print(f"Square crop: {square_crop.size}")
    square_crop.save(f"{OUT}/_icon_square.png")
    
    # Now use this as the canonical icon
    icon = square_crop
    # Re-save all icon sizes
    for size in [16, 32, 48, 64, 128, 180, 192, 512]:
        icon.resize((size, size), Image.LANCZOS).save(f"{OUT}/icon-{size}.png")
    icon.resize((180, 180), Image.LANCZOS).save(f"{OUT}/apple-touch-icon.png")
    icon.resize((192, 192), Image.LANCZOS).save(f"{OUT}/android-chrome-192x192.png")
    icon.resize((512, 512), Image.LANCZOS).save(f"{OUT}/android-chrome-512x512.png")
    icon.resize((32, 32), Image.LANCZOS).save(f"{OUT}/favicon-32.png")
    icon.resize((16, 16), Image.LANCZOS).save(f"{OUT}/favicon-16.png")
    
    # favicon.ico
    icon_16 = icon.resize((16, 16), Image.LANCZOS)
    icon_32 = icon.resize((32, 32), Image.LANCZOS)
    icon_48 = icon.resize((48, 48), Image.LANCZOS)
    icon_32.save("/home/z/my-project/public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    icon_32.save("/home/z/my-project/public/favicon-32.png")
    icon_16.save("/home/z/my-project/public/favicon-16.png")
    icon_180 = icon.resize((180, 180), Image.LANCZOS)
    icon_180.save("/home/z/my-project/public/apple-touch-icon.png")
    print("✓ Re-saved all icon variants as proper square")

# ───────────────────────────────────────────────────────────────────────────
# Now refine the flower mark - make sure it has clean transparent edges
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

# HSV analysis to find flower/text boundary
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

boundary = None
for y in range(50, left_cropped.size[1] - 50):
    if dark_per_row[y] > 30:
        if all(dark_per_row[y+k] > 20 for k in range(20)):
            boundary = y
            break

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

# Clean the flower edges - remove any semi-transparent halo
arr_f = np.array(flower_tight)
# Make semi-transparent pixels fully transparent if alpha < 50
arr_f[:, :, 3] = np.where(arr_f[:, :, 3] < 50, 0, arr_f[:, :, 3])
flower_clean = Image.fromarray(arr_f, "RGBA")

# Save flower mark
flower_clean.save(f"{OUT}/logo-mark.png")
for size in [32, 48, 64, 96, 128, 256]:
    flower_clean.resize((size, size), Image.LANCZOS).save(f"{OUT}/logo-mark-{size}.png")
print("✓ Saved cleaned flower mark")

# White silhouette for dark backgrounds
arr_w = arr_f.copy()
arr_w[:, :, 0] = 255
arr_w[:, :, 1] = 255
arr_w[:, :, 2] = 255
white_flower = Image.fromarray(arr_w, "RGBA")
white_flower.save(f"{OUT}/logo-mark-light.png")
for size in [32, 48, 64, 128]:
    white_flower.resize((size, size), Image.LANCZOS).save(f"{OUT}/logo-mark-light-{size}.png")
print("✓ Saved white silhouette")

# Full logo (transparent)
left_cropped.save(f"{OUT}/logo-full.png")
print(f"✓ Full logo: {left_cropped.size}")

# Clean up debug files
for f in os.listdir(OUT):
    if f.startswith("_"):
        os.remove(os.path.join(OUT, f))
print("\n✅ Final brand assets:")
for f in sorted(os.listdir(OUT)):
    if not f.startswith("_"):
        path = os.path.join(OUT, f)
        size = os.path.getsize(path)
        print(f"  {f} ({size:,} bytes)")
