# Zustand Migration Documentation

## Overview

The codebase has been migrated from React Context API to Zustand for state management. This change provides several benefits:

1. More efficient state management with fine-grained updates
2. Built-in persistence capabilities
3. Simpler API with less boilerplate
4. Better performance for complex state updates
5. Improved debugging capabilities

## Key Changes

1. Created a Zustand store in `src/store/useElementStore.ts` that replaces the `ElementContext`
2. Removed the context provider wrappers from the component tree
3. Updated all components to consume state from the Zustand store instead of using the context
4. Added persistence to localStorage for improved user experience

## Usage

To access the element state and actions:

```tsx
import { useElementStore } from '@/store/useElementStore';

const Component = () => {
  const { 
    elements,
    selectedElementId,
    addElement,
    updateElement,
    removeElement,
    // ... other actions
  } = useElementStore();
  
  // Use the state and actions
  return (
    // ...
  );
};
```

## Store Structure

The element store provides the following:

### State
- `elements` - Array of all elements
- `selectedElementId` - ID of the currently selected element

### Actions
- `addElement` - Create a new element
- `updateElement` - Update an existing element
- `removeElement` - Delete an element and its children
- `setSelectedElementId` - Set the selected element
- `setParentChild` - Establish parent-child relationships between elements
- `adjustZIndex` - Change element layering
- `getChildElements` - Get all children of a specific element
- `getMaxZIndex` - Get the highest z-index

## Benefits of the Migration

1. **Code Simplification**: Removed redundant provider nesting and simplified component implementations
2. **Performance**: More efficient updates with better granular control
3. **Persistence**: Built-in localStorage persistence for user's work
4. **Debugging**: Easier to debug with Zustand's devtools integration
5. **Maintainability**: Centralized state management in a single store file 