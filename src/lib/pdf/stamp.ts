import { rgb, StandardFonts, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { loadPdf, toPageSpace, visualSize } from "./core";

export type Vertical = "top" | "bottom";
export type Horizontal = "left" | "center" | "right";

export interface NumberOptions {
  vertical: Vertical;
  horizontal: Horizontal;
  start: number;
  size: number;
  format: "n" | "n-total" | "page-n-total";
  pageWord: string;
  ofWord: string;
}

function label(options: NumberOptions, n: number, total: number) {
  if (options.format === "n") return String(n);
  if (options.format === "n-total") return `${n} / ${total}`;
  return `${options.pageWord} ${n} ${options.ofWord} ${total}`;
}

/**
 * Draws text so it reads upright on the page as displayed, starting at a point in display space.
 */
function drawUpright(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size: number, opacity = 1, color = rgb(0.1, 0.1, 0.1)) {
  const point = toPageSpace(page, x, y);
  page.drawText(text, { x: point.x, y: point.y, size, font, rotate: point.rotate, opacity, color });
}

export async function addPageNumbers(input: Uint8Array, options: NumberOptions) {
  const doc = await loadPdf(input);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = options.start + pages.length - 1;
  const margin = Math.max(18, options.size * 2);
  pages.forEach((page, i) => {
    const text = label(options, options.start + i, total);
    const width = font.widthOfTextAtSize(text, options.size);
    const { width: pageWidth, height: pageHeight } = visualSize(page);
    const x = options.horizontal === "left" ? margin : options.horizontal === "right" ? pageWidth - margin - width : (pageWidth - width) / 2;
    const y = options.vertical === "top" ? pageHeight - margin - options.size * 0.7 : margin;
    drawUpright(page, text, x, y, font, options.size);
  });
  return doc.save({ useObjectStreams: true });
}

export interface WatermarkOptions {
  text?: string;
  image?: { bytes: Uint8Array; type: string };
  size: number;
  opacity: number;
  angle: number;
  color: [number, number, number];
  tiled: boolean;
}

function rotatedOrigin(cx: number, cy: number, width: number, height: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: cx - (width / 2) * Math.cos(radians) + (height / 2) * Math.sin(radians),
    y: cy - (width / 2) * Math.sin(radians) - (height / 2) * Math.cos(radians),
  };
}

function stampAt(page: PDFPage, cx: number, cy: number, options: WatermarkOptions, font: PDFFont, image?: PDFImage) {
  const base = toPageSpace(page, 0, 0).rotate.angle;
  const angle = base + options.angle;
  const center = toPageSpace(page, cx, cy);
  if (image) {
    const width = (options.size / 100) * visualSize(page).width;
    const height = (width / image.width) * image.height;
    const origin = rotatedOrigin(center.x, center.y, width, height, angle);
    page.drawImage(image, { ...origin, width, height, opacity: options.opacity, rotate: { type: center.rotate.type, angle } });
    return;
  }
  const text = options.text ?? "";
  const width = font.widthOfTextAtSize(text, options.size);
  const height = font.heightAtSize(options.size, { descender: false });
  const origin = rotatedOrigin(center.x, center.y, width, height, angle);
  page.drawText(text, {
    ...origin,
    size: options.size,
    font,
    opacity: options.opacity,
    color: rgb(...options.color),
    rotate: { type: center.rotate.type, angle },
  });
}

export async function addWatermark(input: Uint8Array, options: WatermarkOptions) {
  const doc = await loadPdf(input);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const image = options.image
    ? options.image.type === "image/png"
      ? await doc.embedPng(options.image.bytes)
      : await doc.embedJpg(options.image.bytes)
    : undefined;
  for (const page of doc.getPages()) {
    const { width, height } = visualSize(page);
    if (!options.tiled) {
      stampAt(page, width / 2, height / 2, options, font, image);
      continue;
    }
    const step = Math.max(width, height) / 3;
    for (let x = step / 2; x < width; x += step) {
      for (let y = step / 2; y < height; y += step) stampAt(page, x, y, options, font, image);
    }
  }
  return doc.save({ useObjectStreams: true });
}

export interface Placement {
  page: number;
  x: number;
  y: number;
  width: number;
}

/**
 * Places a PNG (a signature) on a page. Position and width are fractions of the page as displayed,
 * measured from the top left.
 */
export async function placeImage(input: Uint8Array, png: Uint8Array, placement: Placement) {
  const doc = await loadPdf(input);
  const image = await doc.embedPng(png);
  const page = doc.getPage(placement.page);
  const { width: pageWidth, height: pageHeight } = visualSize(page);
  const width = placement.width * pageWidth;
  const height = (width / image.width) * image.height;
  const left = placement.x * pageWidth;
  const bottom = pageHeight - placement.y * pageHeight - height;
  const point = toPageSpace(page, left, bottom);
  page.drawImage(image, { x: point.x, y: point.y, width, height, rotate: point.rotate });
  return doc.save({ useObjectStreams: true });
}
