"use client";

import dynamic from "next/dynamic";
import { findTool, type Tool } from "@/lib/tools";
import { useDictionary } from "@/lib/use-dictionary";

function Loading() {
  const t = useDictionary();
  return <div className="grid h-72 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">{t.tool.loading}</div>;
}

const COMPONENTS: Record<string, React.ComponentType<{ tool: Tool }>> = {
  merge: dynamic(() => import("@/components/tools/merge"), { ssr: false, loading: Loading }),
  split: dynamic(() => import("@/components/tools/split"), { ssr: false, loading: Loading }),
  organize: dynamic(() => import("@/components/tools/organize"), { ssr: false, loading: Loading }),
  rotate: dynamic(() => import("@/components/tools/rotate"), { ssr: false, loading: Loading }),
  compress: dynamic(() => import("@/components/tools/compress"), { ssr: false, loading: Loading }),
  ocr: dynamic(() => import("@/components/tools/ocr"), { ssr: false, loading: Loading }),
  "images-to-pdf": dynamic(() => import("@/components/tools/images-to-pdf"), { ssr: false, loading: Loading }),
  "word-to-pdf": dynamic(() => import("@/components/tools/office"), { ssr: false, loading: Loading }),
  "excel-to-pdf": dynamic(() => import("@/components/tools/office"), { ssr: false, loading: Loading }),
  "powerpoint-to-pdf": dynamic(() => import("@/components/tools/office"), { ssr: false, loading: Loading }),
  "pdf-to-images": dynamic(() => import("@/components/tools/pdf-to-images"), { ssr: false, loading: Loading }),
  "pdf-to-word": dynamic(() => import("@/components/tools/office"), { ssr: false, loading: Loading }),
  "extract-text": dynamic(() => import("@/components/tools/extract-text"), { ssr: false, loading: Loading }),
  "page-numbers": dynamic(() => import("@/components/tools/page-numbers"), { ssr: false, loading: Loading }),
  watermark: dynamic(() => import("@/components/tools/watermark"), { ssr: false, loading: Loading }),
  sign: dynamic(() => import("@/components/tools/sign"), { ssr: false, loading: Loading }),
  "fill-forms": dynamic(() => import("@/components/tools/fill-forms"), { ssr: false, loading: Loading }),
  protect: dynamic(() => import("@/components/tools/protect"), { ssr: false, loading: Loading }),
  unlock: dynamic(() => import("@/components/tools/unlock"), { ssr: false, loading: Loading }),
};

export function ToolLoader({ slug }: { slug: string }) {
  const tool = findTool(slug)!;
  const Component = COMPONENTS[slug];
  return <Component tool={tool} />;
}
