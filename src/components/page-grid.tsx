"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RotateCcwIcon, RotateCwIcon, Trash2Icon, Undo2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { readBytes } from "@/lib/files";
import { canvasToBlob, openPdfjs } from "@/lib/pdf/core";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/lib/use-dictionary";

export interface GridPage {
  id: string;
  index: number;
  rotation: number;
  deleted: boolean;
}

/**
 * Renders small previews of every page in the background, one at a time.
 */
export function useThumbnails(file: File | undefined, width = 220) {
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    const urls: string[] = [];
    (async () => {
      try {
        const doc = await openPdfjs(await readBytes(file));
        if (cancelled) return;
        setCount(doc.numPages);
        for (let n = 1; n <= doc.numPages && !cancelled; n++) {
          const page = await doc.getPage(n);
          const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext("2d")!;
          context.fillStyle = "#fff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          const url = URL.createObjectURL(await canvasToBlob(canvas, "image/jpeg", 0.8));
          urls.push(url);
          if (!cancelled) setThumbs([...urls]);
          page.cleanup();
        }
        await doc.loadingTask.destroy();
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
      setThumbs([]);
      setCount(0);
      setFailed(false);
    };
  }, [file, width]);

  return { thumbs, count, failed };
}

export function initialPages(count: number): GridPage[] {
  return Array.from({ length: count }, (_, index) => ({ id: `p${index}`, index, rotation: 0, deleted: false }));
}

function PageCard({
  page,
  thumb,
  position,
  sortable,
  canDelete,
  onChange,
}: {
  page: GridPage;
  thumb?: string;
  position: number;
  sortable: boolean;
  canDelete: boolean;
  onChange: (page: GridPage) => void;
}) {
  const t = useDictionary();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id, disabled: !sortable });
  const button = "grid size-7 place-items-center rounded-md bg-background/90 text-muted-foreground shadow-sm ring-1 ring-border hover:text-foreground";
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group relative flex flex-col gap-2", isDragging && "z-10 opacity-80")}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "relative grid aspect-square place-items-center overflow-hidden rounded-lg border bg-muted/40 p-3 transition-all duration-200 hover:border-brand/50",
          sortable && "cursor-grab touch-none active:cursor-grabbing",
          page.deleted && "opacity-30",
        )}
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            draggable={false}
            className="thumb max-h-full max-w-full shadow-sm ring-1 ring-black/5 transition-transform duration-300"
            style={{ transform: `rotate(${page.rotation}deg)` }}
          />
        ) : (
          <div className="size-1/2 animate-pulse rounded bg-muted" />
        )}
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        {!page.deleted && (
          <>
            <button type="button" aria-label={t.tool.rotateLeft} className={button} onClick={() => onChange({ ...page, rotation: page.rotation - 90 })}>
              <RotateCcwIcon className="size-3.5" />
            </button>
            <button type="button" aria-label={t.tool.rotateRight} className={button} onClick={() => onChange({ ...page, rotation: page.rotation + 90 })}>
              <RotateCwIcon className="size-3.5" />
            </button>
          </>
        )}
        {canDelete && (
          <button
            type="button"
            aria-label={page.deleted ? t.tool.restore : t.tool.delete}
            className={button}
            onClick={() => onChange({ ...page, deleted: !page.deleted })}
          >
            {page.deleted ? <Undo2Icon className="size-3.5" /> : <Trash2Icon className="size-3.5" />}
          </button>
        )}
      </div>
      <span className="text-center text-xs text-muted-foreground tabular-nums">{position}</span>
    </div>
  );
}

/**
 * A grid of page previews you can rotate, delete and drag into a new order.
 */
export function PageGrid({
  file,
  pages,
  onChange,
  sortable = true,
  canDelete = true,
}: {
  file: File;
  pages: GridPage[];
  onChange: (pages: GridPage[]) => void;
  sortable?: boolean;
  canDelete?: boolean;
}) {
  const { thumbs, count } = useThumbnails(file);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (count && pages.length !== count) onChange(initialPages(count));
  }, [count, pages.length, onChange]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = pages.findIndex((page) => page.id === active.id);
    const to = pages.findIndex((page) => page.id === over.id);
    onChange(arrayMove(pages, from, to));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={pages.map((page) => page.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pages.map((page, position) => (
            <PageCard
              key={page.id}
              page={page}
              thumb={thumbs[page.index]}
              position={position + 1}
              sortable={sortable}
              canDelete={canDelete}
              onChange={(changed) => onChange(pages.map((item) => (item.id === changed.id ? changed : item)))}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
