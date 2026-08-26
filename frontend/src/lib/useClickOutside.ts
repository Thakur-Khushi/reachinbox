import { useEffect, type RefObject } from "react";

export function useClickOutside(
  ref: RefObject<HTMLElement>,
  active: boolean,
  onOutsideClick: () => void
) {
  useEffect(() => {
    if (!active) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutsideClick();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [active, ref, onOutsideClick]);
}
