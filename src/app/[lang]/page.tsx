import { InfinityIcon, LockIcon, ShieldCheckIcon, WifiOffIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { FloatingSheets } from "@/components/floating-sheets";
import { GithubIcon } from "@/components/github-link";
import { Logo } from "@/components/logo";
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
        <FloatingSheets />
        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-14 text-center sm:px-6 sm:pt-20">
          <Logo intro className="pop mx-auto mb-7 size-16 drop-shadow-[0_12px_24px_rgb(255_90_31/25%)]" />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="rise inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            style={{ "--delay": "150ms" } as React.CSSProperties}
          >
            <GithubIcon className="size-3.5" />
            {t.home.badge}
          </a>
          <h1 style={{ "--delay": "250ms" } as React.CSSProperties} className="rise mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
            {t.home.title} <span className="bg-gradient-to-r from-muted-foreground via-brand to-muted-foreground bg-clip-text text-transparent">{t.home.titleAccent}</span>
          </h1>
          <p style={{ "--delay": "380ms" } as React.CSSProperties} className="rise mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">{t.home.subtitle}</p>
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
              <div key={pillar.title} data-reveal style={{ "--delay": `${index * 90}ms` } as React.CSSProperties} className="p-4">
                <div className="grid size-10 place-items-center rounded-lg bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-3 font-semibold tracking-tight">{pillar.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{pillar.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t">
        <div data-reveal className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-[-0.04em]">{t.home.whyTitle}</h2>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">{t.home.whyText}</p>
        </div>
      </section>
    </>
  );
}
