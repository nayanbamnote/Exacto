'use client'
import React from 'react';

interface SizeDialogProps {
  tempSize: { width: number; height: number };
  setTempSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
  setShowSizeDialog: React.Dispatch<React.SetStateAction<boolean>>;
  applySize: () => void;
  gridSize: number;
}

const SizeDialog: React.FC<SizeDialogProps> = ({
  tempSize,
  setTempSize,
  setShowSizeDialog,
  applySize,
  gridSize
}) => {
  return (
    <div 
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-4 rounded-md shadow-lg border border-gray-700 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-white text-sm font-semibold mb-3">Resize Element</h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-white text-xs">Width:</label>
          <input 
            type="text" 
            min={gridSize}
            value={tempSize.width === 0 ? '' : tempSize.width} 
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || value === '-') {
                setTempSize({...tempSize, width: 0});
              } else {
                const numValue = parseInt(value);
                if (!isNaN(numValue)) {
                  setTempSize({...tempSize, width: numValue});
                }
              }
            }}
            className="w-20 bg-gray-700 text-white border border-gray-600 px-2 py-1 rounded"
          />
          <span className="text-gray-400 text-xs">px</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-white text-xs">Height:</label>
          <input 
            type="text" 
            min={gridSize}
            value={tempSize.height === 0 ? '' : tempSize.height} 
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || value === '-') {
                setTempSize({...tempSize, height: 0});
              } else {
                const numValue = parseInt(value);
                if (!isNaN(numValue)) {
                  setTempSize({...tempSize, height: numValue});
                }
              }
            }}
            className="w-20 bg-gray-700 text-white border border-gray-600 px-2 py-1 rounded"
          />
          <span className="text-gray-400 text-xs">px</span>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button 
            onClick={() => setShowSizeDialog(false)}
            className="bg-gray-700 text-white px-2 py-1 text-xs rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button 
            onClick={applySize}
            className="bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-500"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SizeDialog; 