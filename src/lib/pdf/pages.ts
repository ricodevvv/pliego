import { degrees, PDFDocument } from "pdf-lib";
import { nextFrame, ToolError, type Report } from "../files";
import { loadPdf, normalizeAngle } from "./core";

export async function mergePdfs(inputs: Uint8Array[], report: Report) {
  const merged = await PDFDocument.create();
  for (const [index, bytes] of inputs.entries()) {
    const source = await loadPdf(bytes);
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
    report((index + 1) / inputs.length);
    await nextFrame();
  }
  return merged.save({ useObjectStreams: true });
}

/**
 * Parses "1-3, 5, 8-" into groups of 0-based page indices. Throws when a range is empty or
 * points past the last page.
 */
export function parseRanges(text: string, total: number) {
  const groups: number[][] = [];
  for (const part of text.split(/[,;\s]+/).filter(Boolean)) {
    const match = /^(\d*)(?:(-)(\d*))?$/.exec(part);
    if (!match) throw new ToolError("ranges");
    const from = match[1] ? Number(match[1]) : 1;
    const to = match[2] ? (match[3] ? Number(match[3]) : total) : from;
    if (from < 1 || to > total || from > to) throw new ToolError("ranges");
    groups.push(Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i));
  }
  if (!groups.length) throw new ToolError("ranges");
  return groups;
}

export interface PageEdit {
  index: number;
  rotation: number;
}

/**
 * Builds a new PDF from the pages of `input`, in the given order and with extra rotation added.
 */
export async function rebuildPdf(input: Uint8Array, pages: PageEdit[]) {
  if (!pages.length) throw new ToolError("noPages");
  const source = await loadPdf(input);
  const output = await PDFDocument.create();
  const copied = await output.copyPages(
    source,
    pages.map((page) => page.index),
  );
  copied.forEach((page, i) => {
    page.setRotation(degrees(normalizeAngle(page.getRotation().angle + pages[i].rotation)));
    output.addPage(page);
  });
  return output.save({ useObjectStreams: true });
}

export async function extractGroups(input: Uint8Array, groups: number[][], report: Report) {
  const source = await loadPdf(input);
  const outputs: Uint8Array[] = [];
  for (const [index, group] of groups.entries()) {
    const output = await PDFDocument.create();
    const pages = await output.copyPages(source, group);
    pages.forEach((page) => output.addPage(page));
    outputs.push(await output.save({ useObjectStreams: true }));
    report((index + 1) / groups.length);
    await nextFrame();
  }
  return outputs;
}

export async function pageCount(input: Uint8Array) {
  return (await loadPdf(input)).getPageCount();
}
