import { InfinityIcon, LockIcon, ShieldCheckIcon, WifiOffIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { GithubIcon } from "@/components/github-link";
import { ToolGrid } from "@/components/tool-grid";
import { getDictionary, GITHUB_URL, isLocale } from "@/lib/i18n";

const PILLAR_ICONS = [LockIcon, InfinityIcon, WifiOffIcon, ShieldCheckIcon];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-24">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <GithubIcon className="size-3.5" />
            {t.home.badge}
          </a>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
            {t.home.title} <span className="text-muted-foreground">{t.home.titleAccent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">{t.home.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <ToolGrid />
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-px overflow-hidden px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {t.home.pillars.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index];
            return (
              <div key={pillar.title} className="p-4">
                <Icon className="size-5" />
                <h3 className="mt-3 font-semibold tracking-tight">{pillar.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{pillar.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-[-0.04em]">{t.home.whyTitle}</h2>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">{t.home.whyText}</p>
        </div>
      </section>
    </>
  );
}
