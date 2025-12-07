"use client";

import { useRef } from "react";

export const FilePickerButton = ({
  onSelect,
  children = "Manga directory",
  className = "w-full text-left px-3 py-2 hover:bg-white/20 transition border-2",
}: {
  onSelect: (files: FileList) => void;
  children?: React.ReactNode;
  className?: string;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <label className={className + " cursor-pointer block"}>
        <input
          ref={(el) => {
            if (!el) return;
            el.setAttribute("webkitdirectory", "");
            el.setAttribute("directory", "");
            el.multiple = true;
            inputRef.current = el;
          }}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onSelect(e.target.files);
          }}
        />
        {children}
      </label>
    </>
  );
};
