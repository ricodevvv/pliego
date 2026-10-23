"use client";

import { useParams } from "next/navigation";
import { DICTIONARIES, isLocale, type Locale } from "./i18n";

export function useLocale(): Locale {
  const { lang } = useParams<{ lang: string }>();
  return lang && isLocale(lang) ? lang : "en";
}

export function useDictionary() {
  return DICTIONARIES[useLocale()];
}
