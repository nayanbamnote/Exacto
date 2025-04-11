'use client'
import React, { useState } from 'react';
import { useElementStore } from '@/store/useElementStore';

interface CustomElementCreatorProps {
  onClose: () => void;
}

const CustomElementCreator: React.FC<CustomElementCreatorProps> = ({ onClose }) => {
  const { addElement } = useElementStore();
  
  // State for the new element
  const [name, setName] = useState('Custom Element');
  const [width, setWidth] = useState(150);
  const [height, setHeight] = useState(150);
  const [backgroundColor, setBackgroundColor] = useState('#e2e8f0');
  const [borderWidth, setBorderWidth] = useState(1);
  const [borderColor, setBorderColor] = useState('#cccccc');
  const [borderRadius, setBorderRadius] = useState(0);
  const [text, setText] = useState('');
  
  // Handle numeric input changes with better flexibility
  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    if (value === '' || value === '-') {
      // For empty input, set a temporary string value
      setter(0);
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        setter(numValue);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the custom element
    addElement({
      type: 'custom',
      x: 50,
      y: 50,
      width,
      height,
      content: text,
      rotation: 0,
      zIndex: 1,
      parentId: null,
      style: {
        backgroundColor,
        borderWidth: `${borderWidth}px`,
        borderStyle: 'solid',
        borderColor,
        borderRadius: `${borderRadius}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
      }
    });
    
    // Close the modal
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-white text-lg font-bold mb-4">Create Custom Element</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Element name */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">Element Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
            />
          </div>
          
          {/* Size controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Width (px)</label>
              <input
                type="text"
                value={width === 0 ? '' : width}
                onChange={(e) => handleNumericChange(setWidth, e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Height (px)</label>
              <input
                type="text"
                value={height === 0 ? '' : height}
                onChange={(e) => handleNumericChange(setHeight, e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
              />
            </div>
          </div>
          
          {/* Style controls */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">Background Color</label>
            <div className="flex">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-10 rounded overflow-hidden"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 ml-2 bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
              />
            </div>
          </div>
          
          {/* Border controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Border Width</label>
              <input
                type="text"
                value={borderWidth === 0 ? '' : borderWidth}
                onChange={(e) => handleNumericChange(setBorderWidth, e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Border Radius</label>
              <input
                type="text"
                value={borderRadius === 0 ? '' : borderRadius}
                onChange={(e) => handleNumericChange(setBorderRadius, e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm mb-1">Border Color</label>
            <div className="flex">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-10 h-10 rounded overflow-hidden"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="flex-1 ml-2 bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
              />
            </div>
          </div>
          
          {/* Text content */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">Text Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 h-20"
            />
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
            >
              Create Element
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomElementCreator; 