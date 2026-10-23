import { StandardFonts } from "pdf-lib";
import type { Report } from "../files";
import { loadPdf, openPdfjs, renderPage, toPageSpace, visualSize } from "./core";

const SCALE = 2.5;

/**
 * Reads the text of every page with Tesseract and lays it over the original page as invisible,
 * selectable text. The page itself isn't touched, so nothing loses quality.
 */
export async function ocrPdf(input: Uint8Array, language: string, report: Report) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(language, 1, {
    logger: (message) => {
      if (message.status === "loading language traineddata") report(message.progress * 0.1, "language");
    },
  });
  const doc = await loadPdf(input);
  const rendered = await openPdfjs(input);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const supported = new Set(font.getCharacterSet());
  const pages = doc.getPages();
  let fullText = "";

  try {
    for (const [index, page] of pages.entries()) {
      report(0.1 + (index / pages.length) * 0.9, "page");
      const canvas = await renderPage(rendered, index + 1, SCALE);
      const { data } = await worker.recognize(canvas, {}, { blocks: true, text: true });
      fullText += `${data.text.trim()}\n\n`;
      const { height } = visualSize(page);
      const ratio = canvas.width / visualSize(page).width;
      for (const block of data.blocks ?? []) {
        for (const paragraph of block.paragraphs) {
          for (const line of paragraph.lines) {
            for (const word of line.words) {
              const text = Array.from(word.text)
                .filter((char) => supported.has(char.codePointAt(0)!))
                .join("");
              if (!text.trim() || word.confidence < 30) continue;
              const boxWidth = (word.bbox.x1 - word.bbox.x0) / ratio;
              const boxHeight = (word.bbox.y1 - word.bbox.y0) / ratio;
              const size = Math.max(1, Math.min(boxWidth / font.widthOfTextAtSize(text, 1), boxHeight * 1.4));
              const point = toPageSpace(page, word.bbox.x0 / ratio, height - word.bbox.y1 / ratio + boxHeight * 0.2);
              page.drawText(text, { x: point.x, y: point.y, size, font, opacity: 0, rotate: point.rotate });
            }
          }
        }
      }
      canvas.width = canvas.height = 0;
    }
  } finally {
    await worker.terminate();
    await rendered.loadingTask.destroy();
  }
  report(1);
  return { pdf: await doc.save({ useObjectStreams: true }), text: fullText.trim() };
}
