// import React, { useEffect, useRef, useState } from "react";
// import Draggable from "react-draggable";

// interface TemplateEditorProps {
//   backgroundImageUrl: string;
//   onSave: (positions: { field: string; x: number; y: number }[]) => void;
// }

// const fields = ["name", "college", "workshopName", "date"];

// export default function TemplateEditor({ backgroundImageUrl, onSave }: TemplateEditorProps) {
//   const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
//   const nodeRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

//   useEffect(() => {
//     const initialPositions: Record<string, { x: number; y: number }> = {};
//     fields.forEach((field) => {
//       initialPositions[field] = { x: 100, y: 100 };

//       // Initialize refs only once
//       if (!nodeRefs.current[field]) {
//         nodeRefs.current[field] = React.createRef<HTMLDivElement>();
//       }
//     });
//     setPositions(initialPositions);
//   }, []);

//   const handleDrag = (field: string, e: any, data: any) => {
//     setPositions((prev) => ({
//       ...prev,
//       [field]: { x: data.x, y: data.y },
//     }));
//   };

//   const handleSave = () => {
//     const result = Object.entries(positions).map(([field, pos]) => ({
//       field,
//       x: pos.x,
//       y: pos.y,
//     }));
//     onSave(result);
//   };

//   return (
//     <div className="my-4">
//       <div
//         style={{
//           width: 842,
//           height: 595,
//           backgroundImage: `url(${backgroundImageUrl})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           border: "1px solid #ccc",
//           position: "relative",
//           margin: "auto",
//         }}
//       >
//         {fields.map((field) => {
//           const ref = nodeRefs.current[field]!;
//           return (
//             <Draggable
//               key={field}
//               nodeRef={ref as React.RefObject<HTMLElement>}
//               position={positions[field]}
//               onDrag={(e, data) => handleDrag(field, e, data)}
//             >
//               <div
//                 ref={ref}
//                 style={{
//                   position: "absolute",
//                   padding: "4px 8px",
//                   background: "rgba(255,255,0,0.85)",
//                   border: "1px solid #666",
//                   fontSize: 12,
//                   cursor: "move",
//                 }}
//               >
//                 {`{{${field}}}`}
//               </div>
//             </Draggable>
//           );
//         })}
//       </div>

//       <button
//         onClick={handleSave}
//         className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Save Field Positions
//       </button>
//     </div>
//   );
// }

import { DndContext, useDraggable, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { useEffect, useState } from "react";

interface TemplateEditorProps {
  backgroundImageUrl: string;
  onSave: (positions: { field: string; x: number; y: number }[]) => void;
}

const fields = ["name", "college", "workshopName", "date"];

type Position = { x: number; y: number };

export default function TemplateEditor({
  backgroundImageUrl,
  onSave,
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
      console.log(Math.floor(prevPos.x + delta.x), (prevPos.y + delta.y));
      return {
        ...prev,
        [id]: {
          x: Math.floor(prevPos.x + delta.x),
          y: (Math.floor(prevPos.y + delta.y)),
        },
      };
    });
  };

  return (
    <div style={{
        width: "100vw",
          height: "100vh",
          position: "absolute",
          left:0,
          top:0,
          zIndex:10,
    }}>
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
            x: field==="name"?(positions[field].x-100):(positions[field].x),
            y: 595-positions[field].y,
          }));
          onSave(output);
        }}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded absolute right-0 top-0"
      >
        Save Field Positions
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
