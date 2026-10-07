import { Fragment } from "react";

// Render only our formatting tags as React nodes; never inject stored HTML.
export default function SafeRichText({ text }: { text: string }) {
  const parts = text.split(/(<\/?(?:b|strong|em|i|br)\s*\/?>)/gi);
  let bold = false;
  let italic = false;
  return parts.map((part, index) => {
    if (/^<br\s*\/?>$/i.test(part)) return <br key={index} />;
    if (/^<\/?(?:b|strong)>$/i.test(part)) { bold = !part.startsWith("</"); return null; }
    if (/^<\/?(?:i|em)>$/i.test(part)) { italic = !part.startsWith("</"); return null; }
    const content = part.replace(/<[^>]*>/g, "");
    return <Fragment key={index}>{bold ? <strong>{italic ? <em>{content}</em> : content}</strong> : italic ? <em>{content}</em> : content}</Fragment>;
  });
}
