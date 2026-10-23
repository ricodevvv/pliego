"use client";

import { useEffect } from "react";
import { ToolShell } from "@/components/tool-shell";
import { baseName, readBytes } from "@/lib/files";
import { convertOffice } from "@/lib/pdf/office";
import type { Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

/**
 * Runs LibreOffice in the browser. The page has to be cross-origin isolated, which only happens on
 * a full page load, so a client-side navigation here triggers one reload.
 */
export default function Office({ tool }: { tool: Tool }) {
  const t = useDictionary();
  const toWord = tool.slug === "pdf-to-word";

  useEffect(() => {
    const key = `reloaded:${tool.slug}`;
    if (!window.crossOriginIsolated && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      window.location.reload();
    }
  }, [tool.slug]);

  return (
    <ToolShell
      accept={tool.accept}
      multiple={tool.multiple}
      zipName={toWord ? "word.zip" : "pdf.zip"}
      run={async (files, report) => {
        const outputs = [];
        for (const [index, file] of files.entries()) {
          const data = await convertOffice(await readBytes(file), file.name, toWord ? "docx" : "pdf", (value) =>
            report((index + value) / files.length),
          );
          outputs.push({
            name: `${baseName(file.name)}.${toWord ? "docx" : "pdf"}`,
            data,
            type: toWord ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/pdf",
          });
        }
        return { outputs };
      }}
    >
      {() => (
        <p className="rounded-xl border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
          {t.options.officeHint} {toWord && t.options.pdfToWordHint}
        </p>
      )}
    </ToolShell>
  );
}
