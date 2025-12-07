"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { FilePickerButton } from "./FilePickerButton";
import { useManga, MangaChapter, MangaPage } from "@/context/MangaContext";

interface FileWithPath extends File {
  webkitRelativePath: string;
}

export default function CollapsibleSidebar() {
  const {
    chapters,
    setChapters,
    selectedChapter,
    setSelectedChapter,
    selectedPage,
    setSelectedPage,
    openReader,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    zoom,
    setZoom,
    scrollMode,
    setScrollMode,
  } = useManga();

  function handleDirectory(fileList: FileList) {
    const files = Array.from(fileList) as FileWithPath[];
    const chapterRegex = /^chapter_\d{4}-\d{2}$/i;
    const chapterMap = new Map<string, FileWithPath[]>();

    for (const file of files) {
      const rel = file.webkitRelativePath;
      if (!rel) continue;
      const parts = rel.split("/").filter(Boolean);
      const folder = parts.find((p) => chapterRegex.test(p));
      if (!folder) continue;
      if (!chapterMap.has(folder)) chapterMap.set(folder, []);
      chapterMap.get(folder)!.push(file);
    }

    const chaptersArr: MangaChapter[] = [...chapterMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([folder, files]) => ({
        id: folder,
        title: folder,
        pages: files
          .sort((a, b) =>
            a.webkitRelativePath.localeCompare(
              b.webkitRelativePath,
              undefined,
              { numeric: true }
            )
          )
          .map<MangaPage>((file) => ({
            id: file.webkitRelativePath,
            url: URL.createObjectURL(file),
          })),
      }));

    setChapters(chaptersArr);
    setSelectedChapter(null);
    setSelectedPage(null);
    openSidebar();
  }

  function toggleChapter(chapter: MangaChapter) {
    if (selectedChapter?.id === chapter.id) setSelectedChapter(null);
    else setSelectedChapter(chapter);
  }

  function handlePageClick(page: MangaPage) {
    setSelectedPage(page);
    openReader();
    closeSidebar();
  }

  const currentIndex =
    selectedChapter && selectedPage
      ? selectedChapter.pages.findIndex((p) => p.id === selectedPage.id)
      : 0;

  return (
    <>
      {/* OVERLAY */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="overlay"
            className="fixed inset-0 bg-black/80 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-black border-r-2 shadow-xl z-50
          flex flex-col transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-72" : "w-14"}
        `}
      >
        {/* TOGGLE BUTTON */}
        <button
          onClick={isSidebarOpen ? closeSidebar : openSidebar}
          className="fixed top-2 left-1 z-50 p-2 text-white"
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </button>

        {isSidebarOpen && (
          <div className="flex flex-col h-full pt-16 overflow-hidden text-white">
            {/* FILE PICKER */}
            <div className="p-6 space-y-4 shrink-0">
              <h2 className="text-xl font-bold ml-2">ZMREADER</h2>
              <FilePickerButton onSelect={handleDirectory}>
                Choose Manga Folder
              </FilePickerButton>
            </div>

            {/* CHAPTER LIST */}
            <div className="flex-1 overflow-y-auto px-6 space-y-2">
              {chapters.length > 0 ? (
                <ul className="space-y-2">
                  {chapters.map((ch) => {
                    const isOpen = selectedChapter?.id === ch.id;
                    return (
                      <li key={ch.id}>
                        <div
                          onClick={() => toggleChapter(ch)}
                          className={`px-3 py-1 cursor-pointer flex justify-between items-center 
                            ${isOpen ? "bg-white/20" : "hover:bg-white/10"}`}
                        >
                          <span className="truncate">{ch.title}</span>
                          <span>{isOpen ? "▾" : "▸"}</span>
                        </div>

                        {isOpen && (
                          <ul className="ml-6 mt-1 space-y-1 overflow-hidden">
                            {ch.pages.map((p) => {
                              const name = p.id.split("/").pop() ?? p.id;
                              const isSelected = selectedPage?.id === p.id;
                              return (
                                <li
                                  key={p.id}
                                  onClick={() => handlePageClick(p)}
                                  className={`text-sm px-2 py-1 truncate cursor-pointer 
                                    ${
                                      isSelected
                                        ? "bg-white/30"
                                        : "hover:bg-white/10"
                                    }`}
                                >
                                  {name}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex-1 flex items-center text-sm opacity-60 ml-2">
                  No chapters found.
                </div>
              )}
            </div>

            {/* FOOTER: PAGE TURN + ZOOM + MODE */}
            <div className="p-4 border-t border-white/20 text-white flex flex-col items-center gap-2 shrink-0">
              {/* PAGE TURN CONTROLS */}
              {selectedChapter && selectedPage && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      const idx = currentIndex;
                      if (idx > 0)
                        setSelectedPage(selectedChapter.pages[idx - 1]);
                    }}
                    className="px-2.5 py-1 hover:bg-white/20"
                    disabled={currentIndex === 0}
                  >
                    ◀
                  </button>

                  <span className="w-24 text-sm opacity-80">
                    {currentIndex + 1} / {selectedChapter.pages.length}
                  </span>

                  <button
                    onClick={() => {
                      const idx = currentIndex;
                      if (idx < selectedChapter.pages.length - 1)
                        setSelectedPage(selectedChapter.pages[idx + 1]);
                    }}
                    className="px-2.5 py-1 hover:bg-white/20"
                    disabled={currentIndex === selectedChapter.pages.length - 1}
                  >
                    ▶
                  </button>
                </div>
              )}

              {/* ZOOM CONTROLS */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="px-3 py-1 hover:bg-white/20"
                >
                  -
                </button>
                <span className="w-24 text-sm opacity-80">
                  {zoom.toFixed(2)}x
                </span>
                <button
                  onClick={() => setZoom(zoom + 0.1)}
                  className="px-3 py-1 hover:bg-white/20"
                >
                  +
                </button>
              </div>

              {/* MODE TOGGLE */}
              <button
                onClick={() => setScrollMode(!scrollMode)}
                className="px-2 py-1 w-36 hover:bg-white/20 border-2 text-sm"
              >
                {scrollMode ? "Scroll Mode" : "Page Turn"}
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
