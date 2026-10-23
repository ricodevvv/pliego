# Pliego

Free PDF tools with no limits and no uploads: merge, split, organize, rotate, compress, OCR, convert to and from Word, Excel and PowerPoint, images, page numbers, watermarks, signatures, forms, passwords. In English and Spanish.

Everything runs in your browser. Your files never reach a server, which is also why it can be free without limits: there's no server doing the work.

Live at https://pdf.ricodevvv.com

## What runs where

| Tool | Engine |
| --- | --- |
| Merge, split, organize, rotate, page numbers, watermark, sign, forms | [pdf-lib](https://pdf-lib.js.org) |
| Previews, PDF to images, text extraction | [pdf.js](https://mozilla.github.io/pdf.js/) |
| Compress | Images re-encoded with the browser's canvas, then repacked with [qpdf](https://qpdf.sourceforge.io) |
| Protect and unlock | qpdf compiled to WebAssembly |
| OCR | [Tesseract.js](https://tesseract.projectnaptha.com), with the text laid invisibly over the original page |
| Word, Excel, PowerPoint | LibreOffice compiled to WebAssembly ([@matbee/libreoffice-converter](https://github.com/matbeedotcom/libreoffice-document-converter)) |

## Running it

```bash
pnpm install
pnpm dev
```

`predev` and `prebuild` copy the workers and WebAssembly files from `node_modules` into `public/vendor`.

LibreOffice is about 250 MB (70 MB compressed). Set `NEXT_PUBLIC_OFFICE_ASSETS` to a URL that serves `soffice.wasm` and `soffice.data` with CORS (Cloudflare R2 works well, it has no egress fees) and they won't be bundled with the site. The Office tool pages are served with COOP/COEP headers because LibreOffice needs SharedArrayBuffer.

Set `SITE_URL` to the real domain so Open Graph images and the sitemap point to it.

## Adding a tool

1. Add it to `TOOLS` in `src/lib/tools.ts`, with its title and description in both languages.
2. Write the component in `src/components/tools`, using `ToolShell` for the upload, progress and download parts.
3. Register it in `src/components/tool-loader.tsx`.

## License

MIT. LibreOffice is MPL-2.0, qpdf is Apache-2.0, Tesseract is Apache-2.0 and pdf.js is Apache-2.0.
