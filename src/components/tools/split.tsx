"use client";

import { useEffect, useState } from "react";
import { Choice, Field, inputClass, Options } from "@/components/fields";
import { ToolShell } from "@/components/tool-shell";
import { baseName, readBytes } from "@/lib/files";
import { extractGroups, pageCount, parseRanges } from "@/lib/pdf/pages";
import type { Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

type Mode = "ranges" | "every" | "extract";

function PageTotal({ file, onCount }: { file: File; onCount: (count: number) => void }) {
  useEffect(() => {
    readBytes(file)
      .then(pageCount)
      .then(onCount)
      .catch(() => onCount(0));
  }, [file, onCount]);
  return null;
}

export default function Split({ tool }: { tool: Tool }) {
  const t = useDictionary();
  const [mode, setMode] = useState<Mode>("ranges");
  const [ranges, setRanges] = useState("1-2");
  const [total, setTotal] = useState(0);

  return (
    <ToolShell
      accept={tool.accept}
      multiple={false}
      run={async ([file], report) => {
        const bytes = await readBytes(file);
        const count = await pageCount(bytes);
        const groups =
          mode === "every" ? Array.from({ length: count }, (_, i) => [i]) : mode === "extract" ? [parseRanges(ranges, count).flat()] : parseRanges(ranges, count);
        const outputs = await extractGroups(bytes, groups, report);
        const name = baseName(file.name);
        return {
          outputs: outputs.map((data, i) => {
            const group = groups[i];
            const label = group.length === 1 ? `${group[0] + 1}` : `${group[0] + 1}-${group[group.length - 1] + 1}`;
            return { name: mode === "extract" ? `${name}-extract.pdf` : `${name}-${label}.pdf`, data };
          }),
        };
      }}
      zipName="split.zip"
    >
      {([file]) => (
        <Options>
          <PageTotal file={file} onCount={setTotal} />
          <Choice
            label={t.options.mode}
            value={mode}
            onChange={setMode}
            className="sm:col-span-2"
            options={[
              { value: "ranges", label: t.options.splitRanges },
              { value: "every", label: t.options.splitEvery },
              { value: "extract", label: t.options.splitExtract },
            ]}
          />
          {mode !== "every" && (
            <Field label={t.options.ranges} hint={mode === "extract" ? t.options.extractHint : t.options.rangesHint} className="sm:col-span-2">
              <input value={ranges} onChange={(event) => setRanges(event.target.value)} className={`${inputClass} font-mono`} />
            </Field>
          )}
          {total > 0 && (
            <p className="text-sm text-muted-foreground sm:col-span-2">
              {total} {t.tool.pages}
            </p>
          )}
        </Options>
      )}
    </ToolShell>
  );
}
