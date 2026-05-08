import { CSSProperties } from "react";

type MaterialIconProps = {
  name: string;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
};

export default function MaterialIcon({
  name,
  filled = false,
  className = "",
  style,
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined${filled ? " filled" : ""} ${className}`}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  );
}
