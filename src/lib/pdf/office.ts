import type { WorkerBrowserConverter } from "@matbee/libreoffice-converter/browser";
import { ToolError, type Report } from "../files";

const BASE = "/vendor/libreoffice/";
const HEAVY = process.env.NEXT_PUBLIC_OFFICE_ASSETS ?? BASE;

let converter: Promise<WorkerBrowserConverter> | undefined;
let listener: Report | undefined;

/**
 * Starts LibreOffice in a worker once and reuses it. Needs a cross-origin isolated page, since
 * LibreOffice uses SharedArrayBuffer for its threads.
 */
export function getConverter(report: Report) {
  listener = report;
  if (!window.crossOriginIsolated) throw new ToolError("office");
  converter ??= import("@matbee/libreoffice-converter/browser").then(async ({ WorkerBrowserConverter }) => {
    const instance = new WorkerBrowserConverter({
      sofficeJs: `${BASE}soffice.js`,
      sofficeWorkerJs: `${BASE}soffice.worker.js`,
      browserWorkerJs: `${BASE}browser.worker.global.js`,
      sofficeWasm: `${HEAVY}soffice.wasm`,
      sofficeData: `${HEAVY}soffice.data`,
      onProgress: (progress) => listener?.(Math.min(0.95, (progress.percent ?? 0) / 100), "loading"),
    });
    await instance.initialize();
    return instance;
  });
  converter.catch(() => {
    converter = undefined;
  });
  return converter;
}

export async function convertOffice(input: Uint8Array, filename: string, format: "pdf" | "docx", report: Report) {
  const instance = await getConverter(report);
  report(0.97, "converting");
  const result = await instance.convert(input, { outputFormat: format }, filename);
  report(1);
  return result.data;
}
