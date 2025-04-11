'use client'
import React, { useState, useEffect } from 'react';
import ElementLibrary from '@/components/elements/ElementLibrary';
import ElementTree from '@/components/elements/ElementTree';
import { useElementStore, Element as ElementType } from '@/store/useElementStore';
import { ArrowUp, ArrowDown, MoveUp, MoveDown } from 'lucide-react';
import CSSGeneratorPanel from './CSSGeneratorPanel';

const Sidebar = () => {
  const { selectedElementId, elements, updateElement, removeElement, adjustZIndex } = useElementStore();
  const [positionMode, setPositionMode] = useState<'absolute' | 'relative'>('absolute');
  const [activeTab, setActiveTab] = useState<'properties' | 'hierarchy'>('properties');
  const [showCssGenerator, setShowCssGenerator] = useState(false);
  
  // Find the currently selected element
  const selectedElement = elements.find((el: ElementType) => el.id === selectedElementId);
  
  // Event listener to close CSS generator panel
  useEffect(() => {
    const handleCloseCssGenerator = () => {
      setShowCssGenerator(false);
    };
    
    document.addEventListener('closeCssGenerator', handleCloseCssGenerator);
    
    return () => {
      document.removeEventListener('closeCssGenerator', handleCloseCssGenerator);
    };
  }, []);
  
  // Handle property changes
  const handlePropertyChange = (property: string, value: any) => {
    if (selectedElementId) {
      updateElement(selectedElementId, { [property]: value });
    }
  };

  // Handle numeric input changes with better flexibility
  const handleNumericChange = (property: string, value: string) => {
    if (selectedElementId) {
      // Allow empty string or valid numbers
      if (value === '' || value === '-') {
        updateElement(selectedElementId, { [property]: value });
      } else {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          updateElement(selectedElementId, { [property]: numValue });
        }
      }
    }
  };

  // Handle position fine adjustment
  const adjustPosition = (property: 'x' | 'y', amount: number) => {
    if (selectedElementId && selectedElement) {
      const currentValue = selectedElement[property];
      updateElement(selectedElementId, { [property]: Math.max(0, currentValue + amount) });
    }
  };
  
  // Update element styling based on position mode
  const updatePositionMode = (mode: 'absolute' | 'relative') => {
    setPositionMode(mode);
    
    if (selectedElementId && selectedElement) {
      // Create a copy of the existing style or initialize a new one
      const updatedStyle = { ...(selectedElement.style || {}) };
      
      // Update the position property
      updatedStyle.position = mode;
      
      // Apply the style update to the element
      updateElement(selectedElementId, { style: updatedStyle });
      
      // Show a notification or message to the user
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded shadow-lg z-50 animate-fade-in-out';
      notification.textContent = `Switched to ${mode} positioning`;
      document.body.appendChild(notification);
      
      // Remove the notification after 2 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 2000);
    }
  };
  
  return (
    <>
      <div className="w-80 bg-gray-800 text-white h-screen p-4 flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-bold">CSS Position Tool</h1>
          <p className="text-xs text-gray-400 mt-1">Visual absolute positioning</p>
        </div>
        
        {/* Element library section */}
        <div className="mb-6">
          <ElementLibrary />
        </div>
        
        {/* Tab navigation for Properties/Hierarchy */}
        <div className="flex border-b border-gray-700 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'properties' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('properties')}
          >
            Properties
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'hierarchy' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('hierarchy')}
          >
            Hierarchy
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'properties' ? (
            <div className="space-y-4">
              {selectedElement ? (
                <div className="space-y-3">
                  {/* Element type info */}
                  <div className="flex items-center justify-between bg-gray-700 p-2 rounded">
                    <span className="text-xs text-gray-300">Type:</span>
                    <span className="text-sm font-medium">{selectedElement.type}</span>
                  </div>

                  {/* Position Mode Switch */}
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-gray-400">Position Mode</label>
                      <span className="text-xs text-gray-400 italic">
                        {positionMode === 'absolute' ? 'Freely position elements' : 'Flow with document'}
                      </span>
                    </div>
                    <div className="flex rounded overflow-hidden text-xs">
                      <button 
                        className={`flex-1 py-1 px-2 ${positionMode === 'absolute' ? 'bg-blue-600 font-medium' : 'bg-gray-600'}`}
                        onClick={() => updatePositionMode('absolute')}
                      >
                        Absolute
                      </button>
                      <button 
                        className={`flex-1 py-1 px-2 ${positionMode === 'relative' ? 'bg-blue-600 font-medium' : 'bg-gray-600'}`}
                        onClick={() => updatePositionMode('relative')}
                      >
                        Relative
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {positionMode === 'absolute' 
                        ? 'X and Y coordinates specify exact position' 
                        : 'Element will be positioned relative to its normal position'}
                    </div>
                  </div>

                  {/* Z-index controls */}
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-gray-400">Z-Index</label>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => adjustZIndex(selectedElement.id, 'bottom')}
                          className="bg-gray-600 hover:bg-gray-500 text-white p-1 rounded-sm"
                          title="Send to Back"
                        >
                          <MoveDown className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => adjustZIndex(selectedElement.id, 'down')}
                          className="bg-gray-600 hover:bg-gray-500 text-white p-1 rounded-sm"
                          title="Send Backward"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => adjustZIndex(selectedElement.id, 'up')}
                          className="bg-gray-600 hover:bg-gray-500 text-white p-1 rounded-sm"
                          title="Bring Forward"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => adjustZIndex(selectedElement.id, 'top')}
                          className="bg-gray-600 hover:bg-gray-500 text-white p-1 rounded-sm"
                          title="Bring to Front"
                        >
                          <MoveUp className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={selectedElement.zIndex ?? ''}
                      onChange={(e) => handleNumericChange('zIndex', e.target.value)}
                      className="w-full bg-gray-600 text-white text-sm rounded px-2 py-1 border border-gray-500"
                    />
                  </div>
                  
                  {/* Position inputs with fine control */}
                  <div className="bg-gray-700 p-2 rounded">
                    <label className="text-xs text-gray-400 block mb-2">Position</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-300">X Position</span>
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => adjustPosition('x', -1)}
                              className="bg-gray-600 hover:bg-gray-500 text-white w-5 h-5 flex items-center justify-center rounded-sm"
                            >
                              -
                            </button>
                            <button 
                              onClick={() => adjustPosition('x', 1)}
                              className="bg-gray-600 hover:bg-gray-500 text-white w-5 h-5 flex items-center justify-center rounded-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={selectedElement.x ?? ''}
                          onChange={(e) => handleNumericChange('x', e.target.value)}
                          className="w-full bg-gray-600 text-white text-sm rounded px-2 py-1 border border-gray-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-300">Y Position</span>
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => adjustPosition('y', -1)}
                              className="bg-gray-600 hover:bg-gray-500 text-white w-5 h-5 flex items-center justify-center rounded-sm"
                            >
                              -
                            </button>
                            <button 
                              onClick={() => adjustPosition('y', 1)}
                              className="bg-gray-600 hover:bg-gray-500 text-white w-5 h-5 flex items-center justify-center rounded-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={selectedElement.y ?? ''}
                          onChange={(e) => handleNumericChange('y', e.target.value)}
                          className="w-full bg-gray-600 text-white text-sm rounded px-2 py-1 border border-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Size inputs */}
                  <div className="bg-gray-700 p-2 rounded">
                    <label className="text-xs text-gray-400 block mb-2">Size</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-xs text-gray-300">Width</span>
                        <input
                          type="text"
                          value={selectedElement.width ?? ''}
                          onChange={(e) => handleNumericChange('width', e.target.value)}
                          className="w-full bg-gray-600 text-white text-sm rounded px-2 py-1 border border-gray-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-gray-300">Height</span>
                        <input
                          type="text"
                          value={selectedElement.height ?? ''}
                          onChange={(e) => handleNumericChange('height', e.target.value)}
                          className="w-full bg-gray-600 text-white text-sm rounded px-2 py-1 border border-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rotation input */}
                  <div className="bg-gray-700 p-2 rounded">
                    <label className="text-xs text-gray-400 block mb-2">Rotation</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={selectedElement.rotation ?? 0}
                        onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="text"
                        min="0"
                        max="360"
                        value={selectedElement.rotation ?? 0}
                        onChange={(e) => handleNumericChange('rotation', e.target.value)}
                        className="w-16 bg-gray-600 text-white text-sm rounded px-2 py-1 border border-gray-500"
                      />
                    </div>
                  </div>
                  
                  {/* Parent information */}
                  <div className="bg-gray-700 p-2 rounded">
                    <label className="text-xs text-gray-400 block mb-2">Hierarchy</label>
                    {selectedElement.parentId ? (
                      <div className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                        Child of {elements.find(el => el.id === selectedElement.parentId)?.type || 'Unknown'} 
                        (id: {selectedElement.parentId.split('-').pop()})
                      </div>
                    ) : (
                      <div className="text-xs text-gray-300">Root element (no parent)</div>
                    )}
                  </div>
                  
                  {/* Keyboard shortcuts help */}
                  <div className="bg-gray-700 p-2 rounded mt-2">
                    <p className="text-xs text-gray-300 font-semibold mb-2">Keyboard Shortcuts:</p>
                    <div className="text-xs text-gray-300 space-y-1">
                      <p className="mt-1 font-semibold border-b border-gray-600 pb-1">Movement:</p>
                      <p>⬅️➡️⬆️⬇️: Move element</p>
                      <p>Shift + Arrows: Move by 10px</p>
                      
                      <p className="mt-2 border-t border-gray-600 pt-1 font-semibold">Resizing:</p>
                      <p>Alt + ⬅️➡️: Adjust width</p>
                      <p>Alt + ⬆️⬇️: Adjust height</p>
                      <p>Shift + Alt + Arrows: Resize by 10px</p>
                      <p>R key or corner handles: Open size dialog</p>
                    </div>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => selectedElementId && removeElement(selectedElementId)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded-md text-sm mt-4"
                  >
                    Delete Element
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Select an element to edit its properties</p>
              )}
            </div>
          ) : (
            <ElementTree />
          )}
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-700">
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
            onClick={() => setShowCssGenerator(true)}
          >
            Generate CSS
          </button>
        </div>
      </div>
      
      {/* Render the CSS Generator Panel when showCssGenerator is true */}
      {showCssGenerator && <CSSGeneratorPanel />}
    </>
  );
};

export default Sidebar; 