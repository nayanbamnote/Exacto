import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the element type
export interface Element {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  parentId: string | null;
  content?: string;
  style?: Record<string, any>;
  children?: string[];
}

// Define store state and actions
interface ElementState {
  elements: Element[];
  selectedElementId: string | null;
  
  // Actions
  addElement: (element: Omit<Element, 'id'>) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  removeElement: (id: string) => void;
  setSelectedElementId: (id: string | null) => void;
  setParentChild: (childId: string, parentId: string | null) => void;
  adjustZIndex: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  getChildElements: (parentId: string) => Element[];
  getMaxZIndex: () => number;
}

// Create the store
export const useElementStore = create<ElementState>()(
  persist(
    (set, get) => ({
      elements: [],
      selectedElementId: null,
      
      // Add a new element
      addElement: (element) => {
        const newElement = {
          ...element,
          id: `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          rotation: element.rotation || 0,
          zIndex: element.zIndex || get().getMaxZIndex() + 1,
          parentId: element.parentId || null,
          children: element.children || [],
        };
        
        set((state) => ({
          elements: [...state.elements, newElement],
          selectedElementId: newElement.id
        }));
      },
      
      // Update an existing element
      updateElement: (id, updates) => {
        set((state) => ({
          elements: state.elements.map((el) => 
            el.id === id ? { ...el, ...updates } : el
          )
        }));
      },
      
      // Remove an element and its children recursively
      removeElement: (id) => {
        const removeElementAndChildren = (elementId: string, elements: Element[]) => {
          // Find direct children
          const childIds = elements
            .filter(el => el.parentId === elementId)
            .map(el => el.id);
          
          // Recursively remove children
          let remainingElements = elements;
          for (const childId of childIds) {
            remainingElements = removeElementAndChildren(childId, remainingElements);
          }
          
          // Remove the element itself
          return remainingElements.filter(el => el.id !== elementId);
        };
        
        set((state) => {
          const newElements = removeElementAndChildren(id, state.elements);
          return {
            elements: newElements,
            selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
          };
        });
      },
      
      // Set the selected element ID
      setSelectedElementId: (id) => {
        set({ selectedElementId: id });
      },
      
      // Set parent-child relationship
      setParentChild: (childId, parentId) => {
        // Check for circular references
        if (parentId) {
          const checkForCycle = (currentId: string, targetId: string): boolean => {
            if (currentId === targetId) return true;
            
            const { elements } = get();
            const isParentOfTarget = (id: string, targetId: string): boolean => {
              const children = elements.filter(el => el.parentId === id).map(el => el.id);
              if (children.includes(targetId)) return true;
              return children.some(c => isParentOfTarget(c, targetId));
            };
            
            return isParentOfTarget(currentId, targetId);
          };
          
          if (checkForCycle(childId, parentId)) {
            console.error('Cannot create circular parent-child relationship');
            return;
          }
        }
        
        set((state) => ({
          elements: state.elements.map(el => 
            el.id === childId ? { ...el, parentId } : el
          )
        }));
      },
      
      // Get maximum z-index
      getMaxZIndex: () => {
        const { elements } = get();
        if (elements.length === 0) return 0;
        return Math.max(...elements.map(el => el.zIndex || 0));
      },
      
      // Adjust z-index
      adjustZIndex: (id, direction) => {
        const { elements } = get();
        const currentElement = elements.find(el => el.id === id);
        if (!currentElement) return;
        
        const siblingElements = elements.filter(el => 
          el.parentId === currentElement.parentId && el.id !== id
        );
        
        // Sort siblings by z-index
        const sortedSiblings = [...siblingElements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        
        let newZIndex = currentElement.zIndex || 0;
        
        switch (direction) {
          case 'up':
            // Find the next higher z-index
            const nextHigher = sortedSiblings.find(el => (el.zIndex || 0) > (currentElement.zIndex || 0));
            if (nextHigher) {
              newZIndex = (nextHigher.zIndex || 0) + 1;
            }
            break;
          case 'down':
            // Find the next lower z-index
            const nextLower = [...sortedSiblings].reverse().find(el => (el.zIndex || 0) < (currentElement.zIndex || 0));
            if (nextLower) {
              newZIndex = (nextLower.zIndex || 0) - 1;
            }
            break;
          case 'top':
            // Set to highest z-index + 1
            if (sortedSiblings.length) {
              newZIndex = (sortedSiblings[sortedSiblings.length - 1].zIndex || 0) + 1;
            }
            break;
          case 'bottom':
            // Set to lowest z-index - 1
            if (sortedSiblings.length) {
              newZIndex = (sortedSiblings[0].zIndex || 0) - 1;
            }
            break;
        }
        
        get().updateElement(id, { zIndex: newZIndex });
      },
      
      // Get child elements for a given parent
      getChildElements: (parentId) => {
        return get().elements.filter(el => el.parentId === parentId);
      }
    }),
    {
      name: 'element-storage', // unique name for localStorage
      partialize: (state) => ({ elements: state.elements }), // only persist elements array
    }
  )
); 