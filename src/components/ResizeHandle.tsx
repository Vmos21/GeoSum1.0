import { PanelResizeHandle } from "react-resizable-panels";

interface ResizeHandleProps {
  direction: "horizontal" | "vertical";
}

// A visible, grabbable divider between panels. Shows a small grip
// indicator and highlights on hover/drag so it's obvious it's interactive.
export default function ResizeHandle({ direction }: ResizeHandleProps) {
  const isHorizontal = direction === "horizontal"; // divider is a vertical bar, drag left/right

  return (
    <PanelResizeHandle
      className={
        isHorizontal
          ? "relative w-2 flex items-center justify-center bg-surface-container-lowest hover:bg-primary/20 data-[resize-handle-active]:bg-primary/30 transition-colors group cursor-col-resize"
          : "relative h-2 flex items-center justify-center bg-surface-container-lowest hover:bg-primary/20 data-[resize-handle-active]:bg-primary/30 transition-colors group cursor-row-resize"
      }
    >
      <div
        className={
          isHorizontal
            ? "w-[3px] h-10 rounded-full bg-outline-variant group-hover:bg-primary transition-colors"
            : "h-[3px] w-10 rounded-full bg-outline-variant group-hover:bg-primary transition-colors"
        }
      />
    </PanelResizeHandle>
  );
}
