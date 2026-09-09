'use client';
import dynamic from 'next/dynamic';
import Toolbar from '../components/board/Toolbar';
import Sidebar from '../components/board/Sidebar';

// Dynamically import the whiteboard to avoid SSR issues with canvas/fabric
const Whiteboard = dynamic(() => import('../components/board/Whiteboard'), { ssr: false });

export default function BoardApp() {
  return (
    <div className="relative h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* The infinite canvas takes up the entire screen */}
      <Whiteboard />
      
      {/* Floating UI Elements over the canvas */}
      <div className="absolute top-4 left-4 z-20 h-[calc(100vh-2rem)] pointer-events-none">
        <div className="pointer-events-auto h-full">
          <Sidebar />
        </div>
      </div>
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <Toolbar />
        </div>
      </div>
    </div>
  );
}
