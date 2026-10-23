"use client";

import { useState } from "react";
import { Choice, Options } from "@/components/fields";
import { ToolShell } from "@/components/tool-shell";
import { baseName, readBytes } from "@/lib/files";
import { ocrPdf } from "@/lib/pdf/ocr";
import type { Tool } from "@/lib/tools";
import { useDictionary, useLocale } from "@/lib/use-dictionary";

const LANGUAGES = [
  { value: "spa", label: "Español" },
  { value: "eng", label: "English" },
  { value: "spa+eng", label: "Español + English" },
  { value: "por", label: "Português" },
  { value: "fra", label: "Français" },
  { value: "deu", label: "Deutsch" },
  { value: "ita", label: "Italiano" },
];

export default function Ocr({ tool }: { tool: Tool }) {
  const t = useDictionary();
  const locale = useLocale();
  const [language, setLanguage] = useState(locale === "es" ? "spa" : "eng");
  return (
    <ToolShell
      accept={tool.accept}
      multiple={false}
      run={async ([file], report) => {
        const { pdf, text } = await ocrPdf(await readBytes(file), language, report);
        return {
          outputs: [
            { name: `${baseName(file.name)}-ocr.pdf`, data: pdf },
            { name: `${baseName(file.name)}.txt`, data: new Blob([text], { type: "text/plain;charset=utf-8" }) },
          ],
          text,
        };
      }}
      zipName="ocr.zip"
    >
      {() => (
        <Options>
          <Choice label={t.options.language} value={language} onChange={setLanguage} className="sm:col-span-2" options={LANGUAGES} />
          <p className="text-sm text-muted-foreground sm:col-span-2">
            {t.options.ocrHint} {t.options.ocrModel}
          </p>
        </Options>
      )}
    </ToolShell>
  );
}
