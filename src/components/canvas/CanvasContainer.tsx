'use client'
import React, { useState, useEffect } from 'react';
import Canvas from './Canvas';
import CanvasControls from './CanvasControls';

const CanvasContainer: React.FC = () => {
  // Canvas settings
  const [canvasWidth, setCanvasWidth] = useState(1200);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [gridSize, setGridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(true);
  const [zoom, setZoom] = useState(1); // 1 = 100%

  // Handle preset selection
  const handlePresetSelect = (preset: { width: number; height: number; name: string }) => {
    setCanvasWidth(preset.width);
    setCanvasHeight(preset.height);
  };

  // Calculate the actual displayed size based on zoom
  const displayWidth = Math.round(canvasWidth * zoom);
  const displayHeight = Math.round(canvasHeight * zoom);

  // Apply zoom transform to the canvas wrapper
  const canvasStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
  };

  // Size the container to match the zoomed canvas size
  const containerStyle = {
    width: `${displayWidth}px`,
    height: `${displayHeight}px`,
    overflow: 'hidden',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Canvas Controls */}
      <CanvasControls
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        gridSize={gridSize}
        showGrid={showGrid}
        showRulers={showRulers}
        zoom={zoom}
        onWidthChange={setCanvasWidth}
        onHeightChange={setCanvasHeight}
        onGridSizeChange={setGridSize}
        onShowGridChange={setShowGrid}
        onShowRulersChange={setShowRulers}
        onZoomChange={setZoom}
        onPresetSelect={handlePresetSelect}
      />
      
      {/* Canvas Container with zoom handling */}
      <div 
        className="bg-gray-200 flex-1 flex items-center justify-center overflow-auto"
      >
        <div style={containerStyle} className="relative mx-auto my-auto border border-gray-400 shadow-md">
          <div style={canvasStyle}>
            <Canvas
              width={canvasWidth}
              height={canvasHeight}
              gridSize={gridSize}
              showGrid={showGrid}
              showRulers={showRulers}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasContainer; 