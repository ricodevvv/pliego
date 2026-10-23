import { ImageResponse } from "next/og";
import { getDictionary, isLocale, LOCALES } from "@/lib/i18n";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  const grid = "linear-gradient(to right, #1f1f1f 1px, transparent 1px), linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, background: "#f2f2f7", color: "#000", textAlign: "center", padding: 80 }}>
        <div style={{ display: "flex", width: 120, height: 120, borderRadius: 27, background: "linear-gradient(180deg, #ff8a4c, #ff5a1f)" }}>
          <svg width="120" height="120" viewBox="0 0 32 32">
            <path d="M9 6.5h8.5v19H10a1 1 0 0 1-1-1z" fill="#fff" />
            <path d="M17.5 6.5 24.6 8.6a.6.6 0 0 1 .4.6v7.9a.6.6 0 0 1-.45.58L17.5 19.5z" fill="#fff" fillOpacity="0.72" />
          </svg>
        </div>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: "#ff5a1f" }}>Pliego</div>
        <div style={{ display: "flex", fontSize: 70, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.05, maxWidth: 1040 }}>{t.home.title}</div>
        <div style={{ display: "flex", fontSize: 34, color: "rgba(60,60,67,0.6)" }}>{t.home.titleAccent}</div>
      </div>
    ),
    size,
  );
}
