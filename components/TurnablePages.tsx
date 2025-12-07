"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useManga } from "@/context/MangaContext";
import Image from "next/image";

export default function TurnablePages() {
  const { selectedChapter, selectedPage, setSelectedPage } = useManga();

  const pages = useMemo(() => selectedChapter?.pages ?? [], [selectedChapter]);

  const currentIndex = selectedPage
    ? pages.findIndex((p) => p.id === selectedPage.id)
    : 0;

  const goToPage = useCallback(
    (index: number) => {
      if (index < 0 || index >= pages.length) return;
      setSelectedPage(pages[index]);
    },
    [pages, setSelectedPage]
  );

  // handle arrow keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToPage(currentIndex + 1);
      if (e.key === "ArrowLeft") goToPage(currentIndex - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, goToPage]);

  if (!selectedChapter || pages.length === 0) return null;

  const page = pages[currentIndex];

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX } = e;
    const half = window.innerWidth / 2;
    if (clientX < half) goToPage(currentIndex - 1);
    else goToPage(currentIndex + 1);
  };

  return (
    <div
      className="h-screen w-screen bg-black flex flex-col items-center justify-center relative cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-1 flex items-center justify-center w-full">
        <Image
          src={page.url}
          alt=""
          width={0}
          height={0}
          sizes="100vw"
          style={{
            maxWidth: "100%",
            maxHeight: "100vh",
            objectFit: "contain",
            width: "auto",
            height: "auto",
          }}
        />
      </div>
    </div>
  );
}
