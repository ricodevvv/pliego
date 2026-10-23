"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useDictionary, useLocale } from "@/lib/use-dictionary";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useDictionary();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t.nav.theme}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </Button>
  );
}

export function LocaleSwitch() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useDictionary();
  const other = locale === "en" ? "es" : "en";
  return (
    <Button
      variant="ghost"
      size="sm"
      nativeButton={false}
      render={<Link href={pathname.replace(/^\/(en|es)/, `/${other}`)} hrefLang={other} />}
      aria-label={t.nav.language}
      className="font-mono text-xs uppercase"
    >
      {other}
    </Button>
  );
}
