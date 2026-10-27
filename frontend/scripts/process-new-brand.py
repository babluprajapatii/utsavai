"""
Process the two new brand images:
- Image 1: Glossy Tulip Crown Logo Emblem.png - black background with flame tulip mark
  Use as LOGO (extract mark with transparent background)
- Image 2: Gradient U-Flame Sparkle Emblem.png - tulip on white rounded square
  Use as FAVICON (already in app-icon format)
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os

UPLOAD = "/home/z/my-project/upload"
OUT = "/home/z/my-project/public/brand"
PUBLIC = "/home/z/my-project/public"
os.makedirs(OUT, exist_ok=True)

# ───────────────────────────────────────────────────────────────────────────
# 1. FAVICON: Image 2 - tulip on white rounded square
# ───────────────────────────────────────────────────────────────────────────
icon_src = Image.open(f"{UPLOAD}/Gradient U-Flame Sparkle Emblem.png").convert("RGBA")
print(f"Icon source: {icon_src.size}, mode={icon_src.mode}")

# Find content bbox
arr = np.array(icon_src)
alpha = arr[:, :, 3]
content_rows = np.where((alpha > 30).any(axis=1))[0]
content_cols = np.where((alpha > 30).any(axis=0))[0]
icon_tight = icon_src.crop((
    content_cols[0], content_rows[0],
    content_cols[-1] + 1, content_rows[-1] + 1
))
print(f"Icon tight crop: {icon_tight.size}")

# Make it square (pad if needed)
iw, ih = icon_tight.size
target = max(iw, ih)
square_icon = Image.new("RGBA", (target, target), (0, 0, 0, 0))
square_icon.paste(icon_tight, ((target - iw) // 2, (target - ih) // 2), icon_tight)
print(f"Square icon: {square_icon.size}")

# Save all favicon sizes
for size in [16, 32, 48, 64, 128, 180, 192, 512]:
    square_icon.resize((size, size), Image.LANCZOS).save(f"{OUT}/icon-{size}.png")

# Public root favicons (browser default discovery)
square_icon.resize((16, 16), Image.LANCZOS).save(f"{PUBLIC}/favicon-16.png")
square_icon.resize((32, 32), Image.LANCZOS).save(f"{PUBLIC}/favicon-32.png")
square_icon.resize((180, 180), Image.LANCZOS).save(f"{PUBLIC}/apple-touch-icon.png")

# Multi-size favicon.ico
icon_16 = square_icon.resize((16, 16), Image.LANCZOS)
icon_32 = square_icon.resize((32, 32), Image.LANCZOS)
icon_48 = square_icon.resize((48, 48), Image.LANCZOS)
icon_32.save(f"{PUBLIC}/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

# Also save the icon variants used by manifest
square_icon.resize((192, 192), Image.LANCZOS).save(f"{OUT}/android-chrome-192x192.png")
square_icon.resize((512, 512), Image.LANCZOS).save(f"{OUT}/android-chrome-512x512.png")
square_icon.resize((180, 180), Image.LANCZOS).save(f"{OUT}/apple-touch-icon.png")

print("✓ Saved favicon variants (from Image 2)")

# ───────────────────────────────────────────────────────────────────────────
# 2. LOGO MARK: Image 1 - extract tulip/flame from black background
# ───────────────────────────────────────────────────────────────────────────
logo_src = Image.open(f"{UPLOAD}/Glossy Tulip Crown Logo Emblem.png").convert("RGBA")
print(f"\nLogo source: {logo_src.size}, mode={logo_src.mode}")

arr = np.array(logo_src)
H, W = arr.shape[:2]

# Sample some pixels to understand the image
print(f"Top-left pixel: {arr[0, 0]}")
print(f"Center pixel: {arr[H//2, W//2]}")

# Image 1 is on a BLACK background (not transparent)
# We need to remove the black background, keeping only the colorful tulip/flame mark
# Strategy: Use saturation/value to find the colored mark, make black pixels transparent

r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
a = arr[:, :, 3]

# Compute max and min channel
maxc = np.maximum(np.maximum(r, g), b).astype(np.float32)
minc = np.minimum(np.minimum(r, g), b).astype(np.float32)
# Saturation: how colorful (high = colorful, low = gray)
saturation = np.where(maxc > 0, (maxc - minc) / np.maximum(maxc, 1), 0).astype(np.float32)
# Value: brightness
value = maxc / 255.0

# The mark is colorful (orange/red/yellow) - high saturation
# Background is black - low value AND low saturation
# Stars above are also colored (gold/orange) - keep them

# Create alpha mask: pixels are "mark" if they have meaningful saturation OR are bright
# Black background: value < 0.1 and saturation < 0.15
# Some mark pixels may be dark (like shadows in the tulip) - keep if saturation is meaningful
mark_mask = (saturation > 0.15) | (value > 0.3) & (saturation > 0.05)
# Also exclude pure black
mark_mask = mark_mask & ~((value < 0.05) & (saturation < 0.05))

# Clean up: remove isolated noise pixels with morphological operations
from PIL import Image as PILImage
mask_img = PILImage.fromarray((mark_mask * 255).astype(np.uint8))
# Erode then dilate to remove noise
mask_img = mask_img.filter(ImageFilter.MinFilter(3))
mask_img = mask_img.filter(ImageFilter.MaxFilter(5))
mark_mask = np.array(mask_img) > 0

# Build new RGBA: keep RGB, use mark_mask as alpha (preserving original alpha where set)
new_alpha = np.where(mark_mask, 255, 0).astype(np.uint8)
# Smooth the alpha edges slightly
alpha_img = PILImage.fromarray(new_alpha)
alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(0.5))
# Re-threshold to keep crisp edges but anti-aliased
new_alpha = np.array(alpha_img)

result = arr.copy()
result[:, :, 3] = new_alpha

# Tight crop to content
final_alpha = result[:, :, 3]
content_rows = np.where((final_alpha > 30).any(axis=1))[0]
content_cols = np.where((final_alpha > 30).any(axis=0))[0]
logo_mark = Image.fromarray(result, "RGBA").crop((
    content_cols[0], content_rows[0],
    content_cols[-1] + 1, content_rows[-1] + 1
))
print(f"Logo mark tight crop: {logo_mark.size}")

# Save the logo mark (transparent background)
logo_mark.save(f"{OUT}/logo-mark.png")

# Save various sizes for different uses
for size in [32, 48, 64, 96, 128, 256, 512]:
    resized = logo_mark.resize((size, size), Image.LANCZOS)
    resized.save(f"{OUT}/logo-mark-{size}.png")

print("✓ Saved logo-mark.png at multiple sizes (from Image 1)")

# ───────────────────────────────────────────────────────────────────────────
# 3. Create white silhouette version for dark backgrounds
# ───────────────────────────────────────────────────────────────────────────
arr_w = np.array(logo_mark).copy()
# Set all RGB to white, preserve alpha
arr_w[:, :, 0] = 255
arr_w[:, :, 1] = 255
arr_w[:, :, 2] = 255
white_mark = Image.fromarray(arr_w, "RGBA")
white_mark.save(f"{OUT}/logo-mark-light.png")
for size in [32, 48, 64, 128, 256]:
    white_mark.resize((size, size), Image.LANCZOS).save(f"{OUT}/logo-mark-light-{size}.png")

print("✓ Saved white silhouette variants")

# ───────────────────────────────────────────────────────────────────────────
# 4. Create OG image (logo on warm cream background)
# ───────────────────────────────────────────────────────────────────────────
og = Image.new("RGB", (1200, 630), (250, 246, 238))  # warm cream
# Paste logo centered, large
logo_large = logo_mark.resize((500, 500), Image.LANCZOS)
# Center it
fx = (1200 - 500) // 2
fy = (630 - 500) // 2 - 30
og.paste(logo_large, (fx, fy), logo_large)
og.save(f"{OUT}/og-image.png", "PNG")

print("✓ Saved og-image.png")

print("\n✅ All brand assets generated")
print("\nFinal files in /public/brand/:")
for f in sorted(os.listdir(OUT)):
    if not f.startswith("_"):
        path = os.path.join(OUT, f)
        size = os.path.getsize(path)
        print(f"  {f} ({size:,} bytes)")
print("\nFiles in /public/:")
for f in sorted(os.listdir(PUBLIC)):
    if f.endswith((".png", ".ico")):
        path = os.path.join(PUBLIC, f)
        size = os.path.getsize(path)
        print(f"  {f} ({size:,} bytes)")
