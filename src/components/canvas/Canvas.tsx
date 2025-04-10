import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
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
  showGrid = true,
  showRulers = true,
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

  // Function to snap coordinates to grid
  const snapToGrid = (value: number) => {
    return Math.round(value / gridSize) * gridSize;
  };

  // Setup drop functionality with react-dnd
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: any, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      
      if (!delta) return {};
      
      // Calculate new position, clamping to canvas boundaries
      const newX = Math.max(0, Math.min(width - (showRulers ? 40 : 20), item.left + delta.x));
      const newY = Math.max(0, Math.min(height - (showRulers ? 40 : 20), item.top + delta.y));
      
      return {
        x: newX,
        y: newY
      };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Generate ruler markers
  const generateMarkers = (size: number, isHorizontal: boolean) => {
    const markers = [];
    const count = isHorizontal ? Math.ceil(width / gridSize) : Math.ceil(height / gridSize);
    
    for (let i = 0; i <= count; i++) {
      const position = i * gridSize;
      const isLarge = i % 5 === 0;
      
      markers.push(
        <div
          key={i}
          className={`absolute bg-gray-400 ${isLarge ? 'bg-gray-600' : ''}`}
          style={{
            ...(isHorizontal
              ? {
                  left: `${position}px`,
                  top: isLarge ? '0px' : '15px',
                  width: '1px',
                  height: isLarge ? '20px' : '5px',
                }
              : {
                  top: `${position}px`,
                  left: isLarge ? '0px' : '15px',
                  height: '1px',
                  width: isLarge ? '20px' : '5px',
                }),
          }}
        />
      );
      
      // Add labels for large markers
      if (isLarge) {
        markers.push(
          <div
            key={`text-${i}`}
            className="absolute text-xs text-gray-600"
            style={{
              ...(isHorizontal
                ? {
                    left: `${position - 7}px`,
                    top: '22px',
                  }
                : {
                    top: `${position - 7}px`,
                    left: '22px',
                  }),
            }}
          >
            {position}
          </div>
        );
      }
    }
    
    return markers;
  };
  
  // Handle mouse events for selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return;
    
    // Clear selection on canvas click
    setSelectedElementId(null);
    
    // Start selection box if the user is pressing shift or ctrl
    if (e.shiftKey || e.ctrlKey) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;
      
      setSelectionBox({
        startX,
        startY,
        width: 0,
        height: 0,
        active: true
      });
      
      // Add event listeners for selection box
      document.addEventListener('mousemove', handleSelectionMove);
      document.addEventListener('mouseup', handleSelectionEnd);
    }
  };
  
  // Handle selection box movement
  const handleSelectionMove = (e: MouseEvent) => {
    if (!selectionBox || !selectionBox.active || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    setSelectionBox({
      ...selectionBox,
      width: currentX - selectionBox.startX,
      height: currentY - selectionBox.startY
    });
  };
  
  // Handle selection box end
  const handleSelectionEnd = () => {
    if (!selectionBox || !selectionBox.active) return;
    
    // Calculate the selection box coordinates
    const left = selectionBox.width >= 0 ? selectionBox.startX : selectionBox.startX + selectionBox.width;
    const top = selectionBox.height >= 0 ? selectionBox.startY : selectionBox.startY + selectionBox.height;
    const right = selectionBox.width >= 0 ? selectionBox.startX + selectionBox.width : selectionBox.startX;
    const bottom = selectionBox.height >= 0 ? selectionBox.startY + selectionBox.height : selectionBox.startY;
    
    // Find elements that fall within the selection box
    const selectedElements = elements.filter((element) => {
      // Check if element is within selection box
      return (
        element.x < right &&
        element.x + element.width > left &&
        element.y < bottom &&
        element.y + element.height > top
      );
    });
    
    // Select the first element (or allow multi-select in the future)
    if (selectedElements.length > 0) {
      setSelectedElementId(selectedElements[0].id);
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleSelectionMove);
    document.removeEventListener('mouseup', handleSelectionEnd);
    
    // Clear selection box
    setSelectionBox(null);
  };
  
  // Clean up event listeners on component unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleSelectionMove);
      document.removeEventListener('mouseup', handleSelectionEnd);
    };
  }, []);

  return (
    <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
      {/* Horizontal ruler */}
      {showRulers && (
        <div className="absolute left-[20px] top-0 h-[20px] bg-gray-100 border-b border-r border-gray-300" style={{ width: `${width}px` }}>
          {generateMarkers(gridSize, true)}
        </div>
      )}
      
      {/* Vertical ruler */}
      {showRulers && (
        <div className="absolute left-0 top-[20px] w-[20px] bg-gray-100 border-r border-gray-300" style={{ height: `${height}px` }}>
          {generateMarkers(gridSize, false)}
        </div>
      )}
      
      {/* Ruler corner */}
      {showRulers && (
        <div className="absolute left-0 top-0 w-[20px] h-[20px] bg-gray-200 border-r border-b border-gray-300"></div>
      )}
      
      {/* Main canvas area */}
      <div
        ref={(node) => {
          canvasRef.current = node;
          drop(node);
        }}
        className={`absolute bg-white ${showGrid ? 'bg-grid-pattern-enhanced' : ''} ${isOver ? 'bg-blue-50' : ''}`}
        style={{
          left: showRulers ? '20px' : '0',
          top: showRulers ? '20px' : '0',
          width: showRulers ? `${width - 20}px` : `${width}px`,
          height: showRulers ? `${height - 20}px` : `${height}px`,
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