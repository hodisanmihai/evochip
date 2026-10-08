export function imageLayout(width: number, height: number) {
  const scale = Math.min(1, 1920 / width);
  const canvasWidth = Math.max(1, Math.round(width * scale));
  const canvasHeight = Math.max(1, Math.round(height * scale));
  return { width: canvasWidth, height: canvasHeight, drawWidth: width * scale,
    drawHeight: height * scale, x: (canvasWidth - width * scale) / 2,
    y: (canvasHeight - height * scale) / 2 };
}
