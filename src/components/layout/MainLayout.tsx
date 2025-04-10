'use client'
import React from 'react';
import Sidebar from './Sidebar';
import Workspace from './Workspace';

const MainLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <Workspace />
    </div>
  );
};

export default MainLayout; 