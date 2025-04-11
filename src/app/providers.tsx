'use client'

import { ReactNode } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { useElementStore } from '@/store/useElementStore';
import { useGridSnapping } from '@/hooks/useGridSnapping';

export function Providers({ children }: { children: ReactNode }) {
  const { updateElement } = useElementStore();
  
  // Create grid snapping modifier - default to 20px grid
  const gridSnapping = useGridSnapping(20);

  // Configure sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before activation
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // Could add highlighting or other feedback here
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    // Handle droppable interactions if needed
  };

  // Handle drag end - update element positions
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta, over } = event;
    
    if (active && delta) {
      const id = active.id as string;
      const data = active.data.current as any;
      
      if (data) {
        // Get the element's current position
        const left = data.left || 0;
        const top = data.top || 0;
        
        // Calculate new position with delta - no grid snapping
        const newX = left + delta.x;
        const newY = top + delta.y;
        
        // Update the element position
        updateElement(id, {
          x: newX,
          y: newY
        });
      }
    }
  };
  
  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[gridSnapping]}
    >
      {children}
    </DndContext>
  );
} 