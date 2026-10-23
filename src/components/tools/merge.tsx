"use client";

import { SortableFiles } from "@/components/sortable-files";
import { ToolShell } from "@/components/tool-shell";
import { readBytes } from "@/lib/files";
import { mergePdfs } from "@/lib/pdf/pages";
import type { Tool } from "@/lib/tools";

export default function Merge({ tool }: { tool: Tool }) {
  return (
    <ToolShell
      accept={tool.accept}
      multiple
      hideFileList
      run={async (files, report) => {
        const data = await mergePdfs(await Promise.all(files.map(readBytes)), report);
        return { outputs: [{ name: "merged.pdf", data }] };
      }}
    >
      {(files, setFiles) => <SortableFiles files={files} onChange={setFiles} accept={tool.accept} />}
    </ToolShell>
  );
}
