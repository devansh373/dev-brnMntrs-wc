import { DndContext, useDraggable, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { useEffect, useState } from "react";

interface TemplateEditorProps {
  backgroundImageUrl: string;
  onSave: (positions: { field: string; x: number; y: number }[]) => void;
  showContainer: boolean;
  setShowContainer: (value: boolean) => void;
}

const fields = ["name", "college", "workshopName", "date"];

type Position = { x: number; y: number };

export default function TemplateEditor({
  backgroundImageUrl,
  onSave,
  setShowContainer,
}: TemplateEditorProps) {
  const [positions, setPositions] = useState<Record<string, Position>>({});

  useEffect(() => {
    const initial: Record<string, Position> = {};
    fields.forEach((f) => {
      initial[f] = { x: 100, y: 100 };
    });
    setPositions(initial);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const id = active.id as string;

    setPositions((prev) => {
      const prevPos = prev[id];
      console.log(Math.floor(prevPos.x + delta.x), prevPos.y + delta.y);
      return {
        ...prev,
        [id]: {
          x: Math.floor(prevPos.x + delta.x),
          y: Math.floor(prevPos.y + delta.y),
        },
      };
    });
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 842,
          height: 595,
          //   position: "absolute",
          //   left:0,
          //   top:0,
          //   zIndex:10,
          //   transform:"scaleX(-1)",
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          border: "1px solid #ccc",
          margin: "auto",
        }}
      >
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {fields.map((field) => (
            <DraggableLabel
              key={field}
              id={field}
              x={positions[field]?.x || 0}
              y={positions[field]?.y || 0}
            />
          ))}
        </DndContext>
      </div>

      <button
        onClick={() => {
          const output = fields.map((field) => ({
            field,
            x:
              field === "name"
                ? positions[field].x - 170
                : field === "workshopName"
                ? positions[field].x + 10
                : positions[field].x,
            y: 575 - positions[field].y,
          }));
          onSave(output);
        }}
        className=" bg-blue-600 text-white px-4 py-2 rounded absolute right-[45%] bottom-4 cursor-pointer"
      >
        Save Field Positions
      </button>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded absolute right-10 top-4 cursor-pointer"
        onClick={() => setShowContainer(false)}
      >
        X
      </button>
    </div>
  );
}

function DraggableLabel({ id, x, y }: { id: string; x: number; y: number }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: `translate3d(${x + (transform?.x || 0)}px, ${
          y + (transform?.y || 0)
        }px, 0)`,
        position: "absolute",
        padding: "4px 8px",
        background: "rgba(255,255,0,0.85)",
        border: "1px solid #666",
        fontSize: 12,
        cursor: "grab",
        zIndex: 10,
      }}
    >
      {`{{${id}}}`}
    </div>
  );
}
