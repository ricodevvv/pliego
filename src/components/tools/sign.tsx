"use client";

import { useEffect, useRef, useState } from "react";
import { Choice, Field, inputClass } from "@/components/fields";
import { ToolShell } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { baseName, readBytes, ToolError } from "@/lib/files";
import { canvasToBlob, openPdfjs, renderPage } from "@/lib/pdf/core";
import { placeImage } from "@/lib/pdf/stamp";
import type { Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

const INKS = { black: "#111111", blue: "#1d3f9a" } as const;
type Ink = keyof typeof INKS;

function trim(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d")!;
  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  let top = height, left = width, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return null;
  const pad = 6;
  const out = document.createElement("canvas");
  out.width = right - left + 1 + pad * 2;
  out.height = bottom - top + 1 + pad * 2;
  out.getContext("2d")!.drawImage(canvas, left, top, right - left + 1, bottom - top + 1, pad, pad, right - left + 1, bottom - top + 1);
  return out;
}

function DrawPad({ ink, onChange }: { ink: Ink; onChange: (canvas: HTMLCanvasElement | null) => void }) {
  const t = useDictionary();
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * event.currentTarget.width, y: ((event.clientY - rect.top) / rect.height) * event.currentTarget.height };
  };
  return (
    <div className="flex flex-col gap-2">
      <canvas
        ref={canvas}
        width={900}
        height={300}
        aria-label={t.options.signHere}
        className="aspect-[3/1] w-full touch-none rounded-lg border bg-white"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          last.current = point(event);
        }}
        onPointerMove={(event) => {
          if (!last.current) return;
          const context = event.currentTarget.getContext("2d")!;
          const next = point(event);
          context.strokeStyle = INKS[ink];
          context.lineWidth = 4;
          context.lineCap = "round";
          context.lineJoin = "round";
          context.beginPath();
          context.moveTo(last.current.x, last.current.y);
          context.lineTo(next.x, next.y);
          context.stroke();
          last.current = next;
        }}
        onPointerUp={() => {
          last.current = null;
          onChange(canvas.current ? trim(canvas.current) : null);
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => {
          canvas.current?.getContext("2d")!.clearRect(0, 0, 900, 300);
          onChange(null);
        }}
      >
        {t.options.clear}
      </Button>
    </div>
  );
}

async function typedSignature(name: string, ink: Ink) {
  const family = getComputedStyle(document.body).getPropertyValue("--font-signature").trim() || "cursive";
  await document.fonts.load(`96px ${family}`);
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 300;
  const context = canvas.getContext("2d")!;
  context.font = `120px ${family}`;
  context.fillStyle = INKS[ink];
  context.textBaseline = "middle";
  context.fillText(name, 20, 150);
  return trim(canvas);
}

async function uploadedSignature(file: File) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  return canvas;
}

