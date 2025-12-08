"use client";
import { useRef, useEffect } from "react";
import { useManga } from "@/context/MangaContext";
import Image from "next/image";

export default function ScrollablePages() {
  const { selectedChapter, selectedPage, zoom, setSelectedPage, openReader } =
    useManga();
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingToPage = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (!selectedPage || !selectedChapter) return;
    openReader();

    const index = selectedChapter.pages.findIndex(
      (p) => p.id === selectedPage.id
    );
    const ref = pageRefs.current[index];

    if (ref) {
      isScrollingToPage.current = true;
      ref.scrollIntoView({ behavior: "smooth", block: "center" });

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isScrollingToPage.current = false;
      }, 1000);
    }
  }, [selectedPage, selectedChapter, openReader]);

  useEffect(() => {
    if (!selectedChapter) return;
    const pagesSnapshot = [...pageRefs.current];

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingToPage.current) return;

        let mostVisible = { idx: -1, ratio: 0 };

        entries.forEach((entry) => {
          const idx = pagesSnapshot.findIndex((el) => el === entry.target);
          if (idx !== -1 && entry.intersectionRatio > mostVisible.ratio) {
            mostVisible = { idx, ratio: entry.intersectionRatio };
          }
        });

        if (mostVisible.idx !== -1 && mostVisible.ratio > 0.8) {
          const page = selectedChapter.pages[mostVisible.idx];
          if (page.id !== selectedPage?.id) {
            setSelectedPage(page);
          }
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: [0, 0.25, 0.5, 0.75, 0.8, 1],
      }
    );

    pagesSnapshot.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      pagesSnapshot.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
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
            <div className="relative">
              <Image
                src={page.url}
                alt=""
                width={0}
                height={0}
                sizes="100vw"
                className="mx-auto"
                style={{
                  width: "auto",
                  height: "auto",
                  maxWidth: `${zoom * 100}%`,
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
