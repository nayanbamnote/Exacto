import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useElementStore } from '@/store/useElementStore';
import Element from '@/components/elements/Element';
import PositioningControls from './PositioningControls';

interface CanvasProps {
  width: number;
  height: number;
  gridSize: number;
  showGrid: boolean;
  showRulers: boolean;
}

// Element item type for DnD
const ITEM_TYPE = 'ELEMENT';

const Canvas: React.FC<CanvasProps> = ({
  width = 1200,
  height = 800,
  gridSize = 20,
  showGrid = false,
  showRulers = false,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { elements, addElement, updateElement, setSelectedElementId, selectedElementId } = useElementStore();
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    width: number;
    height: number;
    active: boolean;
  } | null>(null);
  
  // Filter to only root elements (elements without parent)
  const rootElements = elements.filter(el => !el.parentId);
  
  // Update CSS variables when grid size changes
  useEffect(() => {
    document.documentElement.style.setProperty('--grid-size', `${gridSize}px`);
  }, [gridSize]);

  // Setup drop functionality with @dnd-kit/core
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
    data: {
      accepts: ITEM_TYPE,
      gridSize,
      width,
      height
    }
  });

  // Mouse event handlers for element selection and moving
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;
    
    // If clicking on the canvas background (not an element)
    if (e.currentTarget === e.target) {
      // Clear selected element
      setSelectedElementId(null);
      
      // Start selection box
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;
        
        setSelectionBox({
          startX,
          startY,
          width: 0,
          height: 0,
          active: true
        });
        
        // Setup mouse move and mouse up event listeners
        const handleMouseMove = (moveEvent: MouseEvent) => {
          if (selectionBox && selectionBox.active && rect) {
            const currentX = moveEvent.clientX - rect.left;
            const currentY = moveEvent.clientY - rect.top;
            
            setSelectionBox({
              ...selectionBox,
              width: currentX - selectionBox.startX,
              height: currentY - selectionBox.startY,
            });
          }
        };
        
        const handleMouseUp = () => {
          setSelectionBox(prev => prev ? { ...prev, active: false } : null);
          
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    }
  };

  return (
    <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
      {/* Main canvas area */}
      <div
        ref={(node) => {
          canvasRef.current = node;
          setNodeRef(node);
        }}
        className={`absolute bg-white ${showGrid ? 'bg-grid-pattern-enhanced' : ''} ${isOver ? 'bg-blue-50' : ''}`}
        style={{
          left: 0,
          top: 0,
          width: `${width}px`,
          height: `${height}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Render only root elements - child elements are rendered by their parents */}
        {rootElements.map((element) => (
          <Element 
            key={element.id} 
            element={element} 
            gridSize={gridSize}
          />
        ))}
        
        {/* Render selection box if active */}
        {selectionBox && selectionBox.active && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-20"
            style={{
              left: selectionBox.width >= 0 ? selectionBox.startX : selectionBox.startX + selectionBox.width,
              top: selectionBox.height >= 0 ? selectionBox.startY : selectionBox.startY + selectionBox.height,
              width: Math.abs(selectionBox.width),
              height: Math.abs(selectionBox.height),
            }}
          />
        )}
        
        {/* Render positioning controls */}
        <PositioningControls gridSize={gridSize} />
        
        {/* Empty canvas message */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p>Add elements from the library</p>
              <p className="text-sm mt-1">Use the hierarchy panel to organize elements</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas; 