import { ToolError } from "../files";

interface QpdfModule {
  FS: {
    writeFile(path: string, data: Uint8Array): void;
    readFile(path: string): Uint8Array;
  };
  callMain(args: string[]): number;
}

type CreateModule = (options: Record<string, unknown>) => Promise<QpdfModule>;

let loader: Promise<CreateModule> | undefined;

function loadQpdf() {
  loader ??= new Promise<CreateModule>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/vendor/qpdf.js";
    script.onload = () => resolve((window as unknown as { Module: CreateModule }).Module);
    script.onerror = () => {
      loader = undefined;
      reject(new Error("Couldn't load qpdf"));
    };
    document.head.append(script);
  });
  return loader;
}

/**
 * Runs qpdf on one PDF and returns the result. A fresh module is created every time, since qpdf
 * exits after each run.
 */
export async function runQpdf(input: Uint8Array, args: string[]) {
  const createModule = await loadQpdf();
  const errors: string[] = [];
  const qpdf = await createModule({
    locateFile: () => "/vendor/qpdf.wasm",
    noInitialRun: true,
    print: () => {},
    printErr: (line: string) => errors.push(line),
  });
  qpdf.FS.writeFile("/input.pdf", input);
  let code: number;
  const consoleError = console.error;
  const consoleWarn = console.warn;
  console.error = console.warn = (...line: unknown[]) => errors.push(line.join(" "));
  try {
    code = qpdf.callMain(["/input.pdf", ...args, "/output.pdf"]);
  } catch (error) {
    code = typeof (error as { status?: number }).status === "number" ? (error as { status: number }).status : 2;
    errors.push(String(error));
  } finally {
    console.error = consoleError;
    console.warn = consoleWarn;
  }
  const log = errors.join("\n");
  if (/invalid password/i.test(log)) throw new ToolError("password", log);
  if (code !== 0 && code !== 3) throw new ToolError("invalid", log);
  return qpdf.FS.readFile("/output.pdf");
}

export function encryptPdf(input: Uint8Array, password: string) {
  return runQpdf(input, ["--encrypt", password, password, "256", "--"]);
}

export function decryptPdf(input: Uint8Array, password: string) {
  return runQpdf(input, [`--password=${password}`, "--decrypt"]);
}

export function optimizePdf(input: Uint8Array) {
  return runQpdf(input, ["--object-streams=generate", "--compress-streams=y", "--recompress-flate", "--compression-level=9"]);
}
