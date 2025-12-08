"use client";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
} from "motion/react";
import { Menu, X } from "lucide-react";
import { FilePickerButton } from "./FilePickerButton";
import {
  useManga,
  MangaChapter,
  MangaPage,
  FileWithPath,
} from "@/context/MangaContext";
import { useEffect, useState } from "react";

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

  const [isMobile, setIsMobile] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 288], [0.5, 0]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    let startX = 0;
    let startY = 0;
    let hasOpened = false;
    const edgeThreshold = 50; // Increased for easier triggering

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      hasOpened = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isSidebarOpen || hasOpened) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startX;
      const deltaY = Math.abs(currentY - startY);

      // Check if swipe started from left edge and moved right
      if (startX < edgeThreshold && deltaX > 30 && deltaY < 50) {
        hasOpened = true;
        openSidebar();
      }
    };

    const handleTouchEnd = () => {
      hasOpened = false;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, isSidebarOpen, openSidebar]);

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
    if (isMobile) closeSidebar();
  }

  function handleDragEnd(
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) {
    const shouldClose = info.offset.x < -100 || info.velocity.x < -500;
    if (shouldClose) {
      closeSidebar();
    }
  }

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="overlay"
            className="fixed inset-0 bg-black/80 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: isMobile ? opacity.get() : 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
            style={isMobile ? { opacity } : undefined}
          />
        )}
      </AnimatePresence>

      <motion.aside
        drag={isMobile && isSidebarOpen ? "x" : false}
        dragConstraints={{ left: -288, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={isMobile ? { x } : undefined}
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : isMobile ? -288 : -240,
        }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-72 bg-black border-r-2 shadow-xl z-50 flex flex-col"
      >
        {/* Desktop toggle button */}
        {!isMobile && (
          <button
            onClick={isSidebarOpen ? closeSidebar : openSidebar}
            className="absolute top-2 right-2 z-10 p-2 text-white hover:bg-white/10"
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        )}

        {/* Mobile close button */}
        {isMobile && isSidebarOpen && (
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/10"
          >
            <X size={24} />
          </button>
        )}

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
                            className={`px-3 py-2 cursor-pointer flex justify-between items-center
                              ${isOpen ? "border-2" : "hover:bg-white/10"}`}
                          >
                            <span className="truncate">{ch.title}</span>
                            <span>{isOpen ? "▾" : "▸"}</span>
                          </div>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-6 mt-1 space-y-1 overflow-hidden"
                              >
                                {selectedChapter?.pages.map((p) => {
                                  const name = p.id.split("/").pop() ?? p.id;
                                  const isSelected = selectedPage?.id === p.id;
                                  return (
                                    <li
                                      key={p.id}
                                      onClick={() => handlePageClick(p)}
                                      className={`text-sm px-2 py-2 truncate cursor-pointer
                                        ${
                                          isSelected
                                            ? "underline"
                                            : "hover:bg-white/10"
                                        }`}
                                    >
                                      Page {Number(name.substring(0, 3))}
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
                ) : (
                  <div className="flex-1 flex items-center text-sm opacity-60 ml-2">
                    No chapters found.
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/20 text-white shrink-0">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      className="px-3 py-2 hover:bg-white/20"
                    >
                      -
                    </button>
                    <span className="text-sm opacity-80 w-16 text-center">
                      {zoom.toFixed(2)}x
                    </span>
                    <button
                      onClick={() => setZoom(zoom + 0.1)}
                      className="px-3 py-2 hover:bg-white/20"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => setScrollMode(!scrollMode)}
                    className="px-3 py-2 hover:bg-white/20 text-sm border-2 w-full"
                  >
                    {scrollMode ? "Scroll Mode" : "Page Turn"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}
