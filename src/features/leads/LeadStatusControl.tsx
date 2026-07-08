import React from 'react';
import type { LeadStatus } from '../../api/leads';
import { useUpdateLeadStatus } from './useLeads';
import { useToast } from '../../components/ui/Toast';

interface LeadStatusControlProps {
  leadId: string;
  currentStatus: LeadStatus;
  size?: 'sm' | 'md';
}

export const LeadStatusControl: React.FC<LeadStatusControlProps> = ({ leadId, currentStatus, size = 'md' }) => {
  const updateStatusMutation = useUpdateLeadStatus();
  const { showToast } = useToast();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as LeadStatus;
    
    try {
      await updateStatusMutation.mutateAsync({ id: leadId, status: newStatus });
      showToast(`Lead status updated to ${newStatus}`, 'success');
    } catch (error: any) {
      console.error('Failed to update status:', error);
      showToast('Failed to update status. Please try again.', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Converted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'In Progress':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Contacted':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'Lost':
        return 'bg-danger/10 text-danger border-danger/20';
      case 'New':
      default:
        return 'bg-canvas text-muted border-border';
    }
  };

  return (
    <div className="relative inline-block">
      <select
        aria-label="Update lead status"
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={updateStatusMutation.isPending}
        className={`appearance-none border rounded-[8px] font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${getStatusColor(
          currentStatus
        )} ${
          size === 'sm'
            ? 'px-2.5 py-1 text-[10px] pr-6.5'
            : 'px-3.5 py-1.5 text-xs pr-8.5'
        }`}
      >
        <option value="New">New</option>
        <option value="Contacted">Contacted</option>
        <option value="In Progress">In Progress</option>
        <option value="Converted">Converted</option>
        <option value="Lost">Lost</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-muted">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
