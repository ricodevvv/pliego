import { InfinityIcon, LockIcon, ShieldCheckIcon, WifiOffIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { ToolGrid } from "@/components/tool-grid";
import { getDictionary, GITHUB_URL, isLocale } from "@/lib/i18n";

const PILLARS = [
  { Icon: LockIcon, color: "bg-blue" },
  { Icon: InfinityIcon, color: "bg-green" },
  { Icon: WifiOffIcon, color: "bg-gray" },
  { Icon: ShieldCheckIcon, color: "bg-indigo" },
];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="flex flex-col items-center pt-14 pb-10 text-center sm:pt-20">
        <Logo intro className="pop size-20 shadow-[0_12px_32px_-10px_rgb(255_90_31/50%)]" />
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          style={{ "--delay": "80ms" } as React.CSSProperties}
          className="rise mt-6 text-[17px] font-semibold text-brand hover:underline"
        >
          {t.home.badge}
        </a>
        <h1
          style={{ "--delay": "140ms" } as React.CSSProperties}
          className="rise mt-2 max-w-3xl text-[40px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-[56px]"
        >
          {t.home.title} <span className="text-muted-foreground">{t.home.titleAccent}</span>
        </h1>
        <p style={{ "--delay": "200ms" } as React.CSSProperties} className="rise mt-4 max-w-2xl text-[19px] leading-[1.45] text-pretty text-muted-foreground sm:text-[21px]">
          {t.home.subtitle}
        </p>
      </section>

      <ToolGrid />

      <section className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {t.home.pillars.map((pillar, index) => {
          const { Icon, color } = PILLARS[index];
          return (
            <div key={pillar.title} data-reveal style={{ "--delay": `${index * 70}ms` } as React.CSSProperties} className="rounded-2xl bg-cell p-5">
              <span className={`grid size-8 place-items-center rounded-[8px] text-white ${color}`}>
                <Icon className="size-[18px]" />
              </span>
              <h3 className="mt-3 text-[17px] font-semibold">{pillar.title}</h3>
              <p className="mt-1 text-[15px] leading-snug text-muted-foreground">{pillar.text}</p>
            </div>
          );
        })}
      </section>

      <section data-reveal className="mt-3 rounded-2xl bg-cell p-6 sm:p-8">
        <h2 className="text-[22px] font-semibold tracking-[-0.02em]">{t.home.whyTitle}</h2>
        <p className="mt-2 max-w-3xl text-[17px] leading-relaxed text-muted-foreground">{t.home.whyText}</p>
      </section>
    </div>
  );
}
