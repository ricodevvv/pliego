import { getDictionary, AUTHOR_URL, GITHUB_URL, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <footer className="mx-auto mt-20 w-full max-w-5xl px-4 pb-10">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t-[0.5px] pt-5 text-xs text-muted-foreground">
        <span>
          {t.footer.made}{" "}
          <a href={AUTHOR_URL} target="_blank" rel="noreferrer" className="text-brand hover:underline">
            ricodevvv
          </a>
          . {t.footer.license}
        </span>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-brand hover:underline sm:ml-auto">
          {t.footer.source}
        </a>
      </div>
    </footer>
  );
}
