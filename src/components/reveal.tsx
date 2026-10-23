"use client";

import { useEffect } from "react";

/**
 * Fades elements marked with data-reveal into view as they scroll in, including ones added later.
 */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.in)").forEach((element) => io.observe(element));
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mutations.disconnect();
    };
  }, []);
  return null;
}
