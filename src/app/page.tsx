'use client';
import dynamic from 'next/dynamic';

// Tldraw must be dynamically imported to avoid SSR issues with canvas
const Smartboard = dynamic(() => import('../components/board/Smartboard'), { ssr: false });

export default function BoardApp() {
  return (
    <main className="w-screen h-screen overflow-hidden overscroll-none touch-none bg-slate-900">
      <Smartboard />
    </main>
  );
}
