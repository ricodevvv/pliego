import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { RevealObserver } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { getDictionary, isLocale, LOCALES } from "@/lib/i18n";
import "../globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const signature = Caveat({ variable: "--font-signature", subsets: ["latin"], weight: "600" });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
    title: { default: t.site.title, template: `%s · ${t.site.name}` },
    description: t.site.description,
    alternates: { languages: { en: "/en", es: "/es" } },
    openGraph: { title: t.site.title, description: t.site.description, siteName: t.site.name, locale: lang === "es" ? "es_MX" : "en_US" },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang === "es" ? "es-MX" : "en"} suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${signature.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <RevealObserver />
        <ThemeProvider>
          <SiteHeader locale={lang} />
          <main className="flex-1">{children}</main>
          <SiteFooter locale={lang} />
        </ThemeProvider>
      </body>
    </html>
  );
}
