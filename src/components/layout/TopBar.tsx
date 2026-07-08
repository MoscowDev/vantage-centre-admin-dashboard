import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import { useLocation } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  // Mapping from route to Vantage Center user-friendly page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/leads')) return 'Leads Directory';
    if (path.startsWith('/content')) return 'Page Blocks Editor';
    if (path.startsWith('/admins')) return 'Admin Management';
    if (path.startsWith('/audit')) return 'Security Trails';
    return 'Portal Dashboard';
  };

  const getRoleLabel = () => {
    return user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff';
  };

  return (
    <header className="min-h-16 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-3 px-3 sm:px-6 lg:px-8 py-3 shrink-0 relative z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="lg:hidden p-2 text-muted hover:text-ink hover:bg-canvas rounded-[8px] transition-all active:scale-95"
          title="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h2 className="text-xs sm:text-sm font-bold text-ink tracking-tight truncate">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {user && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted font-medium min-w-0">
            <span className="truncate">{user.name}</span>
            <span className="text-[10px] text-muted font-bold opacity-60">
              ({getRoleLabel()})
            </span>
          </div>
        )}

        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 rounded-[8px] text-[10px] sm:text-xs font-bold text-ink bg-surface border border-border hover:bg-canvas hover:text-ink transition-all active:scale-[0.98]"
          title="Sign out of Vantage Portal"
        >
          <LogOut className="h-3.5 w-3.5 text-muted" />
          <span className="hidden xs:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
};
