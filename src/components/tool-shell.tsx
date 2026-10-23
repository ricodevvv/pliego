"use client";

import { DownloadIcon, FileIcon, LockIcon, PlusIcon, RotateCcwIcon, UploadIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { download, formatBytes, sizeOf, toBlob, ToolError, zipOutputs, type Output, type Report } from "@/lib/files";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/lib/use-dictionary";

export interface ToolResult {
  outputs: Output[];
  text?: string;
  before?: number;
}

interface ToolShellProps {
  accept: string;
  multiple: boolean;
  run: (files: File[], report: Report) => Promise<ToolResult>;
  canRun?: boolean;
  runLabel?: string;
  hideFileList?: boolean;
  zipName?: string;
  children?: (files: File[], setFiles: (files: File[]) => void) => React.ReactNode;
}

function accepted(file: File, accept: string) {
  return accept.split(",").some((rule) => {
    const pattern = rule.trim().toLowerCase();
    if (pattern.startsWith(".")) return file.name.toLowerCase().endsWith(pattern);
    if (pattern.endsWith("/*")) return file.type.startsWith(pattern.slice(0, -1));
    return file.type === pattern;
  });
}

export function Dropzone({ accept, multiple, onFiles, compact }: { accept: string; multiple: boolean; onFiles: (files: File[]) => void; compact?: boolean }) {
  const t = useDictionary();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const pick = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((file) => accepted(file, accept));
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };
  const extensions = accept
    .split(",")
    .filter((rule) => rule.startsWith("."))
    .map((rule) => rule.slice(1).toUpperCase())
    .join(", ");

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        pick(event.dataTransfer.files);
      }}
      data-over={over}
      className={cn(
        "dropzone flex flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-all duration-300",
        compact ? "gap-2 p-4" : "gap-3 px-6 py-14 sm:py-16",
        over ? "scale-[1.01] border-brand bg-brand-soft" : "bg-muted/30 hover:border-foreground/25",
      )}
    >
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          pick(event.target.files);
          event.target.value = "";
        }}
      />
      {compact ? (
        <Button variant="outline" onClick={() => input.current?.click()}>
          <PlusIcon data-icon="inline-start" />
          {t.tool.addMore}
        </Button>
      ) : (
        <>
          <div className="dropzone-icon mb-2 grid size-14 place-items-center rounded-2xl bg-brand text-white shadow-[0_10px_24px_-8px_rgb(255_90_31/55%)]">
            <UploadIcon className="size-6" />
          </div>
          <Button size="lg" className="h-12 px-6 text-base" onClick={() => input.current?.click()}>
            {multiple ? t.tool.choose : t.tool.chooseOne}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t.tool.or} {(multiple ? t.tool.drop : t.tool.dropOne).toLowerCase()}
          </p>
          {extensions && (
            <p className="text-xs text-muted-foreground">
              {t.tool.accepts} {extensions}
            </p>
          )}
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <LockIcon className="size-3" />
            {t.tool.privacy}
          </p>
        </>
      )}
    </div>
  );
}

