import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardShell } from '../components/layout/DashboardShell';

// Features / Screens
import { LoginPage } from '../features/auth/LoginPage';
import { LeadsTable } from '../features/leads/LeadsTable';
import { ContentEditorPage } from '../features/content/ContentEditorPage';
import { AdminUsersPage } from '../features/adminUsers/AdminUsersPage';
import { AuditLogPage } from '../features/auditLog/AuditLogPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Dashboard Core Area */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardShell />}>
            {/* Redirect root path to leads board */}
            <Route path="/" element={<Navigate to="/leads" replace />} />
            
            {/* Leads Dashboard (Accessible by STAFF & SUPER_ADMIN) */}
            <Route path="/leads" element={<LeadsTable />} />

            {/* Page Content Editor (Accessible by STAFF & SUPER_ADMIN) */}
            <Route path="/content" element={<ContentEditorPage />} />

            {/* Admin Management Panel (SUPER_ADMIN only) */}
            <Route element={<ProtectedRoute requiredRole="SUPER_ADMIN" />}>
              <Route path="/admins" element={<AdminUsersPage />} />
              <Route path="/audit" element={<AuditLogPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all unknown routes redirect to login/leads */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
