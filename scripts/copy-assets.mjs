import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const modules = join(root, "node_modules");
const vendor = join(root, "public", "vendor");

const files = [
  ["pdfjs-dist/build/pdf.worker.min.mjs", "pdf.worker.min.mjs"],
  ["@neslinesli93/qpdf-wasm/dist/qpdf.wasm", "qpdf.wasm"],
  ["@neslinesli93/qpdf-wasm/dist/qpdf.js", "qpdf.js"],
  ["@matbee/libreoffice-converter/dist/browser.worker.global.js", "libreoffice/browser.worker.global.js"],
  ["@matbee/libreoffice-converter/wasm/soffice.js", "libreoffice/soffice.js"],
  ["@matbee/libreoffice-converter/wasm/soffice.worker.js", "libreoffice/soffice.worker.js"],
];

if (!process.env.NEXT_PUBLIC_OFFICE_ASSETS) {
  files.push(
    ["@matbee/libreoffice-converter/wasm/soffice.wasm", "libreoffice/soffice.wasm"],
    ["@matbee/libreoffice-converter/wasm/soffice.data", "libreoffice/soffice.data"],
  );
}

for (const [from, to] of files) {
  const target = join(vendor, to);
  mkdirSync(dirname(target), { recursive: true });
  if (!existsSync(target)) copyFileSync(join(modules, from), target);
}
