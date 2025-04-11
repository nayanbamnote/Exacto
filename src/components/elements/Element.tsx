'use client'
import React, { useRef, useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Element as ElementType, useElementStore } from '@/store/useElementStore';
import { useHotkeys } from 'react-hotkeys-hook';

interface ElementProps {
  element: ElementType;
  gridSize: number;
}

// Define the drag item type
const ITEM_TYPE = 'ELEMENT';

// Define drop result interface
interface DropResult {
  x: number;
  y: number;
}

const Element: React.FC<ElementProps> = ({ element, gridSize }) => {
  const { 
    selectedElementId, 
    setSelectedElementId, 
    updateElement, 
    getChildElements 
  } = useElementStore();
  
  const isSelected = selectedElementId === element.id;
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Get child elements
  const childElements = getChildElements(element.id);
  
  // For tracking rotate state
  const [isRotating, setIsRotating] = useState(false);
  const [startRotate, setStartRotate] = useState({ rotation: 0, startAngle: 0 });
  
  // For size popup dialog and resize tracking
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [tempSize, setTempSize] = useState({ width: element.width, height: element.height });
  const [isResizing, setIsResizing] = useState(false);

  // Create a timeout ref for resize indicator
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle element selection
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElementId(element.id);
  };

  // Setup drag functionality with @dnd-kit/core
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
    data: {
      type: element.type,
      left: element.x,
      top: element.y,
      gridSize
    }
  });
  
  // Handle resize with keyboard shortcuts
  useHotkeys('alt+up', (e) => {
    if (!isSelected || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    e.stopPropagation();
    resizeElement(0, -1);
  }, { keydown: true, keyup: false, preventDefault: true });

  useHotkeys('alt+down', (e) => {
    if (!isSelected || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    e.stopPropagation();
    resizeElement(0, 1);
  }, { keydown: true, keyup: false, preventDefault: true });

  useHotkeys('alt+left', (e) => {
    if (!isSelected || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    e.stopPropagation();
    resizeElement(-1, 0);
  }, { keydown: true, keyup: false, preventDefault: true });

  useHotkeys('alt+right', (e) => {
    if (!isSelected || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    e.stopPropagation();
    resizeElement(1, 0);
  }, { keydown: true, keyup: false, preventDefault: true });

  useHotkeys('shift+alt+up', (e) => {
    if (!isSelected || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    e.stopPropagation();
    resizeElement(0, -10);
  }, { keydown: true, keyup: false, preventDefault: true });

  useHotkeys('shift+alt+down', (e) => {
    if (!isSelected || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    e.stopPropagation();
    resizeElement(0, 10);
  }, { keydown: true, keyup: false, preventDefault: true });

  useHotkeys('shift+alt+left', (e) => {
    if (!isSelected || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    e.stopPropagation();
    resizeElement(-10, 0);
  }, { keydown: true, keyup: false, preventDefault: true });

  useHotkeys('shift+alt+right', (e) => {
    if (!isSelected || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    e.stopPropagation();
    resizeElement(10, 0);
  }, { keydown: true, keyup: false, preventDefault: true });

  // Toggle size dialog with r key
  useHotkeys('r', (e) => {
    if (!isSelected || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    toggleSizeDialog();
  }, { keydown: true });

  // Helper function to resize elements
  const resizeElement = (deltaWidth: number, deltaHeight: number) => {
    if (!isSelected) return;
    
    // Set resizing indicator
    setIsResizing(true);
    
    // Clear any existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    // Set timeout to hide indicator after 500ms of inactivity
    resizeTimeoutRef.current = setTimeout(() => {
      setIsResizing(false);
    }, 500);
    
    const newWidth = Math.max(gridSize, element.width + deltaWidth);
    const newHeight = Math.max(gridSize, element.height + deltaHeight);
    
    updateElement(element.id, {
      width: newWidth,
      height: newHeight
    });
  };
  
  // Toggle size dialog
  const toggleSizeDialog = () => {
    if (!showSizeDialog) {
      setTempSize({ width: element.width, height: element.height });
    }
    setShowSizeDialog(!showSizeDialog);
  };
  
  // Apply size from dialog
  const applySize = () => {
    updateElement(element.id, {
      width: Math.max(gridSize, tempSize.width),
      height: Math.max(gridSize, tempSize.height)
    });
    setShowSizeDialog(false);
  };
  
  // Handle rotation start
  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsRotating(true);
    
    // Calculate center of element
    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate initial angle
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    setStartRotate({
      rotation: element.rotation,
      startAngle: startAngle
    });
    
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleRotateMove);
    document.addEventListener('mouseup', handleRotateEnd);
  };
  
  // Handle rotation move
  const handleRotateMove = (e: MouseEvent) => {
    if (!isRotating || !elementRef.current) return;
    
    // Calculate center of element
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate current angle
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    // Calculate delta angle
    let deltaAngle = currentAngle - startRotate.startAngle;
    
    // Snap rotation to 15-degree increments when holding Shift
    if (e.shiftKey) {
      deltaAngle = Math.round(deltaAngle / 15) * 15;
    }
    
    // Calculate new rotation
    let newRotation = startRotate.rotation + deltaAngle;
    
    // Normalize rotation to 0-360 degrees
    newRotation = ((newRotation % 360) + 360) % 360;
    
    updateElement(element.id, { rotation: newRotation });
  };
  
  // Handle rotation end
  const handleRotateEnd = () => {
    setIsRotating(false);
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleRotateMove);
    document.removeEventListener('mouseup', handleRotateEnd);
  };
  
  // Handle keyboard focus for accessibility and clean up resize timeout
  useEffect(() => {
    if (isSelected && elementRef.current) {
      elementRef.current.focus();
    }
    
    // Clean up timeout on unmount
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [isSelected]);

  // Generate the style for the element
  const elementStyle: React.CSSProperties = {
    position: element.style?.position || 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    cursor: isRotating ? 'grabbing' : isResizing ? 'nwse-resize' : 'move',
    opacity: isDragging ? 0.5 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${element.rotation}deg)` : `rotate(${element.rotation}deg)`,
    transformOrigin: 'center center',
    zIndex: element.zIndex || 1,
    border: isResizing ? '1px dashed #3b82f6' : undefined,
    ...element.style,
  };
  
  // Get position mode from element's style
  const getPositionMode = () => {
    return (element.style?.position || 'absolute') as 'absolute' | 'relative';
  };
  
  // Display position information based on the positioning mode
  const getPositionDisplay = () => {
    const positionMode = getPositionMode();
    if (positionMode === 'absolute') {
      return `${element.width} × ${element.height} | ${Math.round(element.rotation)}°`;
    } else {
      return `${element.width} × ${element.height} | ${Math.round(element.rotation)}° (relative)`;
    }
  };
  
  return (
    <div 
      style={elementStyle}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleSelect}
      data-element-id={element.id}
      data-element-type={element.type}
      data-parent-id={element.parentId || ''}
      tabIndex={isSelected ? 0 : -1}
      aria-label={`${element.type} element at position x: ${element.x}, y: ${element.y}`}
    >
      <div 
        ref={elementRef}
        className="element w-full h-full"
      >
        {element.content}
        
        {/* Render child elements */}
        {childElements.map(child => (
          <Element
            key={child.id}
            element={child}
            gridSize={gridSize}
          />
        ))}
        
        {/* Show the rotation handle when the element is selected */}
        {isSelected && (
          <>
            {/* Resize handles - small div on corners when selected */}
            <div 
              className={`resize-handle resize-handle-se ${isResizing ? 'bg-blue-400' : ''}`}
              onMouseDown={(e) => {
                e.stopPropagation();
                toggleSizeDialog();
              }}
            />
            <div 
              className={`resize-handle resize-handle-sw ${isResizing ? 'bg-blue-400' : ''}`}
              onMouseDown={(e) => {
                e.stopPropagation();
                toggleSizeDialog();
              }}
            />
            <div 
              className={`resize-handle resize-handle-ne ${isResizing ? 'bg-blue-400' : ''}`}
              onMouseDown={(e) => {
                e.stopPropagation();
                toggleSizeDialog();
              }}
            />
            <div 
              className={`resize-handle resize-handle-nw ${isResizing ? 'bg-blue-400' : ''}`}
              onMouseDown={(e) => {
                e.stopPropagation();
                toggleSizeDialog();
              }}
            />
            
            {/* Rotation handle */}
            <div 
              className={`absolute w-3 h-3 bg-green-500 border border-white rounded-full -top-8 left-1/2 -translate-x-1/2 cursor-grab z-10`}
              onMouseDown={handleRotateStart}
            />
            
            {/* Connection line for rotation handle */}
            <div 
              className="absolute w-px h-6 bg-green-500 left-1/2 -top-6 -translate-x-1/2 z-9"
            />
            
            {/* Information labels - repositioned to avoid overlap */}
            <div className="absolute -top-24 left-0 flex flex-col gap-1 items-start">
              {/* Element size and rotation info */}
              <div className="text-xs bg-blue-500 text-white px-1 rounded">
                {getPositionDisplay()}
              </div>
              
              {/* Parent indicator */}
              {element.parentId && (
                <div className="text-xs bg-purple-500 text-white px-1 rounded">
                  Child of {element.parentId.split('-').pop()}
                </div>
              )}
              
              {/* Z-index indicator */}
              <div className="text-xs bg-gray-700 text-white px-1 rounded">
                z-index: {element.zIndex || 1}
              </div>
              
              {/* Position mode indicator */}
              <div className="text-xs bg-gray-600 text-white px-1 rounded">
                {getPositionMode()}
              </div>
            </div>
          </>
        )}
        
        {/* Size dialog popup */}
        {isSelected && showSizeDialog && (
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-sm font-semibold mb-3">Resize Element</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label className="text-white text-xs">Width:</label>
                <input 
                  type="number" 
                  min={gridSize}
                  value={tempSize.width} 
                  onChange={(e) => setTempSize({...tempSize, width: parseInt(e.target.value) || gridSize})}
                  className="w-20"
                />
                <span className="text-gray-400 text-xs">px</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-white text-xs">Height:</label>
                <input 
                  type="number" 
                  min={gridSize}
                  value={tempSize.height} 
                  onChange={(e) => setTempSize({...tempSize, height: parseInt(e.target.value) || gridSize})}
                  className="w-20"
                />
                <span className="text-gray-400 text-xs">px</span>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={() => setShowSizeDialog(false)}
                  className="bg-gray-700 text-white px-2 py-1 text-xs rounded"
                >
                  Cancel
                </button>
                <button 
                  onClick={applySize}
                  className="bg-blue-600 text-white px-2 py-1 text-xs rounded"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Element; 