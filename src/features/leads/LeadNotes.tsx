import React, { useState } from 'react';
import type { LeadNote } from '../../api/leads';
import { useAddLeadNote } from './useLeads';
import { useToast } from '../../components/ui/Toast';
import { MessageSquare } from 'lucide-react';

interface LeadNotesProps {
  leadId: string;
  notes: LeadNote[];
}

export const LeadNotes: React.FC<LeadNotesProps> = ({ leadId, notes }) => {
  const [content, setContent] = useState('');
  const addNoteMutation = useAddLeadNote();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await addNoteMutation.mutateAsync({ id: leadId, content: content.trim() });
      setContent('');
      showToast('Timeline note posted successfully', 'success');
    } catch (error) {
      console.error('Failed to add note:', error);
      showToast('Failed to add timeline note.', 'error');
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col bg-surface border border-border rounded-[8px] overflow-hidden">
      <div className="px-6 py-4 bg-canvas border-b border-border flex items-center gap-2">
        <MessageSquare className="h-4.5 w-4.5 text-accent" />
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Consultation History Log</h3>
      </div>

      {/* Vertical Timeline Area */}
      <div className="p-6 overflow-y-auto max-h-[360px] min-h-[180px]">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <MessageSquare className="h-8 w-8 text-muted mb-2" />
            <p className="text-xs text-muted font-bold">No consultation timeline history</p>
            <p className="text-[10px] text-muted mt-1">Start detailing interactions below.</p>
          </div>
        ) : (
          /* Simple vertical timeline using route/journey visual language */
          <div className="relative border-l border-border pl-6 ml-3 space-y-6">
            {[...notes]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((note, index) => {
                const isLatest = index === 0;
              return (
                <div key={note.id} className="relative space-y-1">
                  
                  {/* Timeline bullet dot */}
                  <div
                    className={`absolute top-1 left-[-29.5px] w-2.5 h-2.5 rounded-full border-2 border-white transition-colors duration-200 ${
                      isLatest ? 'bg-accent ring-4 ring-accent/10' : 'bg-muted/40'
                    }`}
                  />
                  
                  {/* Header info */}
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="font-bold text-ink">{note.authorName}</span>
                    <span className="text-muted font-bold">•</span>
                    <span className="text-muted font-semibold">{formatTimestamp(note.createdAt)}</span>
                  </div>

                  {/* Body text */}
                  <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap font-medium">
                    {note.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-canvas border-t border-border flex items-center gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Append advisor comments, visa file checks..."
          disabled={addNoteMutation.isPending}
          className="flex-1 bg-surface border border-border rounded-[8px] px-4 py-2 text-xs text-ink placeholder-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={!content.trim() || addNoteMutation.isPending}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-[8px] text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95"
        >
          {addNoteMutation.isPending ? (
            <span className="h-4 w-4 block animate-spin rounded-full border border-white border-t-transparent"></span>
          ) : (
            <span>Post note</span>
          )}
        </button>
      </form>
    </div>
  );
};