export function FileRow({ file, onRemove, handle }: { file: File; onRemove?: () => void; handle?: React.ReactNode }) {
  const t = useDictionary();
  return (
    <div className="rise flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5">
      {handle}
      <FileIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatBytes(file.size)}</span>
      {onRemove && (
        <button type="button" aria-label={t.tool.remove} onClick={onRemove} className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground">
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function errorMessage(error: unknown, t: ReturnType<typeof useDictionary>) {
  if (error instanceof ToolError) return t.errors[error.code];
  return t.errors.generic;
}

/**
 * Everything a tool page needs around its options: the drop zone, the file list, the run button,
 * progress, errors and the downloads.
 */
export function ToolShell({ accept, multiple, run, canRun = true, runLabel, hideFileList, zipName = "pliego.zip", children }: ToolShellProps) {
  const t = useDictionary();
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<{ value: number; label?: string } | null>(null);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(null);
  };

  const start = async () => {
    setError(null);
    setProgress({ value: 0 });
    try {
      setResult(await run(files, (value, label) => setProgress({ value, label })));
    } catch (failure) {
      console.error(failure);
      setError(errorMessage(failure, t));
    } finally {
      setProgress(null);
    }
  };

  if (result) {
    const total = result.outputs.reduce((sum, output) => sum + sizeOf(output), 0);
    const single = result.outputs.length === 1 ? result.outputs[0] : undefined;
    const smaller = result.before !== undefined ? 1 - total / result.before : undefined;
    return (
      <div className="rise flex flex-col items-center gap-6 rounded-xl border bg-background px-6 py-12 text-center">
        <div className="relative grid size-14 place-items-center">
          <span className="check-ring absolute inset-0 rounded-full bg-success/40" />
          <span className="pop relative grid size-14 place-items-center rounded-full bg-success text-white">
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path className="check-path" d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
        </div>
        <h2 className="pop text-2xl font-semibold tracking-tight" style={{ "--delay": "150ms" } as React.CSSProperties}>
          {t.tool.done}
        </h2>
        {result.before !== undefined && smaller !== undefined && (
          smaller > 0.01 ? (
            <div className="pop flex items-center gap-3 text-sm" style={{ "--delay": "250ms" } as React.CSSProperties}>
              <span className="text-muted-foreground line-through">{formatBytes(result.before)}</span>
              <span className="font-medium">{formatBytes(total)}</span>
              <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                {Math.round(smaller * 100)}% {t.tool.saved}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.tool.notSmaller}</p>
          )
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {single ? (
            <Button size="lg" className="h-12 px-6 text-base" onClick={() => download(toBlob(single), single.name)}>
              <DownloadIcon data-icon="inline-start" />
              {t.tool.download}
            </Button>
          ) : (
            <Button size="lg" className="h-12 px-6 text-base" onClick={async () => download(await zipOutputs(result.outputs), zipName)}>
              <DownloadIcon data-icon="inline-start" />
              {t.tool.downloadAll}
            </Button>
          )}
          <Button size="lg" variant="outline" className="h-12 px-5" onClick={reset}>
            <RotateCcwIcon data-icon="inline-start" />
            {t.tool.again}
          </Button>
        </div>
        {!single && (
          <ul className="flex w-full max-w-md flex-col gap-1.5 text-left">
            {result.outputs.map((output, index) => (
              <li key={index} className="rise" style={{ "--delay": `${200 + index * 40}ms` } as React.CSSProperties}>
                <button
                  type="button"
                  onClick={() => download(toBlob(output), output.name)}
                  className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <DownloadIcon className="size-3.5 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{output.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{formatBytes(sizeOf(output))}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {result.text !== undefined && (
          <div className="w-full max-w-2xl text-left">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t.options.textPreview}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(result.text ?? "");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? t.options.copied : t.options.copyText}
              </Button>
            </div>
            <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-5 whitespace-pre-wrap">{result.text}</pre>
          </div>
        )}
      </div>
    );
  }

  if (!files.length) return <Dropzone accept={accept} multiple={multiple} onFiles={setFiles} />;

  const busy = progress !== null;
  return (
    <div className="flex flex-col gap-6">
      {!hideFileList && (
        <div className="flex flex-col gap-2">
          {files.map((file, index) => (
            <FileRow key={`${file.name}-${index}`} file={file} onRemove={busy ? undefined : () => setFiles(files.filter((_, i) => i !== index))} />
          ))}
          {multiple && !busy && <Dropzone accept={accept} multiple compact onFiles={(more) => setFiles([...files, ...more])} />}
        </div>
      )}
      {children?.(files, setFiles)}
      {error && <p className="rounded-lg border border-destructive/30 bg-danger-soft px-4 py-3 text-sm text-destructive">{error}</p>}
      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border bg-background/90 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center">
        {busy ? (
          <div className="flex flex-1 items-center gap-3 px-1">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="relative h-full overflow-hidden rounded-full bg-brand transition-[width] duration-300" style={{ width: `${Math.max(3, progress.value * 100)}%` }}>
                <span className="progress-shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
            </div>
            <span className="w-12 text-right text-sm text-muted-foreground tabular-nums">{Math.round(progress.value * 100)}%</span>
          </div>
        ) : (
          <button type="button" onClick={reset} className="px-2 text-sm text-muted-foreground hover:text-foreground sm:mr-auto">
            {t.tool.clear}
          </button>
        )}
        <Button size="lg" className="h-11 px-6" disabled={busy || !canRun} onClick={start}>
          {busy ? t.tool.working : (runLabel ?? t.tool.run)}
        </Button>
      </div>
    </div>
  );
}
