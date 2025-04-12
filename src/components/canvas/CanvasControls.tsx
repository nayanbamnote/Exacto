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

// Default device presets
const DEVICE_PRESETS = [
  { width: 1200, height: 800, name: 'Desktop' },
  { width: 768, height: 1024, name: 'Tablet Portrait' },
  { width: 1024, height: 768, name: 'Tablet Landscape' },
  { width: 375, height: 667, name: 'Mobile Portrait' },
  { width: 667, height: 375, name: 'Mobile Landscape' },
  { width: 1920, height: 1080, name: 'HD' },
  { width: 1280, height: 720, name: 'HD Small' },
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
  // Handle dimension changes
  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      if (dimension === 'width') {
        onWidthChange(numValue);
      } else {
        onHeightChange(numValue);
      }
    }
  };

  // Handle preset selection
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    if (index >= 0 && index < DEVICE_PRESETS.length) {
      onPresetSelect(DEVICE_PRESETS[index]);
    }
  };

  // Handle zoom change
  const handleZoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoomPercent = parseInt(e.target.value);
    if (!isNaN(zoomPercent) && zoomPercent > 0) {
      onZoomChange(zoomPercent / 100);
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