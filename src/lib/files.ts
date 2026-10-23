import { zipSync } from "fflate";
import type { Dictionary } from "./i18n";

export interface Output {
  name: string;
  data: Uint8Array | Blob;
  type?: string;
}

export type Report = (fraction: number, label?: string) => void;

/** An error whose code maps to a translated message in `errors`. */
export class ToolError extends Error {
  constructor(public code: keyof Dictionary["errors"], detail?: string) {
    super(detail ?? code);
  }
}

export async function readBytes(file: Blob) {
  return new Uint8Array(await file.arrayBuffer());
}

export function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function sizeOf(output: Output) {
  return output.data instanceof Blob ? output.data.size : output.data.byteLength;
}

export function toBlob(output: Output) {
  if (output.data instanceof Blob) return output.data;
  return new Blob([output.data as BlobPart], { type: output.type ?? "application/pdf" });
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function zipOutputs(outputs: Output[]) {
  const entries: Record<string, Uint8Array> = {};
  for (const output of outputs) {
    let name = output.name;
    for (let i = 2; entries[name]; i++) name = output.name.replace(/(\.[^.]+)?$/, `-${i}$1`);
    entries[name] = output.data instanceof Blob ? await readBytes(output.data) : output.data;
  }
  return new Blob([zipSync(entries, { level: 0 }) as BlobPart], { type: "application/zip" });
}

export function nextFrame() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
