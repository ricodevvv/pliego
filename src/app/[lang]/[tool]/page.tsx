import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolIcon } from "@/components/tool-icon";
import { ToolLoader } from "@/components/tool-loader";
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
        <div className="grid size-12 place-items-center rounded-xl border bg-muted/50">
          <ToolIcon name={tool.icon} className="size-6" />
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{tool.title[lang]}</h1>
        <p className="mt-3 max-w-xl text-lg text-pretty text-muted-foreground">{tool.description[lang]}</p>
      </div>
      <div className="mt-10">
        <ToolLoader slug={tool.slug} />
      </div>
      {related.length > 0 && (
        <div className="mt-16 border-t pt-8">
          <h2 className="text-sm font-medium text-muted-foreground">{t.categories[tool.category]}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {related.map((other) => (
              <Link key={other.slug} href={`/${lang}/${other.slug}`} className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-accent">
                <ToolIcon name={other.icon} className="size-3.5 text-muted-foreground" />
                {other.title[lang]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
