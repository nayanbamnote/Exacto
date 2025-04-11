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
  );
};

export default ElementControls; 