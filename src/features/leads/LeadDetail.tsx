import React from 'react';
import { X, User, Mail, Phone, Globe, Calendar, RefreshCw, GraduationCap } from 'lucide-react';
import { useLeadDetail, useUpdateLeadStatus } from './useLeads';
import { LeadJourneyRoute } from './LeadJourneyRoute';
import { LeadNotes } from './LeadNotes';
import { useToast } from '../../components/ui/Toast';
import type { LeadStatus } from '../../api/leads';
import { Modal } from '../../components/ui/Modal';

interface LeadDetailProps {
  leadId: string | null;
  onClose: () => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({ leadId, onClose }) => {
  const { showToast } = useToast();
  const { data: lead, isLoading, error, refetch } = useLeadDetail(leadId || undefined);
  const updateStatusMutation = useUpdateLeadStatus();

  if (!leadId) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    try {
      await updateStatusMutation.mutateAsync({ id: lead.id, status: newStatus });
      showToast(`Lead status transitioned to ${newStatus}`, 'success');
    } catch (err) {
      console.error('Failed to change status:', err);
      showToast('Status update failed.', 'error');
    }
  };

  return (
    <Modal isOpen={!!leadId} onClose={onClose} title="Student Profile Inquiry">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Student Profile Inquiry</h3>
            {lead && <p className="text-[10px] text-muted font-mono mt-0.5">Registry ID: {lead.id}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              aria-label="Refresh profile details"
              className="text-muted hover:text-ink transition-colors p-1.5 rounded-[8px] hover:bg-canvas"
              title="Refresh profile details"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close profile drawer"
              className="text-muted hover:text-ink transition-colors p-1.5 rounded-[8px] hover:bg-canvas"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mb-3"></div>
              <p className="text-xs text-muted font-medium">Fetching candidate profile...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-[8px] text-danger text-xs font-bold">
              Failed to load profile details. Please try again.
            </div>
          )}

          {lead && (
            <div className="space-y-6">
              {/* Profile Card Summary & Status Route Widget */}
              <div className="bg-canvas border border-border rounded-[8px] p-5 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-[8px] bg-accent/10 border border-accent/20 text-accent flex items-center justify-center font-bold text-lg shrink-0">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-ink truncate">{lead.name}</h4>
                    <p className="text-xs text-muted truncate mt-0.5">Study Destination: {lead.targetCountry}</p>
                  </div>
                </div>

                {/* Signature Element: Interactive Journey Route status picker */}
                <div className="pt-2 border-t border-border">
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-muted mb-3">
                    Progress Journey Checklist (Click node to transition)
                  </label>
                  <div className="px-2">
                    <LeadJourneyRoute
                      status={lead.status}
                      interactive={true}
                      onStatusSelect={handleStatusChange}
                    />
                  </div>
                </div>
              </div>

              {/* Core Information Details */}
              <div className="bg-surface border border-border rounded-[8px] p-6 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-border pb-2 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-accent" />
                  <span>STUDY PLAN DETAILS</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted" />
                    <div>
                      <p className="text-[9px] text-muted font-bold uppercase tracking-wider">Candidate Name</p>
                      <p className="text-xs font-bold text-ink mt-0.5">{lead.name}</p>
                    </div>
                  </div>

                  {/* Destination Country */}
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted" />
                    <div>
                      <p className="text-[9px] text-muted font-bold uppercase tracking-wider">Destination Country</p>
                      <p className="text-xs font-bold text-ink mt-0.5">{lead.targetCountry}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted" />
                    <div className="min-w-0">
                      <p className="text-[9px] text-muted font-bold uppercase tracking-wider">Contact Email</p>
                      <a href={`mailto:${lead.email}`} className="text-xs font-semibold text-accent hover:underline mt-0.5 block truncate">
                        {lead.email}
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted" />
                    <div>
                      <p className="text-[9px] text-muted font-bold uppercase tracking-wider">Contact Phone</p>
                      <a href={`tel:${lead.phone}`} className="text-xs font-semibold text-ink hover:text-accent hover:underline mt-0.5 block">
                        {lead.phone || 'Not provided'}
                      </a>
                    </div>
                  </div>

                  {/* Date Submitted */}
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Calendar className="h-4 w-4 text-muted" />
                    <div>
                      <p className="text-[9px] text-muted font-bold uppercase tracking-wider">Date Logged</p>
                      <p className="text-xs font-bold text-ink mt-0.5">{formatDate(lead.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Timeline Thread */}
              <LeadNotes leadId={lead.id} notes={lead.notes} />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
