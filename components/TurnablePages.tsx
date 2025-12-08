"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useManga } from "@/context/MangaContext";
import Image from "next/image";

export default function TurnablePages() {
  const { selectedChapter, selectedPage, selectPage } = useManga();

  const pages = useMemo(() => selectedChapter?.pages ?? [], [selectedChapter]);
  const currentIndex = selectedPage
    ? pages.findIndex((p) => p.id === selectedPage.id)
    : 0;

  const goToPage = useCallback(
    (index: number) => {
      if (index < 0 || index >= pages.length) return;
      selectPage(pages[index]);
    },
    [pages, selectPage]
  );

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const x = e.clientX;
    if (x < window.innerWidth / 2) goToPage(currentIndex - 1);
    else goToPage(currentIndex + 1);
  };

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

  return (
    <div
      className="h-screen w-screen bg-black flex flex-col items-center justify-center relative"
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
