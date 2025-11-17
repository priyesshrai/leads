"use client";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname
    .split("/")
    .filter((seg) => seg && seg.trim() !== "");

  const toTitle = (str: string) =>
    str
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const formatted = segments.map((seg) => toTitle(seg));
  const currentPath = formatted.length - 1;

  return (
    <div className="text-sm text-gray-800 flex items-center gap-2 font-medium">
      {formatted.map((seg, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className={`${i !== currentPath && "text-blue-600"}`} >{seg}</span>
          {i !== formatted.length - 1 && <span><ChevronRight size={14} /></span>}
        </span>
      ))}
    </div>
  );
}
