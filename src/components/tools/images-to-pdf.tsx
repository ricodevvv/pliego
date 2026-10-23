"use client";

import { useState } from "react";
import { Choice, Options } from "@/components/fields";
import { SortableFiles } from "@/components/sortable-files";
import { ToolShell } from "@/components/tool-shell";
import { imagesToPdf, type Orientation, type PageSize } from "@/lib/pdf/convert";
import type { Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

const MARGINS = { none: 0, small: 20, large: 48 } as const;

export default function ImagesToPdf({ tool }: { tool: Tool }) {
  const t = useDictionary();
  const [size, setSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [margin, setMargin] = useState<keyof typeof MARGINS>("small");
  return (
    <ToolShell
      accept={tool.accept}
      multiple
      hideFileList
      run={async (files, report) => ({
        outputs: [{ name: "images.pdf", data: await imagesToPdf(files, size, orientation, MARGINS[margin], report) }],
      })}
    >
      {(files, setFiles) => (
        <>
          <SortableFiles files={files} onChange={setFiles} accept={tool.accept} />
          <Options>
            <Choice
              label={t.options.pageSize}
              value={size}
              onChange={setSize}
              className="sm:col-span-2"
              options={[
                { value: "a4", label: "A4" },
                { value: "letter", label: "Carta / Letter" },
                { value: "fit", label: t.options.fit },
              ]}
            />
            {size !== "fit" && (
              <Choice
                label={t.options.orientation}
                value={orientation}
                onChange={setOrientation}
                options={[
                  { value: "auto", label: t.options.auto },
                  { value: "portrait", label: t.options.portrait },
                  { value: "landscape", label: t.options.landscape },
                ]}
              />
            )}
            <Choice
              label={t.options.margin}
              value={margin}
              onChange={setMargin}
              options={[
                { value: "none", label: t.options.none },
                { value: "small", label: t.options.small },
                { value: "large", label: t.options.large },
              ]}
            />
          </Options>
        </>
      )}
    </ToolShell>
  );
}
