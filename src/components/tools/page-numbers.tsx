"use client";

import { useState } from "react";
import { Choice, Field, inputClass, Options } from "@/components/fields";
import { ToolShell } from "@/components/tool-shell";
import { baseName, readBytes } from "@/lib/files";
import { addPageNumbers, type Horizontal, type NumberOptions, type Vertical } from "@/lib/pdf/stamp";
import type { Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

export default function PageNumbers({ tool }: { tool: Tool }) {
  const t = useDictionary();
  const [vertical, setVertical] = useState<Vertical>("bottom");
  const [horizontal, setHorizontal] = useState<Horizontal>("center");
  const [format, setFormat] = useState<NumberOptions["format"]>("n");
  const [start, setStart] = useState(1);
  const [size, setSize] = useState(11);
  return (
    <ToolShell
      accept={tool.accept}
      multiple={false}
      run={async ([file]) => {
        const data = await addPageNumbers(await readBytes(file), {
          vertical,
          horizontal,
          format,
          start,
          size,
          pageWord: t.options.pageWord,
          ofWord: t.options.ofWord,
        });
        return { outputs: [{ name: `${baseName(file.name)}-numbered.pdf`, data }] };
      }}
    >
      {() => (
        <Options>
          <Choice
            label={t.options.position}
            value={vertical}
            onChange={setVertical}
            options={[
              { value: "top", label: t.options.top },
              { value: "bottom", label: t.options.bottom },
            ]}
          />
          <Choice
            label={"\u00a0"}
            value={horizontal}
            onChange={setHorizontal}
            options={[
              { value: "left", label: t.options.left },
              { value: "center", label: t.options.center },
              { value: "right", label: t.options.right },
            ]}
          />
          <Choice
            label={t.options.numberFormat}
            value={format}
            onChange={setFormat}
            className="sm:col-span-2"
            options={[
              { value: "n", label: "1" },
              { value: "n-total", label: "1 / 10" },
              { value: "page-n-total", label: `${t.options.pageWord} 1 ${t.options.ofWord} 10` },
            ]}
          />
          <Field label={t.options.startAt}>
            <input type="number" min={0} value={start} onChange={(event) => setStart(Math.max(0, Number(event.target.value)))} className={inputClass} />
          </Field>
          <Field label={t.options.fontSize}>
            <input type="number" min={6} max={48} value={size} onChange={(event) => setSize(Math.min(48, Math.max(6, Number(event.target.value))))} className={inputClass} />
          </Field>
        </Options>
      )}
    </ToolShell>
  );
}
