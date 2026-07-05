#!/usr/bin/env python3
"""
Extract pages from Amelia's portfolio PDF as web-ready JPEGs.

Usage:
    pip install pymupdf pillow
    python extract_pdf_images.py Amelia_Forman_Portfolio_2026.pdf

Output:
    extracted/page-001.jpg, page-002.jpg, ...
    (max 2400px on the long edge, JPEG quality 85 — sharp enough for
     full-width display, small enough to load fast)

Then sort them into the site:
    images/<project-slug>/cover.jpg   ← the hero shot for the homepage index
    images/<project-slug>/01.jpg, 02.jpg, ...

If the PDF contains discrete embedded photos (rather than flattened
composed pages), run with --embedded to pull those instead:
    python extract_pdf_images.py portfolio.pdf --embedded
"""

import io
import sys
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image

MAX_EDGE = 2400
QUALITY = 85


def save_jpg(img: Image.Image, path: Path):
    if img.mode != "RGB":
        img = img.convert("RGB")
    if max(img.size) > MAX_EDGE:
        img.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
    img.save(path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    print(f"  wrote {path}  ({path.stat().st_size // 1024} KB)")


def render_pages(doc, out: Path):
    for i, page in enumerate(doc, 1):
        # 2x zoom ≈ 144 DPI render before downscale — crisp for web
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        save_jpg(img, out / f"page-{i:03d}.jpg")


def extract_embedded(doc, out: Path):
    n = 0
    for pno in range(len(doc)):
        for xref, *_ in doc.get_page_images(pno):
            info = doc.extract_image(xref)
            img = Image.open(io.BytesIO(info["image"]))
            if min(img.size) < 400:  # skip logos/icons
                continue
            n += 1
            save_jpg(img, out / f"img-{n:03d}-p{pno + 1}.jpg")
    if n == 0:
        print("No embedded images found — the PDF is probably flattened.")
        print("Re-run without --embedded to render pages instead.")


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    pdf = Path(sys.argv[1])
    out = Path("extracted")
    out.mkdir(exist_ok=True)
    doc = fitz.open(pdf)
    print(f"{pdf.name}: {len(doc)} pages")
    if "--embedded" in sys.argv:
        extract_embedded(doc, out)
    else:
        render_pages(doc, out)
    print(f"\nDone. Review the files in {out}/ and sort them into images/<slug>/")


if __name__ == "__main__":
    main()
