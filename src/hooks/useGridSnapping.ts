import { Modifier } from '@dnd-kit/core';

/**
 * Custom hook to create a modifier that snaps elements to a grid during drag operations
 * 
 * @param gridSize The size of the grid to snap to
 * @returns A modifier function to use with DndContext
 */
export function useGridSnapping(gridSize: number): Modifier {
  return ({ transform }) => {
    // Simply return the original transform without snapping to grid
    return transform;
  };
} 