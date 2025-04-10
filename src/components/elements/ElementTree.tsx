'use client'
import React, { useState } from 'react';
import { useElementStore, Element } from '@/store/useElementStore';
import { ChevronDown, ChevronRight, Layers, Move, Eye, EyeOff, Plus, Trash } from 'lucide-react';

interface ElementTreeItemProps {
  element: Element;
  level: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

const ElementTreeItem: React.FC<ElementTreeItemProps> = ({ 
  element, 
  level,
  isExpanded,
  onToggle
}) => {
  const { 
    elements, 
    selectedElementId, 
    setSelectedElementId, 
    getChildElements,
    setParentChild,
    adjustZIndex,
    removeElement,
    updateElement
  } = useElementStore();
  
  const childElements = getChildElements(element.id);
  const hasChildren = childElements.length > 0;
  const isSelected = selectedElementId === element.id;
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle drag and drop for parent-child relationship
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', element.id);
    setIsDragging(true);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedElementId = e.dataTransfer.getData('text/plain');
    
    // Don't do anything if dropping onto itself
    if (draggedElementId === element.id) return;
    
    // Set the dropped element as a child of this element
    setParentChild(draggedElementId, element.id);
    
    // Expand this element to show the new child
    if (!isExpanded) {
      onToggle(element.id);
    }
  };
  
  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
    const styleUpdates = element.style || {};
    styleUpdates.display = !isVisible ? undefined : 'none';
    // Update element display style
    updateElement(element.id, { style: styleUpdates });
  };
  
  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1 px-2 text-sm ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'} rounded`}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
        onClick={() => setSelectedElementId(element.id)}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        draggable
      >
        {/* Expand/collapse button */}
        <button 
          className={`mr-1 p-1 rounded hover:bg-gray-600 ${!hasChildren ? 'invisible' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(element.id);
          }}
        >
          {isExpanded ? 
            <ChevronDown className="w-3 h-3" /> : 
            <ChevronRight className="w-3 h-3" />
          }
        </button>
        
        {/* Visibility toggle */}
        <button 
          className="mr-1 p-1 rounded hover:bg-gray-600"
          onClick={toggleVisibility}
        >
          {isVisible ? 
            <Eye className="w-3 h-3" /> : 
            <EyeOff className="w-3 h-3" />
          }
        </button>
        
        {/* Element name and type */}
        <div className="flex-1 flex items-center">
          <span className="mr-2">{element.type}</span>
          <span className="text-xs opacity-70">
            (id: {element.id.split('-').pop()})
          </span>
        </div>
        
        {/* Z-index controls */}
        <div className="flex ml-2">
          <button 
            className="p-1 rounded hover:bg-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              adjustZIndex(element.id, 'up');
            }}
            title="Move Forward"
          >
            <Layers className="w-3 h-3" />
          </button>
          
          {/* Delete button */}
          <button 
            className="p-1 rounded hover:bg-red-600 ml-1"
            onClick={(e) => {
              e.stopPropagation();
              removeElement(element.id);
            }}
            title="Delete Element"
          >
            <Trash className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Render children if expanded */}
      {isExpanded && hasChildren && (
        <div className="pl-4">
          {childElements.map((child) => (
            <ElementTreeItem 
              key={child.id} 
              element={child} 
              level={level + 1}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ElementTree: React.FC = () => {
  const { elements, setParentChild } = useElementStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Get root elements (elements with no parents)
  const rootElements = elements.filter(el => !el.parentId);
  
  // Toggle expanded state
  const toggleExpand = (id: string) => {
    if (expandedItems.includes(id)) {
      setExpandedItems(expandedItems.filter(itemId => itemId !== id));
    } else {
      setExpandedItems([...expandedItems, id]);
    }
  };
  
  // Drag area for elements without a parent
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const draggedElementId = e.dataTransfer.getData('text/plain');
    
    // Set the element's parent to null (make it a root element)
    setParentChild(draggedElementId, null);
  };
  
  return (
    <div className="p-2 bg-gray-800 rounded">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Element Hierarchy</h3>
      </div>
      
      <div 
        className="min-h-[100px] bg-gray-900 rounded p-1"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {rootElements.length === 0 ? (
          <div className="text-xs text-gray-400 p-2 text-center">
            No elements added yet
          </div>
        ) : (
          rootElements.map((element) => (
            <ElementTreeItem 
              key={element.id} 
              element={element} 
              level={0}
              isExpanded={expandedItems.includes(element.id)}
              onToggle={toggleExpand}
            />
          ))
        )}
      </div>
      
      <div className="text-xs text-gray-400 mt-2">
        <p>Drag elements to create parent-child relationships</p>
        <p>Click on an element to select it</p>
      </div>
    </div>
  );
};

export default ElementTree; 