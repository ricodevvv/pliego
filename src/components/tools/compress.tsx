"use client";

import { useState } from "react";
import { Choice, Options } from "@/components/fields";
import { ToolShell } from "@/components/tool-shell";
import { baseName, readBytes } from "@/lib/files";
import { compressPdf, type CompressionLevel } from "@/lib/pdf/compress";
import type { Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

export default function Compress({ tool }: { tool: Tool }) {
  const t = useDictionary();
  const [level, setLevel] = useState<CompressionLevel>("medium");
  return (
    <ToolShell
      accept={tool.accept}
      multiple
      zipName="compressed.zip"
      run={async (files, report) => {
        const outputs = [];
        let before = 0;
        for (const [index, file] of files.entries()) {
          before += file.size;
          const data = await compressPdf(await readBytes(file), level, (value) => report((index + value) / files.length));
          outputs.push({ name: `${baseName(file.name)}-compressed.pdf`, data });
        }
        return { outputs, before };
      }}
    >
      {() => (
        <Options>
          <Choice
            label={t.options.level}
            value={level}
            onChange={setLevel}
            className="sm:col-span-2"
            options={[
              { value: "low", label: t.options.levelLow, hint: t.options.levelLowText },
              { value: "medium", label: t.options.levelMedium, hint: t.options.levelMediumText },
              { value: "high", label: t.options.levelHigh, hint: t.options.levelHighText },
            ]}
          />
        </Options>
      )}
    </ToolShell>
  );
}
