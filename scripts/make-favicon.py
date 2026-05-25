#!/usr/bin/env python3
"""
Composite the transparent Bhuk Foods logo onto a circular white background.
Outputs are written to app/icon.png and app/apple-icon.png, which Next.js
auto-picks up as the favicon + Apple touch icon. Run from repo root.

The logo is scaled to fill the inscribed square inside the white circle as
large as it can sit without kissing the circle's edge (~96% of the canvas).
PNG corners outside the circle stay transparent, so the icon appears as a
floating white disk in the browser tab.
"""
import os
from PIL import Image, ImageDraw

SRC = "Logo/Logo 20260524 1223 transparent.png"
SIZE = 512  # favicon master size, browsers scale down as needed

# 1. White circle on a transparent canvas.
canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(canvas)
draw.ellipse((0, 0, SIZE - 1, SIZE - 1), fill=(255, 255, 255, 255))

# 2. Logo, resized to fit slightly inside the circle.
logo = Image.open(SRC).convert("RGBA")
LOGO_SIZE = int(SIZE * 0.96)  # leave ~2% inset all around so the logo doesn't
                              # crowd the white edge
logo = logo.resize((LOGO_SIZE, LOGO_SIZE), Image.LANCZOS)

# 3. Centre the logo on the canvas, alpha-composited.
offset = ((SIZE - LOGO_SIZE) // 2, (SIZE - LOGO_SIZE) // 2)
canvas.alpha_composite(logo, dest=offset)

os.makedirs("app", exist_ok=True)
os.makedirs("public", exist_ok=True)

# Master 512×512 for the favicon + apple touch icon. Next.js auto-detects
# app/icon.* and app/apple-icon.* as the right meta tags.
canvas.save("app/icon.png", "PNG", optimize=True)
canvas.save("app/apple-icon.png", "PNG", optimize=True)

# PWA manifest icons. 192 + 512 in /public.
canvas.resize((192, 192), Image.LANCZOS).save("public/icon-192.png", "PNG", optimize=True)
canvas.save("public/icon-512.png", "PNG", optimize=True)

# Legacy iOS Home Screen icon at 180×180.
canvas.resize((180, 180), Image.LANCZOS).save("public/apple-touch-icon.png", "PNG", optimize=True)

print(f"wrote app/icon.png, app/apple-icon.png and public/icon-{{192,512}}.png "
      f"+ public/apple-touch-icon.png; logo {LOGO_SIZE}px on a white circle")
