'use client';
import { useBoardStore } from '../../store/useBoardStore';
import { Plus, Trash2, Presentation, Grid, GripHorizontal, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Sidebar() {
  const { pages, currentPageIndex, switchPage, addPage, deletePage, setBgStyle } = useBoardStore();
  const currentPage = pages[currentPageIndex];

  return (
    <div className="w-20 hover:w-64 transition-all duration-300 ease-in-out bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 flex flex-col h-full shadow-2xl rounded-2xl overflow-hidden group">
      
      <div className="p-4 border-b border-slate-700/50 flex items-center space-x-3 shrink-0">
        <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-xl shadow-inner shrink-0">
          <Presentation size={24} />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          <h1 className="font-bold text-lg text-slate-100 tracking-tight">NEXUS</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {pages.map((page, index) => (
          <div
            key={page.id}
            onClick={() => switchPage(index)}
            className={cn(
              "relative rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden bg-slate-800/50 shrink-0",
              currentPageIndex === index 
                ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] ring-2 ring-indigo-500/20" 
                : "border-slate-700/50 hover:border-slate-500"
            )}
          >
            <div className="aspect-[16/9] w-full relative">
              {page.thumbnail ? (
                <img src={page.thumbnail} alt={`Slide ${index + 1}`} className="w-full h-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500/50 font-medium text-xs">
                  Empty
                </div>
              )}
            </div>
            
            <div className="absolute top-1 left-1 bg-slate-900/90 backdrop-blur-md text-[10px] px-1.5 py-0.5 rounded-md text-slate-300 font-bold border border-slate-700">
              {index + 1}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deletePage(index);
              }}
              className={cn(
                "absolute top-1 right-1 p-1 rounded-md bg-rose-500/90 text-white backdrop-blur-sm transition-opacity",
                pages.length > 1 ? "opacity-0 group-hover:opacity-100 hover:bg-rose-500" : "hidden"
              )}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        <button
          onClick={addPage}
          className="w-full aspect-[16/9] rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/10 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 transition-colors shrink-0"
        >
          <Plus size={24} className="mb-1" />
          <span className="font-medium text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">New Slide</span>
        </button>
      </div>

      <div className="p-4 border-t border-slate-700/50 shrink-0">
        <div className="flex flex-col space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Background</p>
          <div className="flex flex-col group-hover:flex-row gap-2">
            {[
              { id: 'blank', icon: <Circle size={16} />, label: 'Blank' },
              { id: 'grid', icon: <Grid size={16} />, label: 'Grid' },
              { id: 'dots', icon: <GripHorizontal size={16} />, label: 'Dots' },
            ].map(bg => (
              <button
                key={bg.id}
                onClick={() => setBgStyle(bg.id as any)}
                className={cn(
                  "p-2 rounded-lg flex items-center justify-center transition-all",
                  currentPage?.bgStyle === bg.id 
                    ? "bg-slate-700 text-white shadow-sm ring-1 ring-slate-500" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                )}
                title={bg.label}
              >
                {bg.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
