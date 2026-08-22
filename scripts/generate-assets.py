#!/usr/bin/env python3
"""Copy the real Mise icon and mint placeholder / OG images."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ICON_SRC = Path("/Users/carlos/Documents/Mise Icons")
INK = (12, 13, 16, 255)
INK_EDGE = (35, 38, 44, 255)
PAPER = (244, 244, 242, 255)
MUTE = (124, 130, 140, 255)


def font(path: str, size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size, index=index)


def neue(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return font("/System/Library/Fonts/HelveticaNeue.ttc", size, 1 if bold else 0)


def menlo(size: int) -> ImageFont.FreeTypeFont:
    return font("/System/Library/Fonts/Menlo.ttc", size, 0)


def cover(src: Image.Image, size: int) -> Image.Image:
    fitted = src.copy()
    fitted.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - fitted.width) // 2
    y = (size - fitted.height) // 2
    canvas.paste(fitted, (x, y), fitted)
    return canvas


def labeled(path: Path, size: tuple[int, int], name: str) -> None:
    img = Image.new("RGBA", size, INK_EDGE)
    draw = ImageDraw.Draw(img)
    inset = 2
    draw.rectangle(
        [inset, inset, size[0] - inset - 1, size[1] - inset - 1],
        outline=(28, 30, 36, 255),
    )
    f = menlo(28 if size[0] >= 1000 else 22)
    bbox = draw.textbbox((0, 0), name, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(
        ((size[0] - tw) / 2, (size[1] - th) / 2 - bbox[1]),
        name,
        font=f,
        fill=MUTE,
    )
    img.save(path, "PNG", optimize=True)


def write_og(icon: Image.Image) -> None:
    w, h = 1200, 630
    img = Image.new("RGBA", (w, h), INK)
    draw = ImageDraw.Draw(img)

    mark = cover(icon, 360)
    img.alpha_composite(mark, (72, (h - mark.height) // 2))

    x = 460
    ef = menlo(15)
    cursor = x
    for ch in "MISE":
        draw.text((cursor, 198), ch, font=ef, fill=MUTE)
        cb = draw.textbbox((0, 0), ch, font=ef)
        cursor += (cb[2] - cb[0]) + 3

    hf = neue(52, bold=True)
    lines = ["Every window", "where it belongs"]
    y = 236
    for line in lines:
        draw.text((x, y), line, font=hf, fill=PAPER)
        y += 62

    img.convert("RGB").save(PUBLIC / "og.png", "PNG", optimize=True)


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    src = ICON_SRC / "preview" / "mise_1024.png"
    icon = Image.open(src).convert("RGBA")
    icon.save(PUBLIC / "icon.png", "PNG", optimize=True)

    favicon_src = ICON_SRC / "AppIcon.appiconset" / "icon_32x32.png"
    Image.open(favicon_src).convert("RGBA").save(PUBLIC / "favicon.png", "PNG")

    touch = Image.new("RGBA", (180, 180), INK)
    touch.alpha_composite(cover(icon, 180), (0, 0))
    touch.save(PUBLIC / "apple-touch-icon.png", "PNG", optimize=True)

    for i in range(1, 4):
        labeled(PUBLIC / f"set-{i}.png", (2400, 1500), f"set-{i}.png")
    labeled(PUBLIC / "feature-capture.png", (1280, 960), "feature-capture.png")
    labeled(PUBLIC / "feature-displays.png", (1280, 960), "feature-displays.png")
    labeled(PUBLIC / "feature-launch.png", (1280, 960), "feature-launch.png")

    write_og(icon)
    print(f"Wrote assets to {PUBLIC}")


if __name__ == "__main__":
    main()
