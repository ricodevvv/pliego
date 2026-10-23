import Link from "next/link";
import { GithubLink } from "@/components/github-link";
import { LocaleSwitch, ThemeToggle } from "@/components/header-controls";
import { Logo } from "@/components/logo";
import { Search } from "@/components/search";
import type { Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="material-bar sticky top-0 z-40 border-b-[0.5px]">
      <div className="mx-auto flex h-12 max-w-5xl items-center gap-3 px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
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
