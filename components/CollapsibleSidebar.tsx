"use client";

import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { FilePickerButton } from "./FilePickerButton";
import {
  useManga,
  MangaChapter,
  MangaPage,
  FileWithPath,
} from "@/context/MangaContext";

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
        pages: [],
        files,
      }));

    setChapters(chaptersArr);

    // Auto-select first chapter
    if (chaptersArr.length > 0) {
      const firstChapter = chaptersArr[0];
      const files = firstChapter.files ?? [];
      const pages: MangaPage[] = files
        .sort((a, b) =>
          a.webkitRelativePath.localeCompare(b.webkitRelativePath, undefined, {
            numeric: true,
          })
        )
        .map((file) => ({
          id: file.webkitRelativePath,
          url: URL.createObjectURL(file),
        }));

      setSelectedChapter({ ...firstChapter, pages });
      setSelectedPage(pages[0]);
      openReader();
    } else {
      setSelectedChapter(null);
      setSelectedPage(null);
    }

    openSidebar();
  }

  function toggleChapter(chapter: MangaChapter) {
    if (selectedChapter?.id === chapter.id) {
      setSelectedChapter(null);
      setSelectedPage(null);
    } else {
      const files = chapter.files ?? [];
      const pages: MangaPage[] = files
        .sort((a, b) =>
          a.webkitRelativePath.localeCompare(b.webkitRelativePath, undefined, {
            numeric: true,
          })
        )
        .map((file) => ({
          id: file.webkitRelativePath,
          url: URL.createObjectURL(file),
        }));

      setSelectedChapter({ ...chapter, pages });
      setSelectedPage(pages[0]);
      openReader();
    }
  }

  function handlePageClick(page: MangaPage) {
    setSelectedPage(page);
    openReader();
    closeSidebar();
  }

  return (
    <>
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

      <motion.aside
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : "-15rem" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-72 bg-black border-r-2 shadow-xl z-50 flex flex-col"
      >
        <button
          onClick={isSidebarOpen ? closeSidebar : openSidebar}
          className="absolute top-2 right-2 z-10 p-2 text-white hover:bg-white/10 rounded"
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </button>

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full pt-4 overflow-hidden text-white"
            >
              <div className="p-6 space-y-4 shrink-0">
                <h2 className="text-xl font-bold ml-2">ZMREADER</h2>
                <FilePickerButton onSelect={handleDirectory}>
                  Upload Manga Chapter
                </FilePickerButton>
              </div>

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
                              {selectedChapter?.pages.map((p) => {
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

              <div className="p-4 border-t border-white/20 text-white flex items-center justify-center shrink-0 space-x-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
                  >
                    -
                  </button>
                  <span className="text-sm opacity-80">{zoom.toFixed(2)}x</span>
                  <button
                    onClick={() => setZoom(zoom + 0.1)}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => setScrollMode(!scrollMode)}
                  className="px-2 py-1 w-36 bg-white/10 hover:bg-white/20 rounded text-sm"
                >
                  {scrollMode ? "Scroll Mode" : "Page Turn"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}
