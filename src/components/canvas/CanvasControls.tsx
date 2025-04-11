import React from 'react';

interface CanvasControlsProps {
  canvasWidth: number;
  canvasHeight: number;
  gridSize: number;
  showGrid: boolean;
  showRulers: boolean;
  zoom: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onGridSizeChange: (size: number) => void;
  onShowGridChange: (show: boolean) => void;
  onShowRulersChange: (show: boolean) => void;
  onZoomChange: (zoom: number) => void;
  onPresetSelect: (preset: { width: number; height: number; name: string }) => void;
}

// Preset device sizes
const DEVICE_PRESETS = [
  { name: 'Desktop (1920×1080)', width: 1920, height: 1080 },
  { name: 'Laptop (1366×768)', width: 1366, height: 768 },
  { name: 'Tablet (768×1024)', width: 768, height: 1024 },
  { name: 'Mobile (375×667)', width: 375, height: 667 },
];

const CanvasControls: React.FC<CanvasControlsProps> = ({
  canvasWidth,
  canvasHeight,
  gridSize,
  showGrid,
  showRulers,
  zoom,
  onWidthChange,
  onHeightChange,
  onGridSizeChange,
  onShowGridChange,
  onShowRulersChange,
  onZoomChange,
  onPresetSelect,
}) => {
  // Handle device preset selection
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value);
    if (selectedIndex >= 0) {
      onPresetSelect(DEVICE_PRESETS[selectedIndex]);
    }
  };

  // Handle zoom level changes
  const handleZoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onZoomChange(parseInt(e.target.value) / 100);
  };

  // Handle custom dimension changes
  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    // Allow empty input temporarily
    if (value === '' || value === '-') {
      // We don't update the parent component for empty strings
      // This allows typing without forcing a number right away
      return;
    }
    
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      if (dimension === 'width') {
        onWidthChange(numValue > 0 ? numValue : 1);
      } else {
        onHeightChange(numValue > 0 ? numValue : 1);
      }
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex space-x-3">
        {/* Device Presets */}
        <div className="flex items-center">
          <select
            className="bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded text-sm"
            onChange={handlePresetChange}
            value={DEVICE_PRESETS.findIndex(
              preset => preset.width === canvasWidth && preset.height === canvasHeight
            )}
          >
            <option value="-1">Custom Size</option>
            {DEVICE_PRESETS.map((preset, index) => (
              <option key={preset.name} value={index}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Custom Dimensions */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="w-16 bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded text-sm"
            value={canvasWidth}
            onChange={(e) => handleDimensionChange('width', e.target.value)}
            onBlur={() => {
              // Ensure we have valid values on blur
              if (canvasWidth <= 0) onWidthChange(1);
            }}
          />
          <span className="text-gray-500 text-sm">×</span>
          <input
            type="text"
            className="w-16 bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded text-sm"
            value={canvasHeight}
            onChange={(e) => handleDimensionChange('height', e.target.value)}
            onBlur={() => {
              // Ensure we have valid values on blur
              if (canvasHeight <= 0) onHeightChange(1);
            }}
          />
        </div>
        
        {/* Grid and Rulers Toggles */}
        <div className="flex items-center bg-white border border-gray-300 rounded">
          <button
            className={`py-1 px-3 text-sm ${
              showGrid ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => onShowGridChange(!showGrid)}
          >
            Grid
          </button>
          <button
            className={`py-1 px-3 text-sm border-l border-gray-300 ${
              showRulers ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => onShowRulersChange(!showRulers)}
          >
            Rulers
          </button>
        </div>
        
        {/* Grid Size Control */}
        <div className="flex items-center">
          <label className="text-sm text-gray-500 mr-1">Grid:</label>
          <select
            className="bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded text-sm"
            value={gridSize}
            onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
          >
            <option value="5">5px</option>
            <option value="10">10px</option>
            <option value="20">20px</option>
            <option value="50">50px</option>
          </select>
        </div>
      </div>
      
      {/* Zoom Control */}
      <div className="flex items-center">
        <label className="text-sm text-gray-500 mr-1">Zoom:</label>
        <select
          className="bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded text-sm"
          value={zoom * 100}
          onChange={handleZoomChange}
        >
          <option value="25">25%</option>
          <option value="50">50%</option>
          <option value="75">75%</option>
          <option value="100">100%</option>
          <option value="150">150%</option>
          <option value="200">200%</option>
        </select>
      </div>
    </div>
  );
};

export default CanvasControls; 