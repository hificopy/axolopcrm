/**
 * Infinite Canvas Component
 * Native HTML5 Canvas implementation (no external dependencies)
 * Supports: Pan, Zoom, Objects, Selection, Drag, Resize
 */

import { useRef, useEffect, useState, useCallback } from 'react';

const InfiniteCanvas = ({
  objects = [],
  onObjectsChange,
  onCreateObject,
  selectedTool = 'select',
  onObjectSelect,
  backgroundColor = '#1a1a1a',
  gridSize = 20,
  showGrid = true,
}) => {
  const canvasRef = useRef(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [draggedObject, setDraggedObject] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [newObject, setNewObject] = useState(null);

  // Transform screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX, screenY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (screenX - rect.left - viewport.x) / viewport.zoom,
      y: (screenY - rect.top - viewport.y) / viewport.zoom,
    };
  }, [viewport]);

  // Draw grid
  const drawGrid = useCallback((ctx, width, height) => {
    if (!showGrid) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(123, 28, 20, 0.1)';
    ctx.lineWidth = 1;

    const startX = Math.floor(-viewport.x / viewport.zoom / gridSize) * gridSize;
    const startY = Math.floor(-viewport.y / viewport.zoom / gridSize) * gridSize;
    const endX = startX + (width / viewport.zoom) + gridSize;
    const endY = startY + (height / viewport.zoom) + gridSize;

    // Vertical lines
    for (let x = startX; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    ctx.restore();
  }, [viewport, gridSize, showGrid]);

  // Draw object
  const drawObject = useCallback((ctx, obj, isSelected) => {
    ctx.save();

    // Draw based on type
    switch (obj.type) {
      case 'rectangle':
      case 'shape':
        ctx.fillStyle = obj.style?.fill || '#7b1c14';
        ctx.strokeStyle = obj.style?.stroke || '#ffffff';
        ctx.lineWidth = obj.style?.strokeWidth || 2;

        if (obj.style?.rx) {
          // Rounded rectangle
          const radius = obj.style.rx;
          ctx.beginPath();
          ctx.moveTo(obj.position_x + radius, obj.position_y);
          ctx.lineTo(obj.position_x + obj.width - radius, obj.position_y);
          ctx.arcTo(obj.position_x + obj.width, obj.position_y, obj.position_x + obj.width, obj.position_y + radius, radius);
          ctx.lineTo(obj.position_x + obj.width, obj.position_y + obj.height - radius);
          ctx.arcTo(obj.position_x + obj.width, obj.position_y + obj.height, obj.position_x + obj.width - radius, obj.position_y + obj.height, radius);
          ctx.lineTo(obj.position_x + radius, obj.position_y + obj.height);
          ctx.arcTo(obj.position_x, obj.position_y + obj.height, obj.position_x, obj.position_y + obj.height - radius, radius);
          ctx.lineTo(obj.position_x, obj.position_y + radius);
          ctx.arcTo(obj.position_x, obj.position_y, obj.position_x + radius, obj.position_y, radius);
          ctx.closePath();
        } else {
          ctx.fillRect(obj.position_x, obj.position_y, obj.width, obj.height);
        }
        ctx.fill();
        ctx.stroke();
        break;

      case 'circle':
        ctx.fillStyle = obj.style?.fill || '#4C7FFF';
        ctx.strokeStyle = obj.style?.stroke || '#ffffff';
        ctx.lineWidth = obj.style?.strokeWidth || 2;
        ctx.beginPath();
        ctx.arc(
          obj.position_x + obj.width / 2,
          obj.position_y + obj.height / 2,
          Math.min(obj.width, obj.height) / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();
        break;

      case 'sticky_note':
        // Sticky note background
        ctx.fillStyle = obj.data?.color || '#FFD700';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.fillRect(obj.position_x, obj.position_y, obj.width, obj.height);
        ctx.strokeRect(obj.position_x, obj.position_y, obj.width, obj.height);

        // Shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillRect(obj.position_x, obj.position_y, obj.width, obj.height);
        ctx.shadowColor = 'transparent';

        // Text
        if (obj.data?.text) {
          ctx.fillStyle = '#000000';
          ctx.font = '14px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          const padding = 10;
          const lines = obj.data.text.split('\n');
          lines.forEach((line, i) => {
            ctx.fillText(
              line,
              obj.position_x + padding,
              obj.position_y + padding + (i * 18),
              obj.width - padding * 2
            );
          });
        }
        break;

      case 'text':
        ctx.fillStyle = obj.style?.color || '#ffffff';
        ctx.font = `${obj.style?.fontSize || 16}px ${obj.style?.fontFamily || 'Inter, sans-serif'}`;
        ctx.textAlign = obj.style?.textAlign || 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(obj.data?.text || '', obj.position_x, obj.position_y);
        break;
    }

    // Draw selection handles
    if (isSelected) {
      ctx.strokeStyle = '#7b1c14';
      ctx.lineWidth = 2;
      ctx.strokeRect(obj.position_x - 2, obj.position_y - 2, obj.width + 4, obj.height + 4);

      // Resize handles
      const handleSize = 8;
      ctx.fillStyle = '#7b1c14';
      const handles = [
        { x: obj.position_x, y: obj.position_y }, // top-left
        { x: obj.position_x + obj.width, y: obj.position_y }, // top-right
        { x: obj.position_x, y: obj.position_y + obj.height }, // bottom-left
        { x: obj.position_x + obj.width, y: obj.position_y + obj.height }, // bottom-right
      ];

      handles.forEach(handle => {
        ctx.fillRect(
          handle.x - handleSize / 2,
          handle.y - handleSize / 2,
          handleSize,
          handleSize
        );
      });
    }

    ctx.restore();
  }, []);

  // Main render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Apply viewport transform
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.zoom, viewport.zoom);

    // Draw grid
    drawGrid(ctx, width, height);

    // Draw objects (sorted by z_index)
    const sortedObjects = [...objects].sort((a, b) => (a.z_index || 0) - (b.z_index || 0));
    sortedObjects.forEach(obj => {
      drawObject(ctx, obj, obj.id === selectedObjectId);
    });

    // Draw new object being created
    if (newObject) {
      drawObject(ctx, newObject, false);
    }

    ctx.restore();
  }, [objects, viewport, backgroundColor, selectedObjectId, newObject, drawGrid, drawObject]);

  // Render on every change
  useEffect(() => {
    render();
  }, [render]);

  // Resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      render();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [render]);

  // Find object at position
  const findObjectAt = useCallback((canvasX, canvasY) => {
    // Check in reverse order (top to bottom)
    const sortedObjects = [...objects].sort((a, b) => (b.z_index || 0) - (a.z_index || 0));

    for (const obj of sortedObjects) {
      if (
        canvasX >= obj.position_x &&
        canvasX <= obj.position_x + obj.width &&
        canvasY >= obj.position_y &&
        canvasY <= obj.position_y + obj.height
      ) {
        return obj;
      }
    }
    return null;
  }, [objects]);

  // Find resize handle at position
  const findResizeHandleAt = useCallback((canvasX, canvasY, obj) => {
    if (!obj) return null;

    const handleSize = 8 / viewport.zoom;
    const handles = [
      { name: 'tl', x: obj.position_x, y: obj.position_y },
      { name: 'tr', x: obj.position_x + obj.width, y: obj.position_y },
      { name: 'bl', x: obj.position_x, y: obj.position_y + obj.height },
      { name: 'br', x: obj.position_x + obj.width, y: obj.position_y + obj.height },
    ];

    for (const handle of handles) {
      if (
        Math.abs(canvasX - handle.x) < handleSize &&
        Math.abs(canvasY - handle.y) < handleSize
      ) {
        return handle.name;
      }
    }
    return null;
  }, [viewport]);

  // Snap to grid
  const snapToGrid = useCallback((value) => {
    if (!showGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [gridSize, showGrid]);

  // Mouse down
  const handleMouseDown = useCallback((e) => {
    const canvasPos = screenToCanvas(e.clientX, e.clientY);

    if (selectedTool === 'select') {
      const clickedObj = findObjectAt(canvasPos.x, canvasPos.y);

      if (clickedObj) {
        const selectedObj = objects.find(o => o.id === selectedObjectId);
        const handle = findResizeHandleAt(canvasPos.x, canvasPos.y, selectedObj);

        if (handle && clickedObj.id === selectedObjectId) {
          setResizeHandle(handle);
          setDragStart(canvasPos);
        } else {
          setSelectedObjectId(clickedObj.id);
          setDraggedObject(clickedObj);
          setDragStart({ x: canvasPos.x - clickedObj.position_x, y: canvasPos.y - clickedObj.position_y });
          if (onObjectSelect) onObjectSelect(clickedObj);
        }
      } else {
        setSelectedObjectId(null);
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        if (onObjectSelect) onObjectSelect(null);
      }
    } else if (['rectangle', 'circle', 'sticky_note'].includes(selectedTool)) {
      // Start drawing new object
      setIsDrawing(true);
      setDragStart(canvasPos);
      setNewObject({
        id: 'temp-' + Date.now(),
        type: selectedTool,
        position_x: snapToGrid(canvasPos.x),
        position_y: snapToGrid(canvasPos.y),
        width: 0,
        height: 0,
        z_index: objects.length,
        data: selectedTool === 'sticky_note' ? { text: '', color: '#FFD700' } : {},
        style: selectedTool === 'rectangle' ? { fill: '#7b1c14', rx: 10 } : selectedTool === 'circle' ? { fill: '#4C7FFF' } : {},
      });
    }
  }, [selectedTool, objects, selectedObjectId, screenToCanvas, findObjectAt, findResizeHandleAt, snapToGrid, onObjectSelect]);

  // Mouse move
  const handleMouseMove = useCallback((e) => {
    const canvasPos = screenToCanvas(e.clientX, e.clientY);

    if (isDragging && dragStart) {
      // Pan canvas
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (draggedObject && dragStart && !resizeHandle) {
      // Move object
      const newX = snapToGrid(canvasPos.x - dragStart.x);
      const newY = snapToGrid(canvasPos.y - dragStart.y);

      const updatedObjects = objects.map(obj =>
        obj.id === draggedObject.id
          ? { ...obj, position_x: newX, position_y: newY }
          : obj
      );
      onObjectsChange(updatedObjects);
    } else if (resizeHandle && draggedObject && dragStart) {
      // Resize object
      const selectedObj = objects.find(o => o.id === selectedObjectId);
      if (!selectedObj) return;

      let newX = selectedObj.position_x;
      let newY = selectedObj.position_y;
      let newWidth = selectedObj.width;
      let newHeight = selectedObj.height;

      if (resizeHandle.includes('t')) {
        newHeight = selectedObj.height + (selectedObj.position_y - canvasPos.y);
        newY = canvasPos.y;
      }
      if (resizeHandle.includes('b')) {
        newHeight = canvasPos.y - selectedObj.position_y;
      }
      if (resizeHandle.includes('l')) {
        newWidth = selectedObj.width + (selectedObj.position_x - canvasPos.x);
        newX = canvasPos.x;
      }
      if (resizeHandle.includes('r')) {
        newWidth = canvasPos.x - selectedObj.position_x;
      }

      // Minimum size
      newWidth = Math.max(20, newWidth);
      newHeight = Math.max(20, newHeight);

      const updatedObjects = objects.map(obj =>
        obj.id === selectedObjectId
          ? { ...obj, position_x: newX, position_y: newY, width: newWidth, height: newHeight }
          : obj
      );
      onObjectsChange(updatedObjects);
    } else if (isDrawing && newObject && dragStart) {
      // Draw new object
      const width = Math.abs(canvasPos.x - dragStart.x);
      const height = Math.abs(canvasPos.y - dragStart.y);
      const x = Math.min(canvasPos.x, dragStart.x);
      const y = Math.min(canvasPos.y, dragStart.y);

      setNewObject(prev => ({
        ...prev,
        position_x: snapToGrid(x),
        position_y: snapToGrid(y),
        width: snapToGrid(width),
        height: snapToGrid(height),
      }));
    }

    // Update cursor
    const canvas = canvasRef.current;
    if (selectedTool === 'select') {
      const obj = findObjectAt(canvasPos.x, canvasPos.y);
      const selectedObj = objects.find(o => o.id === selectedObjectId);
      const handle = selectedObj ? findResizeHandleAt(canvasPos.x, canvasPos.y, selectedObj) : null;

      if (handle) {
        const cursors = { tl: 'nw-resize', tr: 'ne-resize', bl: 'sw-resize', br: 'se-resize' };
        canvas.style.cursor = cursors[handle];
      } else if (obj) {
        canvas.style.cursor = 'move';
      } else {
        canvas.style.cursor = 'default';
      }
    } else {
      canvas.style.cursor = 'crosshair';
    }
  }, [isDragging, draggedObject, resizeHandle, isDrawing, newObject, dragStart, objects, selectedObjectId, selectedTool, viewport, screenToCanvas, findObjectAt, findResizeHandleAt, snapToGrid, onObjectsChange]);

  // Mouse up
  const handleMouseUp = useCallback(() => {
    if (isDrawing && newObject && newObject.width > 10 && newObject.height > 10) {
      // Finalize new object - call onCreateObject if provided, otherwise add directly
      const finalObject = { ...newObject, id: undefined }; // Remove temp ID
      if (onCreateObject) {
        onCreateObject(finalObject);
      } else {
        onObjectsChange([...objects, { ...finalObject, id: Date.now().toString() }]);
      }
    }

    setIsDragging(false);
    setIsDrawing(false);
    setDraggedObject(null);
    setResizeHandle(null);
    setDragStart(null);
    setNewObject(null);
  }, [isDrawing, newObject, objects, onObjectsChange, onCreateObject]);

  // Mouse wheel (zoom)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(viewport.zoom * delta, 0.1), 5);

    // Zoom towards mouse position
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    const newViewportX = e.clientX - (canvasPos.x * newZoom);
    const newViewportY = e.clientY - (canvasPos.y * newZoom);

    setViewport({ x: newViewportX, y: newViewportY, zoom: newZoom });
  }, [viewport, screenToCanvas]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected object
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectId) {
          e.preventDefault();
          onObjectsChange(objects.filter(obj => obj.id !== selectedObjectId));
          setSelectedObjectId(null);
          if (onObjectSelect) onObjectSelect(null);
        }
      }
      // Duplicate selected object
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        if (selectedObjectId) {
          e.preventDefault();
          const objToDuplicate = objects.find(o => o.id === selectedObjectId);
          if (objToDuplicate) {
            const newObj = {
              ...objToDuplicate,
              id: Date.now().toString(),
              position_x: objToDuplicate.position_x + 20,
              position_y: objToDuplicate.position_y + 20,
            };
            onObjectsChange([...objects, newObj]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, objects, onObjectsChange, onObjectSelect]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="absolute inset-0"
      style={{ touchAction: 'none' }}
    />
  );
};

export default InfiniteCanvas;
