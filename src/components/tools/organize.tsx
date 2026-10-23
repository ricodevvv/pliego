"use client";

import { RotateCcwIcon, RotateCwIcon } from "lucide-react";
import { useState } from "react";
import { PageGrid, type GridPage } from "@/components/page-grid";
import { ToolShell } from "@/components/tool-shell";
import { baseName, readBytes } from "@/lib/files";
import { rebuildPdf } from "@/lib/pdf/pages";
import type { Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

function RotateAll({ pages, onChange }: { pages: GridPage[]; onChange: (pages: GridPage[]) => void }) {
  const t = useDictionary();
  const rotate = (by: number) => onChange(pages.map((page) => ({ ...page, rotation: page.rotation + by })));
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="spring inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-soft px-4 text-[15px] font-medium text-brand" onClick={() => rotate(-90)}>
        <RotateCcwIcon className="size-4" />
        {t.tool.rotateLeft}
      </button>
      <button type="button" className="spring inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-soft px-4 text-[15px] font-medium text-brand" onClick={() => rotate(90)}>
        <RotateCwIcon className="size-4" />
        {t.tool.rotateRight}
      </button>
    </div>
  );
}

export default function Organize({ tool, rotateOnly = false }: { tool: Tool; rotateOnly?: boolean }) {
  const [pages, setPages] = useState<GridPage[]>([]);
  return (
    <ToolShell
      accept={tool.accept}
      multiple={false}
      canRun={pages.some((page) => !page.deleted)}
      run={async ([file]) => {
        const data = await rebuildPdf(
          await readBytes(file),
          pages.filter((page) => !page.deleted).map((page) => ({ index: page.index, rotation: page.rotation })),
        );
        return { outputs: [{ name: `${baseName(file.name)}-${rotateOnly ? "rotated" : "organized"}.pdf`, data }] };
      }}
    >
      {([file]) => (
        <div className="flex flex-col gap-4">
          {rotateOnly && <RotateAll pages={pages} onChange={setPages} />}
          <PageGrid file={file} pages={pages} onChange={setPages} sortable={!rotateOnly} canDelete={!rotateOnly} />
        </div>
      )}
    </ToolShell>
  );
}
