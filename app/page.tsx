"use client";

import ScrollablePages from "@/components/ScrollablePages";
import { useManga } from "@/context/MangaContext";

export default function Home() {
  const { chapters, selectedChapter, selectedPage, openSidebar } = useManga();

  if (selectedChapter && selectedPage) {
    return (
      <div className="h-screen w-screen bg-black text-white overflow-hidden">
        <ScrollablePages />
      </div>
    );
  }

  let message: string;

  if (chapters.length === 0) {
    message = "Upload manga";
  } else if (!selectedChapter) {
    message = "Select chapter";
  } else {
    message = "Select page";
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <button
        onClick={openSidebar}
        className="px-6 py-3 text-white border-2 hover:bg-white/20"
      >
        {message}
      </button>
    </div>
  );
}
