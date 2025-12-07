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

  useEffect(() => {
    if (!selectedChapter) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = pageRefs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) {
              const page = selectedChapter.pages[idx];
              if (page.id !== selectedPage?.id) setSelectedPage(page);
            }
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: "0px",
        threshold: 0.5, // 50% of the image visible triggers it
      }
    );

    pageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      pageRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [selectedChapter, selectedPage, setSelectedPage]);

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
