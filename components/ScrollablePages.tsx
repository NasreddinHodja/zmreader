"use client";

import { useRef, useEffect } from "react";
import { useManga } from "@/context/MangaContext";
import Image from "next/image";

export default function ScrollablePages() {
  const { selectedChapter, selectedPage, zoom, setSelectedPage, openReader } =
    useManga();

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!selectedPage || !selectedChapter) return;

    openReader();

    const index = selectedChapter.pages.findIndex(
      (p) => p.id === selectedPage.id
    );

    const ref = pageRefs.current[index];
    if (ref) ref.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedPage, selectedChapter, openReader]);

  if (!selectedChapter) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-2">
      {selectedChapter.pages.map((page, i) => {
        return (
          <div
            key={page.id}
            ref={(el) => {
              pageRefs.current[i] = el;
            }}
            className="w-full flex justify-center"
          >
            <div className="relative" style={{ width: `${zoom * 100}%` }}>
              <Image
                src={page.url}
                alt=""
                width={0}
                height={0}
                sizes="100vw"
                style={{
                  width: "100%",
                  height: "auto",
                }}
                onClick={() => setSelectedPage(page)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
