"""
Extract logo and favicon from UtsavAI Festive Brand Identity image.
Strategy:
1. The source image has a transparent background (RGBA, black pixels are actually transparent).
2. Left side: full logo with flower mark + "UtsavAI" wordmark + tagline
3. Right side: app icon (flower mark on cream rounded square)

We need:
- favicon.ico / favicon.png: just the flower mark
- logo-icon.png: flower mark for use in nav (transparent bg)
- logo-full.png: full horizontal lockup (flower + UtsavAI text) for hero/footer
- apple-touch-icon.png: app icon style (flower on cream rounded square)
"""
from PIL import Image, ImageDraw, ImageFilter
import os

SRC = "/home/z/my-project/upload/UtsavAI Festive Brand Identity.png"
OUT = "/home/z/my-project/public/brand"
os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert("RGBA")
W, H = img.size
print(f"Source: {W}x{H}")

# The image is 1774x887. Left half ~ 0-887, right half ~ 887-1774
# Let's find the actual bounding box of non-transparent content
# But first, separate left (full logo) and right (app icon)
left_half = img.crop((0, 0, W // 2, H))
right_half = img.crop((W // 2, 0, W, H))

# Find bbox of non-transparent pixels in each half
def bbox_alpha(im):
    alpha = im.split()[-1]
    bbox = alpha.getbbox()
    return bbox

left_bbox = bbox_alpha(left_half)
right_bbox = bbox_alpha(right_half)
print(f"Left content bbox: {left_bbox}")
print(f"Right content bbox: {right_bbox}")

# Save full extracted versions
left_crop = left_half.crop(left_bbox)
right_crop = right_half.crop(right_bbox)
left_crop.save(f"{OUT}/_debug_left.png")
right_crop.save(f"{OUT}/_debug_right.png")
print(f"Left crop size: {left_crop.size}")
print(f"Right crop size: {right_crop.size}")

# Now analyze the right side (app icon). It's a flower on a cream/white rounded square.
# Let's understand the icon better - sample colors
icon = right_crop
print(f"Icon top-left: {icon.getpixel((10, 10))}")
print(f"Icon center: {icon.getpixel((icon.size[0]//2, icon.size[1]//2))}")

# The right side is the app icon - flower on cream rounded square background
# We can use this as apple-touch-icon and favicon
# Save various sizes
for size in [16, 32, 48, 64, 128, 180, 192, 512]:
    resized = right_crop.resize((size, size), Image.LANCZOS)
    resized.save(f"{OUT}/icon-{size}.png")
    print(f"Saved icon-{size}.png")

# Save the apple-touch-icon
right_crop.resize((180, 180), Image.LANCZOS).save(f"{OUT}/apple-touch-icon.png")
right_crop.resize((192, 192), Image.LANCZOS).save(f"{OUT}/android-chrome-192x192.png")
right_crop.resize((512, 512), Image.LANCZOS).save(f"{OUT}/android-chrome-512x512.png")

# Save favicon
right_crop.resize((32, 32), Image.LANCZOS).save(f"{OUT}/favicon-32.png")
right_crop.resize((16, 16), Image.LANCZOS).save(f"{OUT}/favicon-16.png")

# Save the full left logo (transparent background)
left_crop.save(f"{OUT}/logo-full.png")

# Now extract just the flower mark from the left logo (top portion above the text)
# Let's analyze the left logo structure
print(f"\nLeft logo size: {left_crop.size}")
# Sample to find where the flower ends and text begins
lw, lh = left_crop.size
# The flower should be in the top portion, text below
# Let's check by sampling horizontal bands
for y in range(0, lh, lh // 10):
    row_alpha = [left_crop.getpixel((x, y))[3] for x in range(0, lw, 10)]
    nonzero = sum(1 for a in row_alpha if a > 50)
    print(f"y={y}: {nonzero}/{len(row_alpha)} opaque pixels")
