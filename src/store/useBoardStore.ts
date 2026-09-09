import { create } from 'zustand';

export type Tool = 'select' | 'pan' | 'pen' | 'eraser' | 'text' | 'rect' | 'circle' | 'triangle';
export type BackgroundStyle = 'blank' | 'grid' | 'dots';

export interface Page {
  id: string;
  data: any; // Fabric canvas JSON
  thumbnail?: string;
  bgStyle: BackgroundStyle;
  history: any[];
  historyIndex: number;
}

interface BoardState {
  pages: Page[];
  currentPageIndex: number;
  currentTool: Tool;
  currentColor: string;
  strokeWidth: number;
  isGridSnapping: boolean;
  
  // Actions
  addPage: () => void;
  deletePage: (index: number) => void;
  switchPage: (index: number) => void;
  updatePageData: (index: number, data: any, thumbnail?: string, addToHistory?: boolean) => void;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setBgStyle: (style: BackgroundStyle) => void;
  toggleGridSnapping: () => void;
  clearCurrentPage: () => void;
  undo: () => void;
  redo: () => void;
  triggerClear: number;
}

export const useBoardStore = create<BoardState>((set) => ({
  pages: [{ id: crypto.randomUUID(), data: {}, bgStyle: 'dots', history: [{}], historyIndex: 0 }],
  currentPageIndex: 0,
  currentTool: 'pen',
  currentColor: '#38bdf8', // Neon blue default
  strokeWidth: 4,
  isGridSnapping: false,
  triggerClear: 0,

  addPage: () =>
    set((state) => ({
      pages: [...state.pages, { 
        id: crypto.randomUUID(), 
        data: {}, 
        bgStyle: state.pages[state.currentPageIndex]?.bgStyle || 'dots',
        history: [{}],
        historyIndex: 0
      }],
      currentPageIndex: state.pages.length,
    })),

  deletePage: (index) =>
    set((state) => {
      if (state.pages.length === 1) return state;
      const newPages = state.pages.filter((_, i) => i !== index);
      let newIndex = state.currentPageIndex;
      if (newIndex >= index && newIndex > 0) newIndex--;
      return { pages: newPages, currentPageIndex: newIndex };
    }),

  switchPage: (index) => set({ currentPageIndex: index }),

  updatePageData: (index, data, thumbnail, addToHistory = false) =>
    set((state) => {
      const newPages = [...state.pages];
      const page = newPages[index];
      
      let newHistory = page.history;
      let newIndex = page.historyIndex;

      if (addToHistory) {
        // Cut off redo future if we branch
        newHistory = page.history.slice(0, page.historyIndex + 1);
        newHistory.push(data);
        if (newHistory.length > 50) newHistory.shift(); // Max 50 undos
        else newIndex++;
      }

      newPages[index] = { 
        ...page, 
        data, 
        ...(thumbnail && { thumbnail }),
        history: newHistory,
        historyIndex: newIndex
      };
      
      return { pages: newPages };
    }),

  setTool: (tool) => set({ currentTool: tool }),
  setColor: (color) => set({ currentColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  
  setBgStyle: (style) => set((state) => {
    const newPages = [...state.pages];
    newPages[state.currentPageIndex].bgStyle = style;
    return { pages: newPages };
  }),

  toggleGridSnapping: () => set((state) => ({ isGridSnapping: !state.isGridSnapping })),
  
  clearCurrentPage: () => set((state) => ({ triggerClear: state.triggerClear + 1 })),

  undo: () => set((state) => {
    const page = state.pages[state.currentPageIndex];
    if (page.historyIndex > 0) {
      const newPages = [...state.pages];
      newPages[state.currentPageIndex] = {
        ...page,
        historyIndex: page.historyIndex - 1,
        data: page.history[page.historyIndex - 1]
      };
      return { pages: newPages };
    }
    return state;
  }),

  redo: () => set((state) => {
    const page = state.pages[state.currentPageIndex];
    if (page.historyIndex < page.history.length - 1) {
      const newPages = [...state.pages];
      newPages[state.currentPageIndex] = {
        ...page,
        historyIndex: page.historyIndex + 1,
        data: page.history[page.historyIndex + 1]
      };
      return { pages: newPages };
    }
    return state;
  })
}));
