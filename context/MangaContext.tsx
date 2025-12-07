"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface MangaPage {
  id: string;
  url: string;
}

export interface MangaChapter {
  id: string;
  title: string;
  pages: MangaPage[];
}

export type ViewMode = "idle" | "reader";

interface MangaContextType {
  chapters: MangaChapter[];
  setChapters: (value: MangaChapter[]) => void;

  selectedChapter: MangaChapter | null;
  setSelectedChapter: (value: MangaChapter | null) => void;

  selectedPage: MangaPage | null;
  setSelectedPage: (value: MangaPage | null) => void;

  zoom: number;
  setZoom: (value: number) => void;

  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;

  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;

  openReader: () => void;

  scrollMode: boolean;
  setScrollMode: (value: boolean) => void;
}

const MangaContext = createContext<MangaContextType | undefined>(undefined);

export function MangaProvider({ children }: { children: ReactNode }) {
  const [chapters, setChapters] = useState<MangaChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<MangaChapter | null>(
    null
  );
  const [selectedPage, setSelectedPage] = useState<MangaPage | null>(null);

  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("idle");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const [scrollMode, setScrollMode] = useState(true);

  const openReader = () => setViewMode("reader");

  return (
    <MangaContext.Provider
      value={{
        chapters,
        setChapters,
        selectedChapter,
        setSelectedChapter,
        selectedPage,
        setSelectedPage,
        zoom,
        setZoom,
        viewMode,
        setViewMode,
        isSidebarOpen,
        openSidebar,
        closeSidebar,
        openReader,
        scrollMode,
        setScrollMode,
      }}
    >
      {children}
    </MangaContext.Provider>
  );
}

export function useManga() {
  const ctx = useContext(MangaContext);
  if (!ctx) throw new Error("useManga must be used inside <MangaProvider>");
  return ctx;
}
