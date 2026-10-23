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
      <label className="mx-auto flex h-12 max-w-md items-center gap-3 rounded-xl border bg-background px-4 shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        <SearchIcon className="size-4 text-muted-foreground" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.home.filter} aria-label={t.home.filter} className="h-full flex-1 bg-transparent outline-none" />
      </label>
      <div className="mt-12 flex flex-col gap-12">
        {CATEGORIES.map((category) => {
          const tools = matches.filter((tool) => tool.category === category);
          if (!tools.length) return null;
          return (
            <section key={category}>
              <h2 className="mb-4 text-sm font-medium text-muted-foreground">{t.categories[category]}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/${locale}/${tool.slug}`}
                    className="group flex flex-col gap-3 rounded-xl border bg-background p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_8px_24px_-12px_rgb(0_0_0/18%)]"
                  >
                    <div className="grid size-10 place-items-center rounded-lg border bg-muted/50 transition-colors group-hover:bg-foreground group-hover:text-background">
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
