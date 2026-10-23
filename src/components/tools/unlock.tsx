"use client";

import { useState } from "react";
import { Field, inputClass, Options } from "@/components/fields";
import { ToolShell } from "@/components/tool-shell";
import { baseName, readBytes } from "@/lib/files";
import { decryptPdf } from "@/lib/pdf/qpdf";
import type { Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

export default function Unlock({ tool }: { tool: Tool }) {
  const t = useDictionary();
  const [password, setPassword] = useState("");
  return (
    <ToolShell
      accept={tool.accept}
      multiple={false}
      run={async ([file]) => ({
        outputs: [{ name: `${baseName(file.name)}-unlocked.pdf`, data: await decryptPdf(await readBytes(file), password) }],
      })}
    >
      {() => (
        <Options>
          <Field label={t.options.password} hint={t.options.unlockHint} className="sm:col-span-2">
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} autoComplete="off" />
          </Field>
        </Options>
      )}
    </ToolShell>
  );
}
