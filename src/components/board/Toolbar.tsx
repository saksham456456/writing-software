'use client';
import { useBoardStore, Tool } from '../../store/useBoardStore';
import { 
  MousePointer2, Hand, Pen, Eraser, Type, Square, Circle, Triangle, 
  Trash2, Download, Undo2, Redo2, Magnet
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export default function Toolbar() {
  const { 
    currentTool, setTool, 
    currentColor, setColor, 
    strokeWidth, setStrokeWidth, 
    clearCurrentPage, pages,
    undo, redo,
    isGridSnapping, toggleGridSnapping
  } = useBoardStore();

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer2 size={18} />, label: 'Select (V)' },
    { id: 'pan', icon: <Hand size={18} />, label: 'Pan Canvas (Space)' },
    { id: 'pen', icon: <Pen size={18} />, label: 'Draw (P)' },
    { id: 'eraser', icon: <Eraser size={18} />, label: 'Erase (E)' },
    { id: 'text', icon: <Type size={18} />, label: 'Text (T)' },
    { id: 'rect', icon: <Square size={18} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={18} />, label: 'Circle' },
    { id: 'triangle', icon: <Triangle size={18} />, label: 'Triangle' },
  ];

  // Neon-inspired futuristic color palette
  const colors = [
    '#ffffff', // White
    '#94a3b8', // Slate
    '#f43f5e', // Neon Rose
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#0ea5e9', // Sky Blue
    '#6366f1', // Indigo
    '#d946ef', // Fuchsia
  ];
  const widths = [2, 4, 8, 12, 20];

  const handleExport = async () => {
    const zip = new JSZip();
    pages.forEach((page, index) => {
      zip.file(`slide-${index + 1}.json`, JSON.stringify({
        ...page.data,
        bgStyle: page.bgStyle
      }, null, 2));
    });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'nexus-lesson.zip');
  };

  return (
    <div className="flex items-center space-x-6 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 px-6 py-3 rounded-2xl shadow-2xl">
      
      {/* Undo / Redo */}
      <div className="flex items-center space-x-1">
        <button onClick={undo} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Undo2 size={18} />
        </button>
        <button onClick={redo} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Redo2 size={18} />
        </button>
      </div>

      <div className="w-px h-8 bg-slate-700" />

      {/* Tools */}
      <div className="flex items-center space-x-1">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            title={t.label}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200",
              currentTool === t.id 
                ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" 
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            )}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-slate-700" />

      {/* Widths */}
      <div className="flex items-center space-x-1">
        {widths.map(w => (
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
              strokeWidth === w ? "bg-slate-700 shadow-inner" : "hover:bg-slate-800"
            )}
          >
            <div className="bg-slate-300 rounded-full" style={{ width: w, height: w }} />
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-slate-700" />

      {/* Colors */}
      <div className="flex items-center space-x-2">
        {colors.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={cn(
              "w-6 h-6 rounded-full transition-all duration-300",
              currentColor === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-[0_0_10px_currentColor]" : "hover:scale-110"
            )}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="w-px h-8 bg-slate-700" />

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleGridSnapping}
          title="Snap to Grid"
          className={cn(
            "p-2 rounded-lg transition-all",
            isGridSnapping ? "text-indigo-400 bg-indigo-500/10 ring-1 ring-indigo-500/50" : "text-slate-400 hover:text-white hover:bg-slate-800"
          )}
        >
          <Magnet size={18} />
        </button>

        <button
          onClick={clearCurrentPage}
          title="Clear Slide"
          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
        
        <button
          onClick={handleExport}
          title="Save Lesson"
          className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
        >
          <Download size={18} />
        </button>
      </div>

    </div>
  );
}
