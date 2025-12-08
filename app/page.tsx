"use client";

import ScrollablePages from "@/components/ScrollablePages";
import TurnablePages from "@/components/TurnablePages";
import { useManga } from "@/context/MangaContext";

export default function Home() {
  const { chapters, selectedChapter, selectedPage, openSidebar, scrollMode } =
    useManga();

  if (selectedChapter && selectedPage) {
    return (
      <div className="h-screen w-screen bg-black text-white overflow-hidden">
        {scrollMode ? <ScrollablePages /> : <TurnablePages />}
      </div>
    );
  }

  let message: string;

  if (chapters.length === 0) message = "Upload manga";
  else if (!selectedChapter) message = "Select chapter";
  else message = "Select page";

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
      <button
        onClick={openSidebar}
        className="px-6 py-3 border-2 hover:bg-white/20"
      >
        {message}
      </button>
    </div>
  );
}
