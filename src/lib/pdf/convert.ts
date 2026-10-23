import { PDFDocument } from "pdf-lib";
import { baseName, nextFrame, readBytes, type Output, type Report } from "../files";
import { canvasToBlob, openPdfjs, renderPage } from "./core";

export type PageSize = "fit" | "a4" | "letter";
export type Orientation = "auto" | "portrait" | "landscape";

const SIZES = { a4: [595.28, 841.89], letter: [612, 792] } as const;

async function prepareImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d")!;
  const png = file.type === "image/png" || file.type === "image/gif" || file.type === "image/webp";
  if (!png) {
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await canvasToBlob(canvas, png ? "image/png" : "image/jpeg", 0.92);
  return { bytes: await readBytes(blob), png, width: canvas.width, height: canvas.height };
}

/**
 * Puts each image on its own page. EXIF rotation from phone photos is applied on the way in.
 */
export async function imagesToPdf(files: File[], size: PageSize, orientation: Orientation, margin: number, report: Report) {
  const doc = await PDFDocument.create();
  for (const [index, file] of files.entries()) {
    const image = await prepareImage(file);
    const embedded = image.png ? await doc.embedPng(image.bytes) : await doc.embedJpg(image.bytes);
    const landscape = orientation === "landscape" || (orientation === "auto" && image.width > image.height);
    let [pageWidth, pageHeight] =
      size === "fit" ? [image.width * 0.75 + margin * 2, image.height * 0.75 + margin * 2] : [...SIZES[size]];
    if (size !== "fit" && landscape) [pageWidth, pageHeight] = [pageHeight, pageWidth];
    const page = doc.addPage([pageWidth, pageHeight]);
    const scale = Math.min((pageWidth - margin * 2) / image.width, (pageHeight - margin * 2) / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    page.drawImage(embedded, { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height });
    report((index + 1) / files.length);
    await nextFrame();
  }
  return doc.save({ useObjectStreams: true });
}

export async function pdfToImages(input: Uint8Array, name: string, format: "jpg" | "png", dpi: number, report: Report) {
  const doc = await openPdfjs(input);
  const outputs: Output[] = [];
  const digits = String(doc.numPages).length;
  for (let n = 1; n <= doc.numPages; n++) {
    const canvas = await renderPage(doc, n, dpi / 72);
    const blob = await canvasToBlob(canvas, format === "jpg" ? "image/jpeg" : "image/png", 0.9);
    outputs.push({ name: `${baseName(name)}-${String(n).padStart(digits, "0")}.${format}`, data: blob });
    canvas.width = canvas.height = 0;
    report(n / doc.numPages);
  }
  await doc.loadingTask.destroy();
  return outputs;
}

/**
 * Pulls the text out of every page, keeping line breaks and separating pages with a blank line.
 */
export async function extractText(input: Uint8Array, report: Report) {
  const doc = await openPdfjs(input);
  const pages: string[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    let text = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      text += item.str + (item.hasEOL ? "\n" : "");
    }
    pages.push(text.replace(/[ \t]+\n/g, "\n").trim());
    page.cleanup();
    report(n / doc.numPages);
  }
  await doc.loadingTask.destroy();
  return pages.join("\n\n");
}
