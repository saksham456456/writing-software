'use client';
import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useBoardStore } from '../../store/useBoardStore';

const GRID_SIZE = 40;

export default function Whiteboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isUpdatingRef = useRef(false);

  // For panning
  const isDraggingRef = useRef(false);
  const lastPosXRef = useRef(0);
  const lastPosYRef = useRef(0);

  const { 
    pages, currentPageIndex, currentTool, setTool,
    currentColor, strokeWidth, isGridSnapping,
    updatePageData, triggerClear, undo, redo
  } = useBoardStore();

  const currentPage = pages[currentPageIndex];

  // 1. INITIALIZE CANVAS
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Use a high-quality interactive canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      selection: true,
      preserveObjectStacking: true, // Keep objects in order when selecting
      fireRightClick: true,
      stopContextMenu: true,
    });
    fabricRef.current = canvas;

    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        setTool('pan');
        e.preventDefault();
      }
      
      if (e.ctrlKey || e.metaKey) {
        if (e.code === 'KeyZ') {
          if (e.shiftKey) redo();
          else undo();
          e.preventDefault();
        }
        if (e.code === 'KeyY') {
          redo();
          e.preventDefault();
        }
      } else {
        if (e.code === 'KeyV') setTool('select');
        if (e.code === 'KeyP') setTool('pen');
        if (e.code === 'KeyE') setTool('eraser');
        if (e.code === 'KeyT') setTool('text');
        
        if (e.code === 'Delete' || e.code === 'Backspace') {
          const activeObjects = canvas.getActiveObjects();
          if (activeObjects.length) {
            activeObjects.forEach(obj => canvas.remove(obj));
            canvas.discardActiveObject();
            saveState();
            e.preventDefault();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Auto-save on changes
    const saveState = () => {
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;
      const json = canvas.toJSON();
      
      // Reset viewport before thumbnailing to get a clean view
      const vpt = canvas.viewportTransform;
      canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
      const thumbnail = canvas.toDataURL({ format: 'png', multiplier: 0.1 });
      canvas.viewportTransform = vpt; // Restore

      updatePageData(currentPageIndex, json, thumbnail, true);
      isUpdatingRef.current = false;
    };

    canvas.on('path:created', saveState);
    canvas.on('object:modified', saveState);
    canvas.on('object:added', (e) => {
      if (!isUpdatingRef.current) saveState();
    });
    canvas.on('object:removed', saveState);

    // Object Snapping
    canvas.on('object:moving', (options) => {
      if (useBoardStore.getState().isGridSnapping && options.target) {
        options.target.set({
          left: Math.round(options.target.left! / GRID_SIZE) * GRID_SIZE,
          top: Math.round(options.target.top! / GRID_SIZE) * GRID_SIZE
        });
      }
    });

    // INFINITE CANVAS / PAN & ZOOM LOGIC
    canvas.on('mouse:wheel', function(opt) {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.1) zoom = 0.1;
      canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    canvas.on('mouse:down', function(opt) {
      const evt = opt.e as any;
      const currentTool = useBoardStore.getState().currentTool;
      
      if (evt.altKey === true || currentTool === 'pan' || evt.button === 1 /* middle click */) {
        isDraggingRef.current = true;
        canvas.selection = false;
        lastPosXRef.current = evt.clientX || evt.touches?.[0]?.clientX || 0;
        lastPosYRef.current = evt.clientY || evt.touches?.[0]?.clientY || 0;
      }
    });

    canvas.on('mouse:move', function(opt) {
      if (isDraggingRef.current) {
        const e = opt.e as any;
        const vpt = canvas.viewportTransform!;
        const clientX = e.clientX || e.touches?.[0]?.clientX || lastPosXRef.current;
        const clientY = e.clientY || e.touches?.[0]?.clientY || lastPosYRef.current;
        vpt[4] += clientX - lastPosXRef.current;
        vpt[5] += clientY - lastPosYRef.current;
        canvas.requestRenderAll();
        lastPosXRef.current = clientX;
        lastPosYRef.current = clientY;
      }
    });

    canvas.on('mouse:up', function(opt) {
      const currentTool = useBoardStore.getState().currentTool;
      canvas.setViewportTransform(canvas.viewportTransform!);
      isDraggingRef.current = false;
      if (currentTool === 'select') canvas.selection = true;
    });

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        canvas.setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
        canvas.renderAll();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  // 2. BACKGROUND RENDERING
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // We use CSS background for the container to make it infinite and fast, 
    // rather than drawing it onto the fabric canvas which scales weirdly with zoom.
    if (containerRef.current) {
      containerRef.current.className = `absolute inset-0 w-full h-full bg-slate-950`;
      
      if (currentPage?.bgStyle === 'grid') {
        containerRef.current.style.backgroundImage = `
          linear-gradient(to right, #1e293b 1px, transparent 1px),
          linear-gradient(to bottom, #1e293b 1px, transparent 1px)
        `;
        containerRef.current.style.backgroundSize = `${GRID_SIZE}px ${GRID_SIZE}px`;
      } else if (currentPage?.bgStyle === 'dots') {
        containerRef.current.style.backgroundImage = `radial-gradient(#334155 1.5px, transparent 1.5px)`;
        containerRef.current.style.backgroundSize = `${GRID_SIZE}px ${GRID_SIZE}px`;
      } else {
        containerRef.current.style.backgroundImage = 'none';
      }
    }
  }, [currentPage?.bgStyle]);

  // 3. LOAD PAGE STATE (Including Undo/Redo tracking)
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !currentPage) return;

    isUpdatingRef.current = true;
    const pageData = currentPage.data;

    // Extract viewport transform if saved, or default
    const savedVpt = pageData?.viewportTransform;

    if (pageData && Object.keys(pageData).length > 0) {
      canvas.loadFromJSON(pageData).then(() => {
        if (savedVpt) canvas.setViewportTransform(savedVpt);
        canvas.renderAll();
        isUpdatingRef.current = false;
      });
    } else {
      canvas.clear();
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvas.renderAll();
      isUpdatingRef.current = false;
    }
  }, [currentPageIndex, currentPage?.historyIndex]);

  // 4. HANDLE CLEAR
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || triggerClear === 0) return;
    
    isUpdatingRef.current = true;
    canvas.clear();
    canvas.renderAll();
    
    const json = canvas.toJSON();
    updatePageData(currentPageIndex, json, undefined, true);
    isUpdatingRef.current = false;
  }, [triggerClear]);

  // 5. HANDLE TOOLS & STYLES
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Reset interaction modes
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'default';
    canvas.forEachObject(obj => {
      obj.selectable = false;
      obj.evented = false;
    });
    
    // Configure based on tool
    if (currentTool === 'select') {
      canvas.selection = true;
      canvas.forEachObject(obj => {
        obj.selectable = true;
        obj.evented = true;
      });
    } 
    else if (currentTool === 'pan') {
      canvas.defaultCursor = 'grab';
    }
    else if (currentTool === 'pen') {
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = currentColor;
        canvas.freeDrawingBrush.width = strokeWidth;
      }
    } 
    else if (currentTool === 'eraser') {
      // Basic eraser bounding box implementation
      const eraseHandler = (opt: any) => {
        if (!opt.e.buttons && !(opt.e as any).touches) return;
        const point = canvas.getScenePoint(opt.e);
        const activeObjects = canvas.getActiveObjects();
        canvas.forEachObject(obj => {
          if (obj.containsPoint(point)) {
            canvas.remove(obj);
          }
        });
      };
      canvas.on('mouse:move', eraseHandler);
      return () => { canvas.off('mouse:move', eraseHandler); };
    }
    else {
      // Shape / Text insertion mode
      const handleInsert = (o: any) => {
        if (isDraggingRef.current) return;
        
        const pointer = canvas.getScenePoint(o.e);
        let shape: fabric.FabricObject | null = null;

        if (currentTool === 'text') {
          shape = new fabric.IText('Type here', {
            left: pointer.x,
            top: pointer.y,
            fill: currentColor,
            fontFamily: 'Inter, sans-serif',
            fontSize: Math.max(strokeWidth * 6 + 16, 24),
          });
        } 
        else if (currentTool === 'rect') {
          shape = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            fill: currentColor,
            width: 100,
            height: 100,
            rx: 8, ry: 8
          });
        }
        else if (currentTool === 'circle') {
          shape = new fabric.Circle({
            left: pointer.x,
            top: pointer.y,
            fill: currentColor,
            radius: 50,
          });
        }
        else if (currentTool === 'triangle') {
          shape = new fabric.Triangle({
            left: pointer.x,
            top: pointer.y,
            fill: currentColor,
            width: 100,
            height: 100,
          });
        }

        if (shape) {
          canvas.add(shape);
          canvas.setActiveObject(shape);
          // Auto-switch to select mode after dropping
          useBoardStore.getState().setTool('select');
        }
      };
      
      canvas.on('mouse:down', handleInsert);
      return () => { canvas.off('mouse:down', handleInsert); };
    }
    
    // Save state helper inside the effect
    const saveState = () => {
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;
      updatePageData(currentPageIndex, canvas.toJSON(), canvas.toDataURL({ format: 'png', multiplier: 0.1 }), true);
      isUpdatingRef.current = false;
    };

  }, [currentTool, currentColor, strokeWidth]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-slate-950">
      <canvas ref={canvasRef} />
    </div>
  );
}
