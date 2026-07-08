import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AdminUser } from '../../api/auth';
import { useToast } from '../../components/ui/Toast';

// Form validation schema factory
const getAdminSchema = (isEdit: boolean) =>
  z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    role: z.enum(['STAFF', 'SUPER_ADMIN'] as const),
    password: z.string().optional().or(z.literal('')),
  }).superRefine((data, ctx) => {
    if (!isEdit && (!data.password || data.password.length < 6)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must be at least 6 characters',
        path: ['password'],
      });
    }
  });

interface FormValues {
  name: string;
  email: string;
  role: 'STAFF' | 'SUPER_ADMIN';
  password?: string;
}

interface AdminUserFormProps {
  userToEdit?: AdminUser | null;
  onSubmitSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
  onSave: (data: any) => Promise<void>;
}

export const AdminUserForm: React.FC<AdminUserFormProps> = ({
  userToEdit,
  onSubmitSuccess,
  onCancel,
  isPending,
  onSave,
}) => {
  const { showToast } = useToast();
  const isEditMode = !!userToEdit;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(getAdminSchema(isEditMode)),
    defaultValues: {
      name: userToEdit?.name || '',
      email: userToEdit?.email || '',
      role: userToEdit?.role || 'STAFF',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: any = {
        name: values.name,
        email: values.email,
        role: values.role,
      };
      
      if (values.password && values.password.trim().length >= 6) {
        payload.password = values.password;
      }

      await onSave(payload);
      showToast(
        isEditMode ? 'Officer credentials updated' : 'Surveyor account registered successfully',
        'success'
      );
      onSubmitSuccess();
    } catch (err: any) {
      console.error('Save admin user error:', err);
      const errMsg = err.response?.data?.message || 'Failed to update roster. Email may be already taken.';
      showToast(errMsg, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name */}
      <div className="space-y-1">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted">
          Officer Name
        </label>
        <input
          type="text"
          className={`w-full px-4 py-2.5 bg-surface border rounded-[8px] text-xs text-ink placeholder-muted focus:outline-none transition-all ${
            errors.name ? 'border-danger/40' : 'border-border'
          }`}
          placeholder="e.g. Babajide Inspector"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-[10px] text-danger font-bold">{errors.name.message}</p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-1">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted">
          Agency Email
        </label>
        <input
          type="email"
          className={`w-full px-4 py-2.5 bg-surface border rounded-[8px] text-xs text-ink placeholder-muted focus:outline-none transition-all ${
            errors.email ? 'border-danger/40' : 'border-border'
          }`}
          placeholder="username@mpva.gov"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-[10px] text-danger font-bold">{errors.email.message}</p>
        )}
      </div>

      {/* Role Selector */}
      <div className="space-y-1">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted">
          Agency Authority Role
        </label>
        <select
          className={`w-full px-4 py-2.5 bg-surface border border-border rounded-[8px] text-xs text-ink focus:outline-none transition-all ${
            errors.role ? 'border-danger/40' : 'border-border'
          }`}
          {...register('role')}
        >
          <option value="STAFF">Officer (Verification audits, inspections)</option>
          <option value="SUPER_ADMIN">System Admin (Full credential config rights)</option>
        </select>
        {errors.role && (
          <p className="text-[10px] text-danger font-bold">{errors.role.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted">
          {isEditMode ? 'Reset Password (Leave blank to preserve current)' : 'Security Password'}
        </label>
        <input
          type="password"
          className={`w-full px-4 py-2.5 bg-surface border rounded-[8px] text-xs text-ink placeholder-muted focus:outline-none transition-all ${
            errors.password ? 'border-danger/40' : 'border-border'
          }`}
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-[10px] text-danger font-bold">{errors.password.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 border border-border hover:bg-canvas rounded-[8px] text-xs font-bold text-muted transition-colors bg-surface"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded-[8px] transition-colors flex items-center gap-1.5 active:scale-[0.98]"
        >
          {isPending && (
            <span className="h-3.5 w-3.5 block animate-spin rounded-full border border-white border-t-transparent"></span>
          )}
          <span>{isEditMode ? 'Commit Changes' : 'Confirm Registration'}</span>
        </button>
      </div>
    </form>
  );
};
