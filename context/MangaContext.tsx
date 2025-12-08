"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface MangaPage {
  id: string;
  url: string;
}

export interface FileWithPath extends File {
  webkitRelativePath: string;
}

export interface MangaChapter {
  id: string;
  title: string;
  pages: MangaPage[];
  files?: FileWithPath[];
}

interface MangaContextProps {
  chapters: MangaChapter[];
  setChapters: (chapters: MangaChapter[]) => void;
  selectedChapter: MangaChapter | null;
  setSelectedChapter: (chapter: MangaChapter | null) => void;
  selectedPage: MangaPage | null;
  selectPage: (page: MangaPage | null, scroll?: boolean) => void;
  shouldScroll: boolean;
  openReader: () => void;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  scrollMode: boolean;
  setScrollMode: (scrollMode: boolean) => void;
}

const MangaContext = createContext<MangaContextProps | undefined>(undefined);

export const useManga = () => {
  const ctx = useContext(MangaContext);
  if (!ctx) throw new Error("useManga must be used within MangaProvider");
  return ctx;
};

export function MangaProvider({ children }: { children: ReactNode }) {
  const [chapters, setChapters] = useState<MangaChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<MangaChapter | null>(
    null
  );
  const [selectedPage, setSelectedPage] = useState<MangaPage | null>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [zoom, setZoomState] = useState(1);
  const [scrollMode, setScrollMode] = useState(true);

  const openReader = () => {};
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const setZoom = (newZoom: number) => {
    setZoomState(Math.max(0.5, Math.min(1, newZoom)));
  };

  const selectPage = (page: MangaPage | null, scroll = false) => {
    setSelectedPage(page);
    setShouldScroll(scroll);
  };

  return (
    <MangaContext.Provider
      value={{
        chapters,
        setChapters,
        selectedChapter,
        setSelectedChapter,
        selectedPage,
        selectPage,
        shouldScroll,
        openReader,
        isSidebarOpen,
        openSidebar,
        closeSidebar,
        zoom,
        setZoom,
        scrollMode,
        setScrollMode,
      }}
    >
      {children}
    </MangaContext.Provider>
  );
}
