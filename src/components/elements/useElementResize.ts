'use client'
import { useState, useRef, useEffect } from 'react';
import { Element as ElementType } from '@/store/useElementStore';

interface UseElementResizeProps {
  element: ElementType;
  updateElement: (id: string, updates: Partial<ElementType>) => void;
  gridSize: number;
  isSelected: boolean;
}

export const useElementResize = ({ element, updateElement, gridSize, isSelected }: UseElementResizeProps) => {
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [tempSize, setTempSize] = useState({ width: element.width, height: element.height });
  const [isResizing, setIsResizing] = useState(false);
  
  // Create a timeout ref for resize indicator
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle resize with keyboard shortcuts (function to be called from hotkeys)
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
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    showSizeDialog,
    setShowSizeDialog,
    tempSize,
    setTempSize,
    isResizing,
    setIsResizing,
    resizeElement,
    toggleSizeDialog,
    applySize
  };
}; 