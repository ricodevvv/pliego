"use client";

import { ToolShell } from "@/components/tool-shell";
import { baseName, readBytes } from "@/lib/files";
import { extractText } from "@/lib/pdf/convert";
import type { Tool } from "@/lib/tools";

export default function ExtractText({ tool }: { tool: Tool }) {
  return (
    <ToolShell
      accept={tool.accept}
      multiple={false}
      run={async ([file], report) => {
        const text = await extractText(await readBytes(file), report);
        return { outputs: [{ name: `${baseName(file.name)}.txt`, data: new Blob([text], { type: "text/plain;charset=utf-8" }) }], text };
      }}
    />
  );
}
