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
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#0a0a0a", backgroundImage: grid, backgroundSize: "64px 64px", color: "#ededed" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 600 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8.5" fill="#ededed" />
            <path d="M9 6.5h8.5v19H10a1 1 0 0 1-1-1z" fill="#0a0a0a" />
            <path d="M17.5 6.5 24.6 8.6a.6.6 0 0 1 .4.6v7.9a.6.6 0 0 1-.45.58L17.5 19.5z" fill="#ff5a1f" />
          </svg>
          Pliego
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 76, letterSpacing: -3, lineHeight: 1.05 }}>{t.home.title}</div>
          <div style={{ fontSize: 76, letterSpacing: -3, lineHeight: 1.05, color: "#ff6a33" }}>{t.home.titleAccent}</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a1a1a1" }}>pdf.ricodevvv.com</div>
      </div>
    ),
    size,
  );
}
