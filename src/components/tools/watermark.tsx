"use client";

import { useState } from "react";
import { Choice, Field, inputClass, Options, Range } from "@/components/fields";
import { ToolShell } from "@/components/tool-shell";
import { baseName, readBytes } from "@/lib/files";
import { addWatermark } from "@/lib/pdf/stamp";
import type { Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

const COLORS = {
  gray: [0.45, 0.45, 0.45],
  red: [0.8, 0.12, 0.15],
  blue: [0.1, 0.3, 0.75],
} as const;

export default function Watermark({ tool }: { tool: Tool }) {
  const t = useDictionary();
  const [kind, setKind] = useState<"text" | "image">("text");
  const [text, setText] = useState(t.options.watermarkDefault);
  const [image, setImage] = useState<File | null>(null);
  const [size, setSize] = useState(48);
  const [opacity, setOpacity] = useState(0.25);
  const [angle, setAngle] = useState<"0" | "45">("45");
  const [color, setColor] = useState<keyof typeof COLORS>("gray");
  const [layout, setLayout] = useState<"single" | "tiled">("single");

  return (
    <ToolShell
      accept={tool.accept}
      multiple={false}
      canRun={kind === "text" ? text.trim().length > 0 : image !== null}
      run={async ([file]) => {
        const data = await addWatermark(await readBytes(file), {
          text: kind === "text" ? text : undefined,
          image: kind === "image" && image ? { bytes: await readBytes(image), type: image.type } : undefined,
          size: kind === "image" ? size / 2 : size,
          opacity,
          angle: Number(angle),
          color: [...COLORS[color]],
          tiled: layout === "tiled",
        });
        return { outputs: [{ name: `${baseName(file.name)}-watermark.pdf`, data }] };
      }}
    >
      {() => (
        <Options>
          <Choice
            label={t.options.mode}
            value={kind}
            onChange={setKind}
            className="sm:col-span-2"
            options={[
              { value: "text", label: t.options.text },
              { value: "image", label: t.options.image },
            ]}
          />
          {kind === "text" ? (
            <Field label={t.options.text} className="sm:col-span-2">
              <input value={text} onChange={(event) => setText(event.target.value)} className={inputClass} />
            </Field>
          ) : (
            <Field label={t.options.chooseImage} className="sm:col-span-2">
              <input type="file" accept="image/png,image/jpeg" onChange={(event) => setImage(event.target.files?.[0] ?? null)} className={`${inputClass} py-2`} />
            </Field>
          )}
          <Range label={t.options.size} value={size} onChange={setSize} min={12} max={120} />
          <Range label={t.options.opacity} value={opacity} onChange={setOpacity} min={0.05} max={1} step={0.05} format={(n) => `${Math.round(n * 100)}%`} />
          <Choice
            label={t.options.rotation}
            value={angle}
            onChange={setAngle}
            options={[
              { value: "0", label: "0°" },
              { value: "45", label: "45°" },
            ]}
          />
          <Choice
            label={t.options.layout}
            value={layout}
            onChange={setLayout}
            options={[
              { value: "single", label: t.options.single },
              { value: "tiled", label: t.options.tiled },
            ]}
          />
          {kind === "text" && (
            <Choice
              label={t.options.color}
              value={color}
              onChange={setColor}
              className="sm:col-span-2"
              options={(Object.keys(COLORS) as (keyof typeof COLORS)[]).map((key) => ({
                value: key,
                label: t.options[key],
              }))}
            />
          )}
        </Options>
      )}
    </ToolShell>
  );
}
