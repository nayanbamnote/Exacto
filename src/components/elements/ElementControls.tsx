'use client'
import React from 'react';
import { Element as ElementType } from '@/store/useElementStore';

interface ElementControlsProps {
  element: ElementType;
  isResizing: boolean;
  isSelected: boolean;
  handleRotateStart: (e: React.MouseEvent) => void;
  toggleSizeDialog: () => void;
  getPositionDisplay: () => string;
  getPositionMode: () => 'absolute' | 'relative';
}

const ElementControls: React.FC<ElementControlsProps> = ({
  element,
  isResizing,
  isSelected,
  handleRotateStart,
  toggleSizeDialog,
  getPositionDisplay,
  getPositionMode
}) => {
  if (!isSelected) return null;

  return (
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
      
      {/* Information panel - positioned at the bottom of the element instead */}
      <div className="absolute left-0 -bottom-1 transform translate-y-full mt-1 bg-gray-900 text-white rounded shadow-md z-50 text-xs">
        <div className="flex items-center px-2 py-1">
          <span>Size: {element.width}×{element.height}</span>
          {getPositionMode() === 'absolute' && (
            <>
              <span className="mx-1 text-gray-400">|</span>
              <span>X: {element.x.toFixed(2)}, Y: {element.y.toFixed(2)}</span>
            </>
          )}
          <span className="mx-1 text-gray-400">|</span>
          <span>Rot: {Math.round(element.rotation || 0)}°</span>
        </div>
        
        {/* Tags in a separate line */}
        <div className="flex items-center gap-1 px-1 py-1 bg-black bg-opacity-30">
          <span className="px-1 bg-blue-600 rounded">{getPositionMode()}</span>
          {element.parentId && (
            <span className="px-1 bg-purple-600 rounded">child</span>
          )}
          <span className="px-1 bg-gray-600 rounded">z:{element.zIndex || 1}</span>
        </div>
      </div>
    </>
  );
};

export default ElementControls; 