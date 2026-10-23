"use client";

import type { Tool } from "@/lib/tools";
import Organize from "./organize";

export default function Rotate({ tool }: { tool: Tool }) {
  return <Organize tool={tool} rotateOnly />;
}
