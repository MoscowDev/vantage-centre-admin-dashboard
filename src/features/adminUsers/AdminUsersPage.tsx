import React, { useState } from 'react';
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useToggleAdminUserActive,
} from './useAdminUsers';
import type { AdminUser } from '../../api/auth';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { AdminUserForm } from './AdminUserForm';
import { Plus, ShieldAlert, RefreshCw, UserCheck, UserX, Edit2, Mail, Shield, X, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();
  
  // Queries & Mutations
  const { data: users, isLoading, isError, refetch, isFetching } = useAdminUsers();
  const createUserMutation = useCreateAdminUser();
  const updateUserMutation = useUpdateAdminUser();
  const toggleActiveMutation = useToggleAdminUserActive();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTargetUser, setConfirmTargetUser] = useState<AdminUser | null>(null);

  const handleOpenCreateForm = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (user: AdminUser) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleToggleClick = (user: AdminUser) => {
    setConfirmTargetUser(user);
    setIsConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmTargetUser) return;

    try {
      const nextStatus = !confirmTargetUser.isActive;
      await toggleActiveMutation.mutateAsync({
        id: confirmTargetUser.id,
        active: nextStatus,
      });

      showToast(
        `Account for ${confirmTargetUser.name} has been ${nextStatus ? 'activated' : 'suspended'}`,
        'success'
      );
    } catch (err) {
      console.error('Toggle status failed:', err);
      showToast('Failed to modify advisor account status.', 'error');
    } finally {
      setIsConfirmOpen(false);
      setConfirmTargetUser(null);
    }
  };

  const handleSaveUser = async (formData: any) => {
    if (selectedUser) {
      await updateUserMutation.mutateAsync({ id: selectedUser.id, data: formData });
    } else {
      await createUserMutation.mutateAsync(formData);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-300">
      
      {/* Informative action bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface border border-border p-4 rounded-[8px]">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-accent shrink-0" />
          <span className="text-xs font-semibold text-muted leading-normal">
            Configure system permissions, register executive advisors, and adjust credentials logs.
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="p-2.5 border border-border bg-surface rounded-[8px] text-muted hover:text-ink hover:bg-canvas transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`h-4.5 w-4.5 text-muted ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleOpenCreateForm}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-[8px] text-xs font-bold transition-colors shrink-0 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Register Officer</span>
          </button>
        </div>
      </div>

      {/* Directory Contents */}
      <div className="flex-1">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border rounded-[8px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mb-3"></div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Loading Officers Registry...</p>
          </div>
        ) : isError ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border rounded-[8px] text-center p-6 space-y-4">
            <p className="text-sm font-bold text-danger">Agency Registry Unreachable</p>
            <p className="text-xs text-muted max-w-sm">Failed to connect to authentication server directories.</p>
          </div>
        ) : !users || users.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border rounded-[8px] text-center py-12">
            <UserX className="h-8 w-8 text-muted mb-2" />
            <p className="text-xs text-muted font-bold">No registered officers found</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* DESKTOP VIEW */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeadCell>Advisor Name</TableHeadCell>
                    <TableHeadCell>Email Address</TableHeadCell>
                    <TableHeadCell>System Role</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                    <TableHeadCell className="text-right">Actions</TableHeadCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-bold text-ink">{user.name}</TableCell>
                      <TableCell className="font-medium text-muted">{user.email}</TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-muted">
                          {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-[4px]">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-650 bg-red-50 px-2 py-0.5 border border-red-100 rounded-[4px]">
                            <UserX className="h-3.5 w-3.5" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            onClick={() => handleOpenEditForm(user)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-ink transition-colors"
                          >
                            <Edit2 className="h-3 w-3 text-muted" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleClick(user)}
                            className={`text-xs font-bold transition-colors ${
                              user.isActive
                                ? 'text-red-600 hover:text-red-800'
                                : 'text-emerald-600 hover:text-emerald-800'
                            }`}
                          >
                            {user.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE VIEW */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-surface border border-border p-5 rounded-[8px] space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-ink">{user.name}</h4>
                      <span className="text-[10px] font-semibold text-muted mt-1 block">
                        {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}
                      </span>
                    </div>

                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-[4px]">
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 border border-red-100 rounded-[4px]">
                        <span>Suspended</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <Mail className="h-4 w-4 text-muted" />
                    <span>{user.email}</span>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border gap-3">
                    <button
                      onClick={() => handleOpenEditForm(user)}
                      className="inline-flex items-center justify-center gap-1 px-3.5 py-1.5 bg-surface border border-border rounded-[8px] text-[10px] font-bold text-ink hover:bg-canvas"
                    >
                      <Edit2 className="h-3 w-3 text-muted" />
                      <span>Edit Profile</span>
                    </button>
                    
                    <button
                      onClick={() => handleToggleClick(user)}
                      className={`px-3.5 py-1.5 text-[10px] font-bold rounded-[8px] border active:scale-95 transition-all ${
                        user.isActive
                          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100/50'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100/50'
                      }`}
                    >
                      {user.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* Forms & Dialog modals */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedUser ? 'Modify Officer Registry' : 'Register New Officer'}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-slate-800">
              {selectedUser ? 'Modify Officer Registry' : 'Register New Officer'}
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              aria-label="Close dialog"
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <AdminUserForm
            userToEdit={selectedUser}
            onCancel={() => setIsFormOpen(false)}
            onSubmitSuccess={() => setIsFormOpen(false)}
            isPending={createUserMutation.isPending || updateUserMutation.isPending}
            onSave={handleSaveUser}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={confirmTargetUser?.isActive ? 'Suspend Platform Access?' : 'Reactivate Platform Access?'}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              {confirmTargetUser?.isActive && <AlertTriangle className="h-5 w-5 text-red-600" />}
              <h3 className="text-sm font-bold text-slate-800">
                {confirmTargetUser?.isActive ? 'Suspend Platform Access?' : 'Reactivate Platform Access?'}
              </h3>
            </div>
            <button
              onClick={() => setIsConfirmOpen(false)}
              aria-label="Close dialog"
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-ink leading-relaxed">
            <p className="text-ink leading-normal">
              Confirm modification of platform credentials for{' '}
              <strong className="text-ink font-bold">{confirmTargetUser?.name}</strong> ({confirmTargetUser?.email})?
            </p>
            {confirmTargetUser?.isActive && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-[8px] flex items-start gap-2.5">
                <Shield className="h-4.5 w-4.5 text-danger shrink-0 mt-0.5" />
                <p className="text-[11px] text-danger leading-relaxed font-semibold">
                  Suspended officers will be barred from consultation registry updates immediately.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3 pt-3 border-t border-border mt-2">
            <button
              onClick={() => setIsConfirmOpen(false)}
              disabled={toggleActiveMutation.isPending}
              className="w-full sm:w-auto px-4 py-2 border border-border rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmToggle}
              disabled={toggleActiveMutation.isPending}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-1.5 disabled:opacity-65 active:scale-[0.98] ${
                confirmTargetUser?.isActive
                  ? 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500 shadow-sm'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent focus:ring-blue-500 shadow-sm'
              }`}
            >
              {toggleActiveMutation.isPending && (
                <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></span>
              )}
              <span>{confirmTargetUser?.isActive ? 'Confirm Suspension' : 'Confirm Activation'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
