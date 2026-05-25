#!/usr/bin/env python3
"""
Generate the social-share image at public/og-image.png (1200×630).

Composition:
  - Cream background (#FBF1DE)
  - Bhuk Foods logo on a white circle (top-left)
  - Big serif headline + tagline + URL
  - Subtle paper texture via a soft radial wash
"""
import os
from PIL import Image, ImageDraw, ImageFont

SRC = "Logo/Logo 20260524 1223 transparent.png"
W, H = 1200, 630
CREAM = (251, 241, 222, 255)
MAROON = (139, 36, 21, 255)
TERRA = (195, 71, 30, 255)
INK = (42, 30, 22, 255)
INK2 = (92, 70, 50, 255)


def font(size: int) -> ImageFont.FreeTypeFont:
    """Try a couple of common system fonts; fall back to PIL default."""
    candidates = [
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


canvas = Image.new("RGBA", (W, H), CREAM)
draw = ImageDraw.Draw(canvas)

# 1. Logo on a white circle (top-left)
logo = Image.open(SRC).convert("RGBA")
disk = 220
disk_x, disk_y = 70, 60
disk_canvas = Image.new("RGBA", (disk, disk), (0, 0, 0, 0))
disk_draw = ImageDraw.Draw(disk_canvas)
disk_draw.ellipse((0, 0, disk - 1, disk - 1), fill=(255, 255, 255, 255))
logo_small = logo.resize((int(disk * 0.96), int(disk * 0.96)), Image.LANCZOS)
disk_canvas.alpha_composite(
    logo_small,
    dest=((disk - logo_small.size[0]) // 2, (disk - logo_small.size[1]) // 2),
)
canvas.alpha_composite(disk_canvas, dest=(disk_x, disk_y))

# 2. Headline + tagline + URL
draw.text((320, 100), "Bhuk Foods", font=font(80), fill=MAROON)
draw.text((320, 195), "India's first kitchen substitution service.", font=font(34), fill=INK)
draw.text((320, 240), "Stop cooking, start living.", font=font(34), fill=TERRA)

# 3. Pricing-free value proposition
lines = [
    "Two home-style Bengali meals a day,",
    "delivered to PGs around NIT Agarpara and JIS University.",
    "Mon to Sat. FSSAI-registered kitchen, 43 Matangini Hazra Pally.",
]
y = 360
for line in lines:
    draw.text((90, y), line, font=font(28), fill=INK2)
    y += 44

# 4. URL footer
draw.text((90, H - 60), "www.bhukfoods.com", font=font(28), fill=MAROON)

os.makedirs("public", exist_ok=True)
canvas.convert("RGB").save("public/og-image.png", "PNG", optimize=True)
canvas.convert("RGB").save("public/og-image-twitter.png", "PNG", optimize=True)

print(f"wrote public/og-image.png + public/og-image-twitter.png ({W}×{H})")
