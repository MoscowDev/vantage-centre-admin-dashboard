import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const DashboardShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer open
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('mpva_sidebar_collapsed');
    return saved === 'true';
  });

  const toggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('mpva_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas text-ink relative">
      {/* Left Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navigation Bar */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Responsive Content Pane */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-8">
          <div className="w-full max-w-7xl mx-auto h-full flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
