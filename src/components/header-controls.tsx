"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useDictionary, useLocale } from "@/lib/use-dictionary";

const control = "spring grid h-8 min-w-8 place-items-center rounded-full px-2.5 text-[15px] text-brand transition-colors hover:bg-fill";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useDictionary();
  return (
    <button type="button" aria-label={t.nav.theme} className={control} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      <SunIcon className="hidden size-[18px] dark:block" />
      <MoonIcon className="size-[18px] dark:hidden" />
    </button>
  );
}

export function LocaleSwitch() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useDictionary();
  const other = locale === "en" ? "es" : "en";
  return (
    <Link href={pathname.replace(/^\/(en|es)/, `/${other}`)} hrefLang={other} aria-label={t.nav.language} className={control}>
      {t.nav.language}
    </Link>
  );
}
