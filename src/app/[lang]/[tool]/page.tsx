import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolIcon } from "@/components/tool-icon";
import { ToolLoader } from "@/components/tool-loader";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { getDictionary, isLocale, LOCALES } from "@/lib/i18n";
import { findTool, TOOLS } from "@/lib/tools";

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => TOOLS.map((tool) => ({ lang, tool: tool.slug })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[lang]/[tool]">): Promise<Metadata> {
  const { lang, tool: slug } = await params;
  const tool = findTool(slug);
  if (!isLocale(lang) || !tool) return {};
  return { title: tool.title[lang], description: `${tool.description[lang]} ${getDictionary(lang).tool.privacy}` };
}

export default async function ToolPage({ params }: PageProps<"/[lang]/[tool]">) {
  const { lang, tool: slug } = await params;
  const tool = findTool(slug);
  if (!isLocale(lang) || !tool) notFound();
  const t = getDictionary(lang);
  const related = TOOLS.filter((other) => other.category === tool.category && other.slug !== tool.slug);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col items-center text-center">
        <div className={`pop grid size-16 place-items-center rounded-[22.5%] text-white shadow-[0_10px_24px_-10px_rgb(0_0_0/35%)] ${CATEGORY_COLORS[tool.category]}`}>
          <ToolIcon name={tool.icon} className="size-8" />
        </div>
        <h1 style={{ "--delay": "100ms" } as React.CSSProperties} className="rise mt-5 text-[34px] font-bold tracking-[-0.025em] sm:text-[44px]">{tool.title[lang]}</h1>
        <p style={{ "--delay": "180ms" } as React.CSSProperties} className="rise mt-2 max-w-xl text-[19px] leading-snug text-pretty text-muted-foreground">{tool.description[lang]}</p>
      </div>
      <div className="rise mt-10" style={{ "--delay": "260ms" } as React.CSSProperties}>
        <ToolLoader slug={tool.slug} />
      </div>
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="px-1 text-[13px] text-muted-foreground">{t.categories[tool.category]}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {related.map((other) => (
              <Link key={other.slug} href={`/${lang}/${other.slug}`} className="spring flex items-center gap-2 rounded-full bg-cell px-3.5 py-2 text-[15px] transition-colors hover:bg-fill">
                <ToolIcon name={other.icon} className="size-4 text-brand" />
                {other.title[lang]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
