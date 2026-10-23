"use client";

import { ChevronRightIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ToolIcon } from "@/components/tool-icon";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { CATEGORIES, TOOLS } from "@/lib/tools";
import { cn } from "@/lib/utils";
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
      <label
        style={{ "--delay": "300ms" } as React.CSSProperties}
        className="rise mx-auto flex h-10 max-w-md items-center gap-2 rounded-[10px] bg-fill px-3"
      >
        <SearchIcon className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.home.filter}
          aria-label={t.home.filter}
          className="h-full flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted-foreground"
        />
      </label>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {CATEGORIES.map((category) => {
          const tools = matches.filter((tool) => tool.category === category);
          if (!tools.length) return null;
          return (
            <section key={category} data-reveal>
              <h2 className="mb-1.5 px-4 text-[13px] text-muted-foreground">{t.categories[category]}</h2>
              <div className="inset-list overflow-hidden rounded-xl bg-cell">
                {tools.map((tool) => (
                  <Link key={tool.slug} href={`/${locale}/${tool.slug}`} className="group flex items-center gap-3 px-4 py-2.5 transition-colors [--inset:58px] hover:bg-fill active:bg-fill">
                    <span className={cn("grid size-[30px] shrink-0 place-items-center rounded-[7px] text-white", CATEGORY_COLORS[category])}>
                      <ToolIcon name={tool.icon} className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[17px] leading-tight">{tool.title[locale]}</span>
                      <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{tool.description[locale]}</span>
                    </span>
                    <ChevronRightIcon className="size-4 shrink-0 text-tertiary transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {!matches.length && <p className="mt-10 text-center text-[15px] text-muted-foreground">{t.home.noResults}</p>}
    </div>
  );
}
