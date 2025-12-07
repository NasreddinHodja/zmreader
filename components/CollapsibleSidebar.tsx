"use client";

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
    selectChapter,
    selectedPage,
    selectPage,
    openReader,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    zoom,
    setZoom,
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
    selectChapter(null);
    selectPage(null);
    openSidebar();
  }

  function toggleChapter(chapter: MangaChapter) {
    if (selectedChapter?.id === chapter.id) {
      selectChapter(null);
      return;
    }
    selectChapter(chapter);
  }

  function handlePageClick(page: MangaPage) {
    selectPage(page);
    closeSidebar();
    openReader();
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

      <aside
        className={`
    fixed top-0 left-0 h-full bg-black border-r-2 shadow-xl z-50
    flex flex-col transition-all duration-300 ease-in-out
    ${isSidebarOpen ? "w-72" : "w-14"}
  `}
      >
        <button
          onClick={isSidebarOpen ? closeSidebar : openSidebar}
          className="fixed top-2 left-1 z-50 p-2 text-white"
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
        {/* MAIN CONTENT */}
        {isSidebarOpen && (
          <div className="p-6 pt-16 space-y-4 text-white overflow-y-auto flex-1">
            <h2 className="text-xl font-bold ml-2">ZMREADER</h2>

            <FilePickerButton onSelect={handleDirectory}>
              Choose Manga Folder
            </FilePickerButton>

            {chapters.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm opacity-80 ml-2">Chapters</h3>

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

                        <AnimatePresence>
                          {isOpen && (
                            <motion.ul
                              className="ml-6 mt-1 space-y-1 overflow-hidden"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                            >
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
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="text-sm opacity-60 mt-2 ml-2">
                No chapters found.
              </div>
            )}
            {/* FOOTER ZOOM CONTROLS */}
            <div className="p-4 border-t border-white/20 text-white flex items-center justify-between">
              <button
                onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
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
          </div>
        )}
      </aside>
    </>
  );
}
