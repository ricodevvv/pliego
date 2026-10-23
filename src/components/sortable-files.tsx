"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";
import { useMemo } from "react";
import { Dropzone, FileRow } from "@/components/tool-shell";
import { useDictionary } from "@/lib/use-dictionary";

const ids = new WeakMap<File, string>();
let counter = 0;

function idOf(file: File) {
  if (!ids.has(file)) ids.set(file, `f${counter++}`);
  return ids.get(file)!;
}

function SortableRow({ file, onRemove }: { file: File; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: idOf(file) });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? "relative z-10 opacity-80" : undefined}>
      <FileRow
        file={file}
        onRemove={onRemove}
        handle={
          <button type="button" {...attributes} {...listeners} className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing" aria-label="drag">
            <GripVerticalIcon className="size-4" />
          </button>
        }
      />
    </div>
  );
}

/**
 * A file list you can drag into the order the files should be processed in.
 */
export function SortableFiles({ files, onChange, accept }: { files: File[]; onChange: (files: File[]) => void; accept: string }) {
  const t = useDictionary();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const items = useMemo(() => files.map(idOf), [files]);
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(arrayMove(files, items.indexOf(String(active.id)), items.indexOf(String(over.id))));
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">{t.tool.dragToSort}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {files.map((file, index) => (
            <SortableRow key={idOf(file)} file={file} onRemove={() => onChange(files.filter((_, i) => i !== index))} />
          ))}
        </SortableContext>
      </DndContext>
      <Dropzone accept={accept} multiple compact onFiles={(more) => onChange([...files, ...more])} />
    </div>
  );
}
