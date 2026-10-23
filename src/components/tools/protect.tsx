"use client";

import { useState } from "react";
import { Field, inputClass, Options } from "@/components/fields";
import { ToolShell } from "@/components/tool-shell";
import { baseName, readBytes } from "@/lib/files";
import { loadPdf } from "@/lib/pdf/core";
import { encryptPdf } from "@/lib/pdf/qpdf";
import type { Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

export default function Protect({ tool }: { tool: Tool }) {
  const t = useDictionary();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [show, setShow] = useState(false);
  const mismatch = repeat.length > 0 && password !== repeat;
  return (
    <ToolShell
      accept={tool.accept}
      multiple={false}
      canRun={password.length > 0 && password === repeat}
      run={async ([file]) => {
        const bytes = await readBytes(file);
        await loadPdf(bytes);
        return { outputs: [{ name: `${baseName(file.name)}-protected.pdf`, data: await encryptPdf(bytes, password) }] };
      }}
    >
      {() => (
        <Options>
          <Field label={t.options.password} hint={t.options.passwordHint}>
            <input type={show ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} autoComplete="new-password" />
          </Field>
          <Field label={t.options.passwordRepeat} hint={mismatch ? t.options.passwordMismatch : undefined}>
            <input
              type={show ? "text" : "password"}
              value={repeat}
              onChange={(event) => setRepeat(event.target.value)}
              aria-invalid={mismatch}
              className={`${inputClass} aria-invalid:border-destructive`}
              autoComplete="new-password"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} className="accent-foreground" />
            {t.options.show}
          </label>
        </Options>
      )}
    </ToolShell>
  );
}
