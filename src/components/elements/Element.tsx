'use client'
import React, { useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Element as ElementType, useElementStore } from '@/store/useElementStore';
import { useHotkeys } from 'react-hotkeys-hook';
import { useElementRotation } from './useElementRotation';
import { useElementResize } from './useElementResize';
import ElementControls from './ElementControls';
import SizeDialog from './SizeDialog';

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
  
  // Use the rotation hook
  const { isRotating, handleRotateStart } = useElementRotation({
    element,
    updateElement
  });
  
  // Use the resize hook
  const {
    showSizeDialog,
    setShowSizeDialog,
    tempSize,
    setTempSize,
    isResizing,
    resizeElement,
    toggleSizeDialog,
    applySize
  } = useElementResize({
    element,
    updateElement,
    gridSize,
    isSelected
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

  // Handle keyboard focus for accessibility
  useEffect(() => {
    if (isSelected && elementRef.current) {
      elementRef.current.focus();
    }
  }, [isSelected]);

  // Get position mode from element's style
  const getPositionMode = () => {
    return (element.style?.position || 'absolute') as 'absolute' | 'relative';
  };
  
  // Display position information based on the positioning mode
  const getPositionDisplay = () => {
    const positionMode = getPositionMode();
    if (positionMode === 'absolute') {
      return `${element.width} × ${element.height} | ${Math.round(element.rotation || 0)}°`;
    } else {
      return `${element.width} × ${element.height} | ${Math.round(element.rotation || 0)}° (relative)`;
    }
  };

  // Generate the style for the element
  const elementStyle: React.CSSProperties = {
    position: element.style?.position || 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    cursor: isRotating ? 'grabbing' : isResizing ? 'nwse-resize' : 'move',
    opacity: isDragging ? 0.5 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${element.rotation || 0}deg)` : `rotate(${element.rotation || 0}deg)`,
    transformOrigin: 'center center',
    zIndex: element.zIndex || 1,
    border: isResizing ? '1px dashed #3b82f6' : undefined,
    ...element.style,
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
        
        {/* Element controls (resize handles, rotation, info) */}
        <ElementControls
          element={element}
          isResizing={isResizing}
          isSelected={isSelected}
          handleRotateStart={handleRotateStart}
          toggleSizeDialog={toggleSizeDialog}
          getPositionDisplay={getPositionDisplay}
          getPositionMode={getPositionMode}
        />
        
        {/* Size dialog popup */}
        {isSelected && showSizeDialog && (
          <SizeDialog
            tempSize={tempSize}
            setTempSize={setTempSize}
            setShowSizeDialog={setShowSizeDialog}
            applySize={applySize}
            gridSize={gridSize}
          />
        )}
      </div>
    </div>
  );
};

export default Element; 