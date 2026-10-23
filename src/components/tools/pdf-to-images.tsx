"use client";

import { useState } from "react";
import { Choice, Options } from "@/components/fields";
import { ToolShell } from "@/components/tool-shell";
import { readBytes } from "@/lib/files";
import { pdfToImages } from "@/lib/pdf/convert";
import type { Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

export default function PdfToImages({ tool }: { tool: Tool }) {
  const t = useDictionary();
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [dpi, setDpi] = useState<"72" | "150" | "300">("150");
  return (
    <ToolShell
      accept={tool.accept}
      multiple={false}
      run={async ([file], report) => ({ outputs: await pdfToImages(await readBytes(file), file.name, format, Number(dpi), report) })}
      zipName="images.zip"
    >
      {() => (
        <Options>
          <Choice
            label={t.options.format}
            value={format}
            onChange={setFormat}
            options={[
              { value: "jpg", label: "JPG" },
              { value: "png", label: "PNG" },
            ]}
          />
          <Choice
            label={t.options.resolution}
            value={dpi}
            onChange={setDpi}
            options={[
              { value: "72", label: "72 DPI" },
              { value: "150", label: "150 DPI" },
              { value: "300", label: "300 DPI" },
            ]}
          />
        </Options>
      )}
    </ToolShell>
  );
}
