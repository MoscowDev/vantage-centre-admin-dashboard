import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  FileText,
  Activity,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const navItems = [
    {
      to: '/leads',
      label: 'Leads Directory',
      icon: GraduationCap,
      show: true,
    },
    {
      to: '/content',
      label: 'Page Blocks Editor',
      icon: FileText,
      show: true,
    },
    {
      to: '/admins',
      label: 'Admin Management',
      icon: Users,
      show: isSuperAdmin,
    },
    {
      to: '/audit',
      label: 'Security Trails',
      icon: Activity,
      show: isSuperAdmin,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-35 bg-slate-950/40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Collapsible Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-ink flex flex-col shrink-0 h-full text-slate-300 border-r border-border transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 w-[85vw] max-w-72 sm:w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border bg-[#101825] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-[8px] bg-accent flex items-center justify-center shrink-0">
              <GraduationCap className="h-5.5 w-5.5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-200">
                <h1 className="text-xs font-bold text-white tracking-wider uppercase leading-none">Vantage Center</h1>
                <span className="text-[9px] text-muted font-bold uppercase tracking-widest leading-none mt-1 block">
                  Portal Management
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-[8px] transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-3.5 text-xs font-bold transition-all relative group ${
                      isActive
                        ? 'border-l-2 border-accent bg-accent/10 text-white'
                        : 'text-muted hover:text-slate-200 hover:bg-white/5 border-l-2 border-transparent'
                    } ${isCollapsed ? 'justify-center border-l-0 px-0' : ''}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
        </nav>

        {/* Sidebar Collapse Controller at Bottom */}
        <div className="hidden lg:block px-3 py-2 border-t border-border bg-[#101825]/40 shrink-0">
          <button
            onClick={onToggleCollapse}
            className="w-full py-2 rounded-[8px] text-muted hover:text-white hover:bg-white/5 flex items-center justify-center transition-all"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* User Info Block */}
        <div className="p-4 border-t border-border bg-[#101825]/40 shrink-0">
          <div className={`flex items-center gap-3 p-2 bg-[#101825]/70 rounded-[8px] border border-border/60 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="h-9 w-9 rounded-[8px] bg-white/10 border border-white/10 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 transition-opacity duration-200">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.name}
                </p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[8px] font-black tracking-wide uppercase bg-slate-800 border border-slate-700 text-slate-400 mt-1">
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
