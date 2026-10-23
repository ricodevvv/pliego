import { GithubIcon } from "@/components/github-link";
import { Logo } from "@/components/logo";
import { AUTHOR_URL, getDictionary, GITHUB_URL, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-2">
          <Logo className="size-5" />
          <span>
            {t.footer.made}{" "}
            <a href={AUTHOR_URL} className="text-foreground hover:underline" target="_blank" rel="noreferrer">
              ricodevvv
            </a>
            . {t.footer.license}
          </span>
        </div>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground sm:ml-auto">
          <GithubIcon />
          {t.footer.source}
        </a>
      </div>
    </footer>
  );
}
