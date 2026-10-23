import { degrees, EncryptedPDFError, PDFDocument, type PDFPage } from "pdf-lib";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { ToolError } from "../files";

/**
 * Opens a PDF with pdf-lib, turning its errors into ones the UI can explain.
 */
export async function loadPdf(bytes: Uint8Array) {
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    if (error instanceof EncryptedPDFError || /encrypted/i.test(String(error))) throw new ToolError("encrypted");
    throw new ToolError("invalid", String(error));
  }
}

let pdfjs: Promise<typeof import("pdfjs-dist")> | undefined;

export function getPdfjs() {
  pdfjs ??= import("pdfjs-dist").then((module) => {
    module.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";
    return module;
  });
  return pdfjs;
}

/**
 * Opens a PDF with pdf.js for rendering and text extraction.
 */
export async function openPdfjs(bytes: Uint8Array, password?: string): Promise<PDFDocumentProxy> {
  const { getDocument, PasswordException } = await getPdfjs();
  try {
    return await getDocument({ data: bytes.slice(), password }).promise;
  } catch (error) {
    if (error instanceof PasswordException) throw new ToolError("encrypted");
    throw new ToolError("invalid", String(error));
  }
}

/**
 * Renders one page (1-based) to a canvas at the given scale, with the page's own rotation applied.
 */
export async function renderPage(doc: PDFDocumentProxy, pageNumber: number, scale: number) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  page.cleanup();
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))), type, quality),
  );
}

/** The size of a page as people see it, with its rotation applied. */
export function visualSize(page: PDFPage) {
  const { width, height } = page.getSize();
  const angle = normalizeAngle(page.getRotation().angle);
  return angle % 180 === 0 ? { width, height } : { width: height, height: width };
}

export function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

/**
 * Converts a point measured on the page as displayed (origin at the bottom left, rotation applied)
 * into the page's own coordinates, plus the rotation that keeps drawn content upright.
 */
export function toPageSpace(page: PDFPage, x: number, y: number) {
  const { width, height } = page.getSize();
  const box = page.getMediaBox();
  const angle = normalizeAngle(page.getRotation().angle);
  const point =
    angle === 90
      ? { x: width - y, y: x }
      : angle === 180
        ? { x: width - x, y: height - y }
        : angle === 270
          ? { x: y, y: height - x }
          : { x, y };
  return { x: point.x + box.x, y: point.y + box.y, rotate: degrees(angle) };
}
