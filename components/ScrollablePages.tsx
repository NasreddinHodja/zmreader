"use client";
import { useRef, useEffect } from "react";
import { useManga } from "@/context/MangaContext";
import Image from "next/image";

export default function ScrollablePages() {
  const {
    selectedChapter,
    selectedPage,
    zoom,
    selectPage,
    openReader,
    shouldScroll,
  } = useManga();

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingToPage = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!selectedPage || !selectedChapter) return;
    if (!shouldScroll) return;

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
  }, [selectedPage, selectedChapter, shouldScroll, openReader]);

  useEffect(() => {
    if (!selectedChapter || !selectedPage) return;

    const index = selectedChapter.pages.findIndex(
      (p) => p.id === selectedPage.id
    );
    const currentRef = pageRefs.current[index];
    if (!currentRef) return;

    let lastY = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingToPage.current) return;

        const entry = entries[0];
        const isVisible = entry.intersectionRatio > 0;

        if (!isVisible) {
          const currentTop = entry.boundingClientRect.top;

          const direction = currentTop < lastY ? "down" : "up";
          lastY = currentTop;

          const newIndex = direction === "down" ? index + 1 : index - 1;

          if (newIndex >= 0 && newIndex < selectedChapter.pages.length) {
            const nextPage = selectedChapter.pages[newIndex];
            selectPage(nextPage, false);
          }
        }
      },
      {
        root: null,
        threshold: [0, 0.01], // detect only when page is fully off-screen
      }
    );

    observer.observe(currentRef);

    return () => observer.disconnect();
  }, [selectedPage, selectedChapter, selectPage]);

  if (!selectedChapter) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto py-4 gap-2">
      {selectedChapter.pages.map((page, i) => (
        <div
          key={page.id}
          ref={(el) => {
            pageRefs.current[i] = el;
          }}
          className="w-full flex justify-center"
        >
          <div className="relative w-full">
            <Image
              src={page.url}
              alt=""
              width={0}
              height={0}
              sizes="100vw"
              className="mx-auto"
              style={{
                width: `${zoom * 100}%`,
                height: "auto",
              }}
              onClick={() => selectPage(page, false)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
