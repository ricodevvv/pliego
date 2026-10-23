"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToolIcon } from "@/components/tool-icon";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CATEGORIES, TOOLS } from "@/lib/tools";
import { useDictionary, useLocale } from "@/lib/use-dictionary";

export function Search() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useDictionary();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="spring flex h-8 items-center gap-2 rounded-[10px] bg-fill px-2 text-[15px] whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground sm:w-56 sm:px-2.5"
      >
        <SearchIcon className="size-4" />
        <span className="hidden flex-1 truncate text-left sm:inline">{t.nav.search}</span>
        <kbd className="hidden font-sans text-[13px] text-tertiary sm:inline">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} title={t.nav.search} description={t.nav.search}>
        <CommandInput placeholder={t.nav.search} />
        <CommandList>
          <CommandEmpty>{t.nav.searchEmpty}</CommandEmpty>
          {CATEGORIES.map((category) => (
            <CommandGroup key={category} heading={t.categories[category]}>
              {TOOLS.filter((tool) => tool.category === category).map((tool) => (
                <CommandItem
                  key={tool.slug}
                  value={`${tool.title[locale]} ${tool.title.en} ${tool.keywords}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/${locale}/${tool.slug}`);
                  }}
                >
                  <ToolIcon name={tool.icon} />
                  {tool.title[locale]}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
