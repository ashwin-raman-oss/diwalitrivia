import { useLayoutEffect, useRef } from 'react';

/**
 * Renders text at its CSS font size, then shrinks it step by step until it
 * fits its box in at most `maxLines` lines (used for category names).
 */
export default function FitText({
  text,
  className,
  maxLines = 2,
}: {
  text: string;
  className?: string;
  maxLines?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = '';
      const style = getComputedStyle(el);
      let size = parseFloat(style.fontSize);
      const lineRatio = parseFloat(style.lineHeight) / size || 1.2;
      const box = el.parentElement ?? el;
      const boxStyle = getComputedStyle(box);
      const avail =
        box.clientHeight - parseFloat(boxStyle.paddingTop) - parseFloat(boxStyle.paddingBottom);
      const min = 8;
      const overflows = () =>
        // Half a line of slack: tall glyphs can poke past the line box without adding a line.
        el.scrollHeight > Math.min(avail, size * lineRatio * (maxLines + 0.5)) ||
        el.scrollWidth > el.clientWidth + 1;
      while (size > min && overflows()) {
        size -= 1;
        el.style.fontSize = `${size}px`;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement ?? el);
    return () => ro.disconnect();
  }, [text, maxLines]);

  return (
    <div ref={ref} className={className}>
      {text}
    </div>
  );
}
