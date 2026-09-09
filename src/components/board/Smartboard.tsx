'use client';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

export default function Smartboard() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 
        Tldraw handles everything internally:
        - Perfect stylus/palm rejection
        - Hardware accelerated pan & zoom
        - Sticky notes, arrows, flawless shapes
        - Built-in multi-page support
        - Auto-saving to IndexedDB via persistenceKey
      */}
      <Tldraw persistenceKey="nexus-smartboard-state" />
    </div>
  );
}
