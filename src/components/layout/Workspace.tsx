import React from 'react';
import CanvasContainer from '@/components/canvas/CanvasContainer';

const Workspace = () => {
  return (
    <div className="flex-1 bg-gray-100 h-screen overflow-hidden flex flex-col">
      <CanvasContainer />
    </div>
  );
};

export default Workspace; 