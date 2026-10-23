import { decodePDFRawStream, PDFArray, PDFDict, PDFName, PDFNumber, PDFRawStream, PDFRef } from "pdf-lib";
import { nextFrame, type Report } from "../files";
import { loadPdf } from "./core";
import { optimizePdf } from "./qpdf";

export type CompressionLevel = "low" | "medium" | "high";

const SETTINGS: Record<CompressionLevel, { maxSide: number; quality: number }> = {
  low: { maxSide: 2400, quality: 0.85 },
  medium: { maxSide: 1600, quality: 0.7 },
  high: { maxSide: 1100, quality: 0.5 },
};

function filters(dict: PDFDict) {
  const filter = dict.get(PDFName.of("Filter"));
  if (filter instanceof PDFName) return [filter.asString()];
  if (filter instanceof PDFArray) return filter.asArray().map((item) => (item as PDFName).asString());
  return [];
}

function colorComponents(dict: PDFDict) {
  const space = dict.lookup(PDFName.of("ColorSpace"));
  if (space instanceof PDFName) {
    const name = space.asString();
    return name === "/DeviceRGB" ? 3 : name === "/DeviceGray" ? 1 : 0;
  }
  if (space instanceof PDFArray && space.lookup(0) instanceof PDFName && (space.lookup(0) as PDFName).asString() === "/ICCBased") {
    const profile = space.lookup(1);
    const n = profile instanceof PDFRawStream ? profile.dict.lookup(PDFName.of("N")) : undefined;
    return n instanceof PDFNumber && (n.asNumber() === 3 || n.asNumber() === 1) ? n.asNumber() : 0;
  }
  return 0;
}

async function decodeImage(stream: PDFRawStream): Promise<ImageBitmap | undefined> {
  const dict = stream.dict;
  const kind = filters(dict);
  const components = colorComponents(dict);
  if (components === 0 || dict.has(PDFName.of("Decode")) || dict.get(PDFName.of("ImageMask"))) return undefined;

  if (kind.length === 1 && kind[0] === "/DCTDecode") {
    return createImageBitmap(new Blob([stream.contents as BlobPart], { type: "image/jpeg" }));
  }

  if (dict.has(PDFName.of("DecodeParms"))) return undefined;
  const bits = dict.lookup(PDFName.of("BitsPerComponent"));
  const width = (dict.lookup(PDFName.of("Width")) as PDFNumber).asNumber();
  const height = (dict.lookup(PDFName.of("Height")) as PDFNumber).asNumber();
  if (!(bits instanceof PDFNumber) || bits.asNumber() !== 8 || !kind.every((name) => name === "/FlateDecode")) return undefined;

  const raw = decodePDFRawStream(stream).decode();
  if (raw.length < width * height * components) return undefined;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0, j = 0; i < width * height; i++, j += components) {
    pixels[i * 4] = raw[j];
    pixels[i * 4 + 1] = raw[components === 3 ? j + 1 : j];
    pixels[i * 4 + 2] = raw[components === 3 ? j + 2 : j];
    pixels[i * 4 + 3] = 255;
  }
  return createImageBitmap(new ImageData(pixels, width, height));
}

async function encodeJpeg(bitmap: ImageBitmap, maxSide: number, quality: number) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
  return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height };
}

/**
 * Shrinks a PDF by re-encoding its photos and scans as smaller JPEGs, then repacking everything
 * with qpdf. Text and vector graphics are left alone. Returns the original if nothing got smaller.
 */
export async function compressPdf(input: Uint8Array, level: CompressionLevel, report: Report) {
  const { maxSide, quality } = SETTINGS[level];
  const doc = await loadPdf(input);
  const images = doc.context
    .enumerateIndirectObjects()
    .filter(([, object]) => object instanceof PDFRawStream && object.dict.get(PDFName.of("Subtype")) === PDFName.of("Image")) as [
    PDFRef,
    PDFRawStream,
  ][];
  const masks = new Set<string>();
  for (const [, stream] of images) {
    for (const key of ["SMask", "Mask"]) {
      const value = stream.dict.get(PDFName.of(key));
      if (value instanceof PDFRef) masks.add(value.toString());
    }
  }

  for (const [index, [ref, stream]] of images.entries()) {
    if (masks.has(ref.toString())) continue;
    report((index / Math.max(images.length, 1)) * 0.85);
    await nextFrame();
    try {
      const bitmap = await decodeImage(stream);
      if (!bitmap) continue;
      const encoded = await encodeJpeg(bitmap, maxSide, quality);
      bitmap.close();
      if (encoded.bytes.length >= stream.contents.length * 0.9) continue;
      const dict = stream.dict.clone(doc.context);
      dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
      dict.set(PDFName.of("Width"), PDFNumber.of(encoded.width));
      dict.set(PDFName.of("Height"), PDFNumber.of(encoded.height));
      dict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
      dict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
      dict.delete(PDFName.of("DecodeParms"));
      dict.set(PDFName.of("Length"), PDFNumber.of(encoded.bytes.length));
      doc.context.assign(ref, PDFRawStream.of(dict, encoded.bytes));
    } catch {
      continue;
    }
  }

  report(0.9);
  const saved = await doc.save({ useObjectStreams: true });
  let best = saved.length < input.length ? saved : input;
  try {
    const repacked = await optimizePdf(best);
    if (repacked.length < best.length) best = repacked;
  } catch {
    return best;
  }
  report(1);
  return best;
}
