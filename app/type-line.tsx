import type { CSSProperties, ReactNode } from "react";

export function TypeLine({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={`type-line ${className}`.trim()} style={{ "--line-delay": `${delay}ms` } as CSSProperties}>
      <span>{children}</span>
    </span>
  );
}
