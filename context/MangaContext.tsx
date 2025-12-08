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
  files?: FileWithPath[]; // store files for lazy-loading
}

interface MangaContextProps {
  chapters: MangaChapter[];
  setChapters: (chapters: MangaChapter[]) => void;
  selectedChapter: MangaChapter | null;
  setSelectedChapter: (chapter: MangaChapter | null) => void;
  selectedPage: MangaPage | null;
  setSelectedPage: (page: MangaPage | null) => void;
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
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [scrollMode, setScrollMode] = useState(true);

  const openReader = () => {};
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <MangaContext.Provider
      value={{
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
      }}
    >
      {children}
    </MangaContext.Provider>
  );
}
