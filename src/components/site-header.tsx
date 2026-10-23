import Link from "next/link";
import { GithubLink } from "@/components/github-link";
import { LocaleSwitch, ThemeToggle } from "@/components/header-controls";
import { Logo } from "@/components/logo";
import { Search } from "@/components/search";
import type { Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <Logo />
          Pliego
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <Search />
          <GithubLink />
          <LocaleSwitch />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
