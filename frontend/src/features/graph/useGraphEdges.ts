"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { Graph } from "@/lib/types";

export interface EdgeLine {
  /** SVG cubic-bezier path data from the source's right edge to the target's left edge. */
  d: string;
}

/**
 * Measures DOM positions of graph nodes and produces SVG line coordinates for
 * each prerequisite edge, recomputing on resize. Keeps the rendering component
 * free of layout math.
 */
export function useGraphEdges(graph: Graph | null) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [lines, setLines] = useState<EdgeLine[]>([]);

  const setNodeRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) nodeRefs.current.set(id, el);
      else nodeRefs.current.delete(id);
    },
    [],
  );

  const recompute = useCallback(() => {
    if (!graph || !containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const next: EdgeLine[] = [];
    for (const edge of graph.edges) {
      const from = nodeRefs.current.get(edge.from);
      const to = nodeRefs.current.get(edge.to);
      if (!from || !to) continue;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      const ox = container.left;
      const oy = container.top;
      const sameColumn = Math.abs(a.left - b.left) < 6;

      let d: string;
      if (sameColumn) {
        // Prerequisite within the same topic column: bow a C-curve out the
        // right side (into the column gap) connecting both right edges — never
        // crosses the cards.
        const x = a.right - ox;
        const y1 = a.top - oy + a.height / 2;
        const y2 = b.top - oy + b.height / 2;
        const bow = 22;
        d = `M ${x} ${y1} C ${x + bow} ${y1}, ${x + bow} ${y2}, ${x} ${y2}`;
      } else {
        // Cross-column edge: smooth horizontal S-curve from source's right edge
        // to target's left edge, living in the gap between columns.
        const x1 = a.right - ox;
        const y1 = a.top - oy + a.height / 2;
        const x2 = b.left - ox;
        const y2 = b.top - oy + b.height / 2;
        const dx = Math.max(24, (x2 - x1) * 0.45);
        d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      }
      next.push({ d });
    }
    setLines(next);
  }, [graph]);

  useLayoutEffect(() => {
    recompute();
    const observer = new ResizeObserver(recompute);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", recompute);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [recompute]);

  return { containerRef, setNodeRef, lines };
}
