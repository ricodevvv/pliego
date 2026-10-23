"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ToolIcon } from "@/components/tool-icon";
import { CATEGORIES, TOOLS } from "@/lib/tools";
import { useDictionary, useLocale } from "@/lib/use-dictionary";

function plain(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function ToolGrid() {
  const t = useDictionary();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const wanted = plain(query.trim());
  const matches = TOOLS.filter((tool) => !wanted || plain(`${tool.title[locale]} ${tool.title.en} ${tool.description[locale]} ${tool.keywords}`).includes(wanted));

  return (
    <div>
      <label style={{ "--delay": "480ms" } as React.CSSProperties} className="rise mx-auto flex h-12 max-w-md items-center gap-3 rounded-xl border bg-background px-4 shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        <SearchIcon className="size-4 text-muted-foreground" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.home.filter} aria-label={t.home.filter} className="h-full flex-1 bg-transparent outline-none" />
      </label>
      <div className="mt-12 flex flex-col gap-12">
        {CATEGORIES.map((category) => {
          const tools = matches.filter((tool) => tool.category === category);
          if (!tools.length) return null;
          return (
            <section key={category}>
              <h2 data-reveal className="mb-4 text-sm font-medium text-muted-foreground">{t.categories[category]}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {tools.map((tool, index) => (
                  <Link
                    key={tool.slug}
                    href={`/${locale}/${tool.slug}`}
                    data-reveal
                    style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
                    className="group flex flex-col gap-3 rounded-xl border bg-background p-5 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_12px_32px_-14px_rgb(255_90_31/35%)] transition-all duration-300"
                  >
                    <div className="grid size-10 place-items-center rounded-lg border bg-muted/50 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                      <ToolIcon name={tool.icon} className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold tracking-tight">{tool.title[locale]}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tool.description[locale]}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
        {!matches.length && <p className="text-center text-sm text-muted-foreground">{t.home.noResults}</p>}
      </div>
    </div>
  );
}
