'use client'
import React, { useState } from 'react';
import { useElementStore } from '@/store/useElementStore';
import CustomElementCreator from './CustomElementCreator';

// Define preset element options 
export const elementPresets = [
  {
    type: 'div',
    name: 'Container',
    icon: '🔲',
    defaultWidth: 200,
    defaultHeight: 200,
    style: {
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
    }
  },
  {
    type: 'button',
    name: 'Button',
    icon: '🔘',
    defaultWidth: 120,
    defaultHeight: 40,
    content: 'Button',
    style: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      borderRadius: '4px',
      border: 'none',
      // These flex properties are for editor display only and will be filtered out in CSS generation
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontWeight: 'bold',
    }
  },
  {
    type: 'text',
    name: 'Text',
    icon: '📝',
    defaultWidth: 150,
    defaultHeight: 24,
    content: 'Text element',
    style: {
      fontFamily: 'sans-serif',
      color: '#333333',
    }
  },
  {
    type: 'image',
    name: 'Image',
    icon: '🖼️',
    defaultWidth: 150,
    defaultHeight: 150,
    style: {
      backgroundColor: '#e2e8f0',
      // These flex properties are for editor display only and will be filtered out in CSS generation
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: '#94a3b8',
    },
    content: '📷'
  },
  {
    type: 'input',
    name: 'Input',
    icon: '✏️',
    defaultWidth: 200,
    defaultHeight: 40,
    style: {
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '8px 12px',
    },
    content: 'Input field'
  }
];

const ElementLibrary: React.FC = () => {
  const { addElement } = useElementStore();
  const [showCustomCreator, setShowCustomCreator] = useState(false);

  const handleAddElement = (preset: typeof elementPresets[0]) => {
    addElement({
      type: preset.type,
      x: 50,
      y: 50,
      width: preset.defaultWidth,
      height: preset.defaultHeight,
      content: preset.content || '',
      style: preset.style || {},
      rotation: 0,
      zIndex: 1,
      parentId: null
    });
  };

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
        Element Library
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {elementPresets.map((preset) => (
          <button
            key={preset.type}
            className="flex flex-col items-center justify-center p-3 border border-gray-600 rounded hover:bg-gray-700 transition"
            onClick={() => handleAddElement(preset)}
          >
            <div className="text-xl mb-1">{preset.icon}</div>
            <div className="text-xs">{preset.name}</div>
          </button>
        ))}
      </div>
      <div className="border-t border-gray-700 pt-3 mt-3">
        <button 
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm"
          onClick={() => setShowCustomCreator(true)}
        >
          Custom Element
        </button>
      </div>
      
      {/* Custom Element Creator Modal */}
      {showCustomCreator && (
        <CustomElementCreator onClose={() => setShowCustomCreator(false)} />
      )}
    </div>
  );
};

export default ElementLibrary; 