"use client";

import { useRef } from "react";
import type { Area } from "react-easy-crop";

type Handle = "move" | "nw" | "ne" | "sw" | "se";
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function FreeImageCrop({ src, width, height, area, onChange, disabled }: {
  src: string; width: number; height: number; area: Area | null;
  onChange: (area: Area) => void; disabled: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ handle: Handle; x: number; y: number; area: Area } | null>(null);
  const selection = area ?? { x: 0, y: 0, width, height };
  const point = (clientX: number, clientY: number) => {
    const matrix = svg.current?.getScreenCTM();
    return matrix ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse()) : null;
  };
  const adjust = (handle: Handle, start: Area, dx: number, dy: number) => {
    if (handle === "move") {
      onChange({ ...start, x: clamp(start.x + dx, 0, width - start.width), y: clamp(start.y + dy, 0, height - start.height) });
      return;
    }
    const min = Math.min(10, width, height);
    const left = handle.endsWith("w") ? clamp(start.x + dx, 0, start.x + start.width - min) : start.x;
    const top = handle.startsWith("n") ? clamp(start.y + dy, 0, start.y + start.height - min) : start.y;
    const right = handle.endsWith("e") ? clamp(start.x + start.width + dx, start.x + min, width) : start.x + start.width;
    const bottom = handle.startsWith("s") ? clamp(start.y + start.height + dy, start.y + min, height) : start.y + start.height;
    onChange({ x: left, y: top, width: right - left, height: bottom - top });
  };
  const size = Math.max(width, height) / 35;
  return <svg ref={svg} viewBox={`0 0 ${width} ${height}`} className="h-full w-full touch-none select-none"
    aria-label="Editor crop liber" onPointerMove={(event) => {
      if (!drag.current || disabled) return;
      const p = point(event.clientX, event.clientY);
      if (p) adjust(drag.current.handle, drag.current.area, p.x - drag.current.x, p.y - drag.current.y);
    }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
    <image href={src} width={width} height={height} />
    <path d={`M0 0H${width}V${height}H0Z M${selection.x} ${selection.y}v${selection.height}h${selection.width}v-${selection.height}Z`} fill="black" fillOpacity={0.55} fillRule="evenodd" pointerEvents="none" />
    {(["move", "nw", "ne", "sw", "se"] as Handle[]).map((handle) => {
      const moving = handle === "move";
      const x = moving ? selection.x : selection.x + (handle.endsWith("e") ? selection.width : 0) - size / 2;
      const y = moving ? selection.y : selection.y + (handle.startsWith("s") ? selection.height : 0) - size / 2;
      return <rect key={handle} x={x} y={y} width={moving ? selection.width : size} height={moving ? selection.height : size}
        fill={moving ? "transparent" : "white"} stroke="white" strokeWidth={Math.max(1, width / 500)}
        tabIndex={disabled ? -1 : 0} role="button" aria-label={moving ? "Mută selecția cu săgețile" : `Redimensionează colțul ${handle} cu săgețile`}
        style={{ cursor: disabled ? "default" : moving ? "move" : `${handle}-resize` }}
        onKeyDown={(event) => {
          if (disabled || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
          event.preventDefault();
          const step = event.shiftKey ? 20 : 1;
          adjust(handle, selection, event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0,
            event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0);
        }} onPointerDown={(event) => {
          if (disabled) return;
          event.preventDefault();
          const p = point(event.clientX, event.clientY);
          if (!p) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { handle, x: p.x, y: p.y, area: selection };
        }} />;
    })}
  </svg>;
}
