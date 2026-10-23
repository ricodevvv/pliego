"use client";

import { PDFCheckBox, PDFDropdown, PDFOptionList, PDFRadioGroup, PDFTextField } from "pdf-lib";
import { useEffect, useState } from "react";
import { Field, inputClass } from "@/components/fields";
import { ToolShell } from "@/components/tool-shell";
import { baseName, readBytes, ToolError } from "@/lib/files";
import { loadPdf } from "@/lib/pdf/core";
import type { Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

type FormField =
  | { kind: "text"; name: string; multiline: boolean }
  | { kind: "check"; name: string }
  | { kind: "choice"; name: string; options: string[] };

type Values = Record<string, string | boolean>;

async function readFields(file: File) {
  const form = (await loadPdf(await readBytes(file))).getForm();
  const fields: FormField[] = [];
  const values: Values = {};
  for (const field of form.getFields()) {
    const name = field.getName();
    if (field instanceof PDFTextField) {
      fields.push({ kind: "text", name, multiline: field.isMultiline() });
      values[name] = field.getText() ?? "";
    } else if (field instanceof PDFCheckBox) {
      fields.push({ kind: "check", name });
      values[name] = field.isChecked();
    } else if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
      fields.push({ kind: "choice", name, options: field.getOptions() });
      values[name] = field.getSelected()[0] ?? "";
    } else if (field instanceof PDFRadioGroup) {
      fields.push({ kind: "choice", name, options: field.getOptions() });
      values[name] = field.getSelected() ?? "";
    }
  }
  return { fields, values };
}

function FormEditor({ file, values, onValues, onFields }: { file: File; values: Values; onValues: (values: Values) => void; onFields: (count: number) => void }) {
  const t = useDictionary();
  const [fields, setFields] = useState<FormField[] | null>(null);

  useEffect(() => {
    readFields(file)
      .then((result) => {
        setFields(result.fields);
        onValues(result.values);
        onFields(result.fields.length);
      })
      .catch(() => {
        setFields([]);
        onFields(0);
      });
  }, [file, onValues, onFields]);

  if (!fields) return <p className="text-sm text-muted-foreground">{t.tool.loading}</p>;
  if (!fields.length) return <p className="rounded-xl border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">{t.errors.noFields}</p>;

  const set = (name: string, value: string | boolean) => onValues({ ...values, [name]: value });
  return (
    <div className="grid gap-4 rounded-xl border bg-background p-5 sm:grid-cols-2">
      {fields.map((field) =>
        field.kind === "check" ? (
          <label key={field.name} className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={Boolean(values[field.name])} onChange={(event) => set(field.name, event.target.checked)} className="size-4 accent-foreground" />
            {field.name}
          </label>
        ) : field.kind === "choice" ? (
          <Field key={field.name} label={field.name}>
            <select value={String(values[field.name] ?? "")} onChange={(event) => set(field.name, event.target.value)} className={inputClass}>
              <option value="" />
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field key={field.name} label={field.name} className={field.multiline ? "sm:col-span-2" : undefined}>
            {field.multiline ? (
              <textarea value={String(values[field.name] ?? "")} onChange={(event) => set(field.name, event.target.value)} rows={3} className={`${inputClass} h-auto py-2`} />
            ) : (
              <input value={String(values[field.name] ?? "")} onChange={(event) => set(field.name, event.target.value)} className={inputClass} />
            )}
          </Field>
        ),
      )}
    </div>
  );
}

export default function FillForms({ tool }: { tool: Tool }) {
  const t = useDictionary();
  const [values, setValues] = useState<Values>({});
  const [count, setCount] = useState(0);
  const [flatten, setFlatten] = useState(false);
  return (
    <ToolShell
      accept={tool.accept}
      multiple={false}
      canRun={count > 0}
      run={async ([file]) => {
        const doc = await loadPdf(await readBytes(file));
        const form = doc.getForm();
        if (!form.getFields().length) throw new ToolError("noFields");
        for (const field of form.getFields()) {
          const value = values[field.getName()];
          if (value === undefined) continue;
          if (field instanceof PDFTextField) field.setText(String(value));
          else if (field instanceof PDFCheckBox) value ? field.check() : field.uncheck();
          else if ((field instanceof PDFDropdown || field instanceof PDFOptionList || field instanceof PDFRadioGroup) && value) field.select(String(value));
        }
        if (flatten) form.flatten();
        return { outputs: [{ name: `${baseName(file.name)}-filled.pdf`, data: await doc.save() }] };
      }}
    >
      {([file]) => (
        <div className="flex flex-col gap-4">
          <FormEditor file={file} values={values} onValues={setValues} onFields={setCount} />
          {count > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={flatten} onChange={(event) => setFlatten(event.target.checked)} className="size-4 accent-foreground" />
              {t.options.flatten}
            </label>
          )}
        </div>
      )}
    </ToolShell>
  );
}