function Placer({
  file,
  page,
  signature,
  placement,
  onChange,
}: {
  file: File;
  page: number;
  signature: string;
  placement: { x: number; y: number; width: number };
  onChange: (placement: { x: number; y: number; width: number }) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [ratio, setRatio] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: "move" | "resize"; startX: number; startY: number; origin: typeof placement } | null>(null);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    (async () => {
      const doc = await openPdfjs(await readBytes(file));
      const canvas = await renderPage(doc, page + 1, 1.5);
      url = URL.createObjectURL(await canvasToBlob(canvas, "image/jpeg", 0.85));
      if (!cancelled) setPreview(url);
      await doc.loadingTask.destroy();
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file, page]);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setRatio(image.height / image.width);
    image.src = signature;
  }, [signature]);

  const begin = (mode: "move" | "resize") => (event: React.PointerEvent) => {
    event.stopPropagation();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    drag.current = { mode, startX: event.clientX, startY: event.clientY, origin: placement };
  };
  const move = (event: React.PointerEvent) => {
    if (!drag.current || !box.current) return;
    const rect = box.current.getBoundingClientRect();
    const dx = (event.clientX - drag.current.startX) / rect.width;
    const dy = (event.clientY - drag.current.startY) / rect.height;
    const { origin } = drag.current;
    if (drag.current.mode === "move") {
      onChange({ ...origin, x: Math.min(1 - origin.width, Math.max(0, origin.x + dx)), y: Math.min(0.98, Math.max(0, origin.y + dy)) });
    } else {
      onChange({ ...origin, width: Math.min(1 - origin.x, Math.max(0.05, origin.width + dx)) });
    }
  };

  return (
    <div ref={box} className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-lg border bg-muted/40 shadow-sm" onPointerMove={move} onPointerUp={() => (drag.current = null)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {preview ? <img src={preview} alt="" className="w-full select-none" draggable={false} /> : <div className="aspect-[1/1.3] w-full animate-pulse" />}
      {preview && (
        <div
          onPointerDown={begin("move")}
          className="absolute cursor-move touch-none rounded-sm outline-2 outline-dashed outline-link"
          style={{
            left: `${placement.x * 100}%`,
            top: `${placement.y * 100}%`,
            width: `${placement.width * 100}%`,
            aspectRatio: `${1 / ratio}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={signature} alt="" className="size-full select-none" draggable={false} />
          <span onPointerDown={begin("resize")} className="absolute -right-2 -bottom-2 size-4 cursor-nwse-resize touch-none rounded-full border-2 border-background bg-link" />
        </div>
      )}
    </div>
  );
}

function PageCount({ file, onCount }: { file: File; onCount: (count: number) => void }) {
  useEffect(() => {
    let cancelled = false;
    readBytes(file)
      .then(openPdfjs)
      .then(async (doc) => {
        if (!cancelled) onCount(doc.numPages);
        await doc.loadingTask.destroy();
      })
      .catch(() => onCount(0));
    return () => {
      cancelled = true;
    };
  }, [file, onCount]);
  return null;
}

export default function Sign({ tool }: { tool: Tool }) {
  const t = useDictionary();
  const [mode, setMode] = useState<"draw" | "type" | "upload">("draw");
  const [ink, setInk] = useState<Ink>("blue");
  const [name, setName] = useState("");
  const [signature, setSignature] = useState<HTMLCanvasElement | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [placement, setPlacement] = useState({ x: 0.55, y: 0.78, width: 0.3 });

  useEffect(() => {
    if (mode !== "type") return;
    let cancelled = false;
    if (!name.trim()) {
      setSignature(null);
      return;
    }
    typedSignature(name, ink).then((canvas) => !cancelled && setSignature(canvas));
    return () => {
      cancelled = true;
    };
  }, [mode, name, ink]);

  useEffect(() => {
    setSignatureUrl(signature ? signature.toDataURL("image/png") : null);
  }, [signature]);

  return (
    <ToolShell
      accept={tool.accept}
      multiple={false}
      canRun={signature !== null}
      run={async ([file]) => {
        if (!signature) throw new ToolError("noSignature");
        const png = await readBytes(await canvasToBlob(signature, "image/png"));
        const data = await placeImage(await readBytes(file), png, { page, ...placement });
        return { outputs: [{ name: `${baseName(file.name)}-signed.pdf`, data }] };
      }}
    >
      {([file]) => (
        <div className="flex flex-col gap-6">
          <PageCount file={file} onCount={setPages} />
          <div className="grid gap-5 rounded-xl border bg-background p-5">
            <Choice
              label={t.options.mode}
              value={mode}
              onChange={(value) => {
                setMode(value);
                setSignature(null);
              }}
              options={[
                { value: "draw", label: t.options.draw },
                { value: "type", label: t.options.type },
                { value: "upload", label: t.options.upload },
              ]}
            />
            {mode !== "upload" && (
              <Choice
                label={t.options.color}
                value={ink}
                onChange={setInk}
                options={[
                  { value: "blue", label: t.options.blue },
                  { value: "black", label: t.options.black },
                ]}
              />
            )}
            {mode === "draw" && <DrawPad key={ink} ink={ink} onChange={setSignature} />}
            {mode === "type" && (
              <Field label={t.options.typeName}>
                <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
              </Field>
            )}
            {mode === "upload" && (
              <Field label={t.options.chooseImage}>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className={`${inputClass} py-2`}
                  onChange={async (event) => {
                    const chosen = event.target.files?.[0];
                    setSignature(chosen ? await uploadedSignature(chosen) : null);
                  }}
                />
              </Field>
            )}
          </div>
          {signatureUrl && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <p className="text-sm text-muted-foreground">{t.options.placeSignature}</p>
                {pages > 1 && (
                  <Field label={t.options.signPage}>
                    <select value={page} onChange={(event) => setPage(Number(event.target.value))} className={`${inputClass} w-32`}>
                      {Array.from({ length: pages }, (_, i) => (
                        <option key={i} value={i}>
                          {t.tool.page} {i + 1}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
              </div>
              <Placer file={file} page={page} signature={signatureUrl} placement={placement} onChange={setPlacement} />
            </div>
          )}
        </div>
      )}
    </ToolShell>
  );
}
