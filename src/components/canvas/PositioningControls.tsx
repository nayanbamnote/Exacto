'use client'
import React, { useRef } from 'react';
import { Element, useElementStore } from '@/store/useElementStore';
import { useHotkeys } from 'react-hotkeys-hook';

interface PositioningControlsProps {
  gridSize: number;
}

const PositioningControls: React.FC<PositioningControlsProps> = ({ gridSize }) => {
  const { elements, selectedElementId, updateElement } = useElementStore();
  const selectedElement = elements.find(el => el.id === selectedElementId);
  const positionRef = useRef<{ x: number, y: number } | null>(null);

  // Use react-hotkeys-hook for more precise keyboard controls
  useHotkeys('up', (e) => {
    if (!selectedElementId || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    moveSelectedElement(0, -gridSize);
  }, { keydown: true, keyup: false });

  useHotkeys('shift+up', (e) => {
    if (!selectedElementId || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    moveSelectedElement(0, -10);
  }, { keydown: true, keyup: false });

  useHotkeys('alt+up', (e) => {
    if (!selectedElementId || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    moveSelectedElement(0, -1);
  }, { keydown: true, keyup: false });

  useHotkeys('down', (e) => {
    if (!selectedElementId || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    moveSelectedElement(0, gridSize);
  }, { keydown: true, keyup: false });

  useHotkeys('shift+down', (e) => {
    if (!selectedElementId || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    moveSelectedElement(0, 10);
  }, { keydown: true, keyup: false });

  useHotkeys('alt+down', (e) => {
    if (!selectedElementId || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    moveSelectedElement(0, 1);
  }, { keydown: true, keyup: false });

  useHotkeys('left', (e) => {
    if (!selectedElementId || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    moveSelectedElement(-gridSize, 0);
  }, { keydown: true, keyup: false });

  useHotkeys('shift+left', (e) => {
    if (!selectedElementId || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    moveSelectedElement(-10, 0);
  }, { keydown: true, keyup: false });

  useHotkeys('alt+left', (e) => {
    if (!selectedElementId || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    moveSelectedElement(-1, 0);
  }, { keydown: true, keyup: false });

  useHotkeys('right', (e) => {
    if (!selectedElementId || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    moveSelectedElement(gridSize, 0);
  }, { keydown: true, keyup: false });

  useHotkeys('shift+right', (e) => {
    if (!selectedElementId || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    moveSelectedElement(10, 0);
  }, { keydown: true, keyup: false });

  useHotkeys('alt+right', (e) => {
    if (!selectedElementId || document.activeElement?.tagName === 'INPUT') return;
    e.preventDefault();
    moveSelectedElement(1, 0);
  }, { keydown: true, keyup: false });

  // Helper function to move elements
  const moveSelectedElement = (deltaX: number, deltaY: number) => {
    if (!selectedElementId) return;
    
    const element = elements.find(el => el.id === selectedElementId);
    if (!element) return;
    
    updateElement(element.id, {
      x: Math.max(0, element.x + deltaX),
      y: Math.max(0, element.y + deltaY)
    });
  };

  // Get position mode from element's style
  const getPositionMode = (element: Element) => {
    return (element.style?.position || 'absolute') as 'absolute' | 'relative';
  };

  // Determine whether to show coordinates based on the position mode
  const shouldShowCoordinates = (element: Element) => {
    return getPositionMode(element) === 'absolute';
  };

  return (
    <>
      {selectedElement && (
        <>
          {/* Position indicators - only show for absolute positioning */}
          <div className="absolute pointer-events-none" 
            style={{ 
              left: `${selectedElement.x}px`, 
              top: `${selectedElement.y}px`, 
              width: `${selectedElement.width}px`, 
              height: `${selectedElement.height}px`,
              zIndex: 9999 
            }}>
            <div className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-1 rounded">
              {shouldShowCoordinates(selectedElement) 
                ? `X: ${selectedElement.x}, Y: ${selectedElement.y}` 
                : `Position: ${getPositionMode(selectedElement)}`}
            </div>
            
            {/* Helper lines - only show for absolute positioning */}
            {shouldShowCoordinates(selectedElement) && (
              <>
                <div className="absolute top-0 bottom-0 -left-[9999px] right-[9999px] border-t border-dashed border-blue-400 opacity-40"></div>
                <div className="absolute left-0 right-0 -top-[9999px] bottom-[9999px] border-l border-dashed border-blue-400 opacity-40"></div>
              </>
            )}
          </div>
          
          {/* Position mode indicator */}
          <div className="absolute bottom-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-80">
            Position Mode: {getPositionMode(selectedElement)}
          </div>
        </>
      )}
    </>
  );
};

export default PositioningControls; 