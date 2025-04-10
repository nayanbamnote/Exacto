'use client'
import React, { useRef, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Element as ElementType, useElementStore } from '@/store/useElementStore';
import { ResizableBox, ResizeCallbackData, ResizeHandle } from 'react-resizable';
import 'react-resizable/css/styles.css';

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
  
  // Handle element selection
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElementId(element.id);
  };

  // Function to snap to grid
  const snapToGrid = (value: number) => {
    return Math.round(value / gridSize) * gridSize;
  };
  
  // Setup drag functionality with react-dnd
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => ({ 
      id: element.id,
      type: element.type,
      left: element.x,
      top: element.y 
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<DropResult>();
      if (!dropResult) return;
      
      updateElement(element.id, {
        x: snapToGrid(dropResult.x),
        y: snapToGrid(dropResult.y)
      });
    },
  });
  
  // Handle resize using react-resizable
  const handleResize = (
    event: React.SyntheticEvent, 
    { size, handle }: ResizeCallbackData
  ) => {
    // Snap to grid
    const width = snapToGrid(size.width);
    const height = snapToGrid(size.height);
    
    // Ensure minimum dimensions
    const newWidth = Math.max(gridSize, width);
    const newHeight = Math.max(gridSize, height);
    
    // Update element with new dimensions
    updateElement(element.id, {
      width: newWidth,
      height: newHeight
    });
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
  
  // Handle keyboard focus for accessibility
  useEffect(() => {
    if (isSelected && elementRef.current) {
      elementRef.current.focus();
    }
  }, [isSelected]);

  // Generate the style for the element
  const elementStyle: React.CSSProperties = {
    position: element.style?.position || 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    cursor: isRotating ? 'grabbing' : 'move',
    opacity: isDragging ? 0.5 : 1,
    transform: `rotate(${element.rotation}deg)`,
    transformOrigin: 'center center',
    zIndex: element.zIndex || 1,
    ...element.style,
  };
  
  // Initialize the reference to the draggable element
  drag(elementRef);
  
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
  
  // Define resizable props
  const resizableProps = {
    width: element.width,
    height: element.height,
    onResize: handleResize,
    resizeHandles: isSelected ? ['se', 'sw', 'ne', 'nw'] as ResizeHandle[] : [] as ResizeHandle[],
    minConstraints: [gridSize, gridSize] as [number, number],
    maxConstraints: [2000, 2000] as [number, number],
    grid: [gridSize, gridSize] as [number, number],
  };
  
  return (
    <div 
      style={elementStyle}
      onClick={handleSelect}
      data-element-id={element.id}
      data-element-type={element.type}
      data-parent-id={element.parentId || ''}
      tabIndex={isSelected ? 0 : -1}
      aria-label={`${element.type} element at position x: ${element.x}, y: ${element.y}`}
    >
      <ResizableBox 
        {...resizableProps} 
        className="react-resizable"
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
        </div>
      </ResizableBox>
    </div>
  );
};

export default Element; 