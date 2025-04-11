'use client'
import { useState, useRef } from 'react';
import { Element as ElementType } from '@/store/useElementStore';

interface UseElementRotationProps {
  element: ElementType;
  updateElement: (id: string, updates: Partial<ElementType>) => void;
}

export const useElementRotation = ({ element, updateElement }: UseElementRotationProps) => {
  const [isRotating, setIsRotating] = useState(false);
  const [startRotate, setStartRotate] = useState({ rotation: 0, startAngle: 0 });
  
  // Handle rotation start
  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsRotating(true);
    
    // Calculate center of element
    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate initial angle
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    setStartRotate({
      rotation: element.rotation || 0,
      startAngle: startAngle
    });
    
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleRotateMove);
    document.addEventListener('mouseup', handleRotateEnd);
  };
  
  // Handle rotation move
  const handleRotateMove = (e: MouseEvent) => {
    if (!isRotating) return;
    
    const rect = document.querySelector(`[data-element-id="${element.id}"]`)?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate center of element
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
  
  return {
    isRotating,
    handleRotateStart,
    handleRotateMove,
    handleRotateEnd
  };
}; 