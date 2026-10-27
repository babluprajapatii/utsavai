"""Generate an SVG version of the logo mark for sharper rendering at small sizes.
We'll create a stylized tulip/flower mark inspired by the brand image."""
import os

OUT = "/home/z/my-project/public/brand"

# Color values from the brand image:
# - Petal gradient: orange (#e87044) to coral (#d35c3d) 
# - Center flame: yellow-orange (#f5a623)
# - Stars above: gold (#e8b444)
# Let's extract actual colors by sampling

from PIL import Image
import numpy as np

img = Image.open("/home/z/my-project/public/brand/logo-mark.png").convert("RGBA")
arr = np.array(img)

# Find non-transparent pixels and group by color
mask = arr[:, :, 3] > 100
pixels = arr[mask][:, :3]

# Cluster colors - find the dominant orange/coral
from collections import Counter
# Quantize to reduce variety
qpixels = (pixels // 16) * 16
colors = Counter([tuple(p) for p in qpixels])
print("Top 10 colors:")
for c, n in colors.most_common(10):
    print(f"  rgb{c}: {n}")

# Build SVG with a stylized tulip mark
# Based on the brand: tulip/flower with 4 diamond stars above
svg = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <defs>
    <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f08850"/>
      <stop offset="50%" stop-color="#e06a3d"/>
      <stop offset="100%" stop-color="#c5482b"/>
    </linearGradient>
    <linearGradient id="petalGradInner" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f5a623"/>
      <stop offset="100%" stop-color="#e06a3d"/>
    </linearGradient>
  </defs>
  
  <!-- Four diamond stars above the flower -->
  <g fill="#e8b444">
    <!-- Center top star (largest) -->
    <path d="M50 8 L52.5 13 L57.5 15.5 L52.5 18 L50 23 L47.5 18 L42.5 15.5 L47.5 13 Z" opacity="0.95"/>
    <!-- Left star -->
    <path d="M30 14 L32 18 L36 20 L32 22 L30 26 L28 22 L24 20 L28 18 Z" opacity="0.85"/>
    <!-- Right star -->
    <path d="M70 14 L72 18 L76 20 L72 22 L70 26 L68 22 L64 20 L68 18 Z" opacity="0.85"/>
    <!-- Top center smaller star -->
    <path d="M50 0 L51 2 L53 3 L51 4 L50 6 L49 4 L47 3 L49 2 Z" opacity="0.7"/>
  </g>
  
  <!-- Tulip/flower body -->
  <g>
    <!-- Outer petals (side) -->
    <path d="M28 42 C 22 36, 22 50, 28 58 C 32 64, 38 66, 42 62 L 42 50 C 38 44, 32 44, 28 42 Z" fill="url(#petalGrad)"/>
    <path d="M72 42 C 78 36, 78 50, 72 58 C 68 64, 62 66, 58 62 L 58 50 C 62 44, 68 44, 72 42 Z" fill="url(#petalGrad)"/>
    
    <!-- Main center petal (tulip cup) -->
    <path d="M35 45 C 35 32, 42 25, 50 25 C 58 25, 65 32, 65 45 C 65 55, 60 65, 50 70 C 40 65, 35 55, 35 45 Z" fill="url(#petalGrad)"/>
    
    <!-- Inner petal detail (lighter) -->
    <path d="M42 42 C 42 35, 46 30, 50 30 C 54 30, 58 35, 58 42 C 58 50, 55 58, 50 62 C 45 58, 42 50, 42 42 Z" fill="url(#petalGradInner)" opacity="0.7"/>
    
    <!-- Center flame -->
    <path d="M50 32 C 47 38, 48 45, 50 52 C 52 45, 53 38, 50 32 Z" fill="#f5c542" opacity="0.95"/>
    <circle cx="50" cy="44" r="2.5" fill="#f5e0a0" opacity="0.9"/>
  </g>
  
  <!-- Base/leaves -->
  <g fill="#a8442b" opacity="0.85">
    <path d="M42 68 C 40 73, 42 78, 48 80 L 52 80 C 58 78, 60 73, 58 68 L 50 72 Z"/>
  </g>
</svg>
"""

with open(f"{OUT}/logo-mark.svg", "w") as f:
    f.write(svg)
print(f"Saved logo-mark.svg ({len(svg)} bytes)")

# Also create a white silhouette version for dark backgrounds
svg_light = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <g fill="#ffffff">
    <!-- Four diamond stars above the flower -->
    <path d="M50 8 L52.5 13 L57.5 15.5 L52.5 18 L50 23 L47.5 18 L42.5 15.5 L47.5 13 Z" opacity="0.95"/>
    <path d="M30 14 L32 18 L36 20 L32 22 L30 26 L28 22 L24 20 L28 18 Z" opacity="0.85"/>
    <path d="M70 14 L72 18 L76 20 L72 22 L70 26 L68 22 L64 20 L68 18 Z" opacity="0.85"/>
    <path d="M50 0 L51 2 L53 3 L51 4 L50 6 L49 4 L47 3 L49 2 Z" opacity="0.7"/>
    
    <!-- Flower silhouette -->
    <path d="M28 42 C 22 36, 22 50, 28 58 C 32 64, 38 66, 42 62 L 42 50 C 38 44, 32 44, 28 42 Z"/>
    <path d="M72 42 C 78 36, 78 50, 72 58 C 68 64, 62 66, 58 62 L 58 50 C 62 44, 68 44, 72 42 Z"/>
    <path d="M35 45 C 35 32, 42 25, 50 25 C 58 25, 65 32, 65 45 C 65 55, 60 65, 50 70 C 40 65, 35 55, 35 45 Z"/>
    <path d="M42 68 C 40 73, 42 78, 48 80 L 52 80 C 58 78, 60 73, 58 68 L 50 72 Z"/>
  </g>
</svg>
"""

with open(f"{OUT}/logo-mark-light.svg", "w") as f:
    f.write(svg_light)
print(f"Saved logo-mark-light.svg ({len(svg_light)} bytes)")

print("\n✅ SVG logo marks created")
