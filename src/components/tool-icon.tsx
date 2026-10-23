import {
  Combine,
  FileInput,
  FilePen,
  FileText,
  FormInput,
  ImagePlus,
  Images,
  LayoutGrid,
  ListOrdered,
  Lock,
  LockOpen,
  Minimize2,
  Presentation,
  RotateCw,
  ScanText,
  Sheet,
  Signature,
  Split,
  Stamp,
  TextCursorInput,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  combine: Combine,
  split: Split,
  "layout-grid": LayoutGrid,
  "rotate-cw": RotateCw,
  "minimize-2": Minimize2,
  "scan-text": ScanText,
  "image-plus": ImagePlus,
  "file-text": FileText,
  sheet: Sheet,
  presentation: Presentation,
  images: Images,
  "file-pen": FilePen,
  "text-cursor-input": TextCursorInput,
  "list-ordered": ListOrdered,
  stamp: Stamp,
  signature: Signature,
  "form-input": FormInput,
  lock: Lock,
  "lock-open": LockOpen,
};

export function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? FileInput;
  return <Icon className={className} />;
}
