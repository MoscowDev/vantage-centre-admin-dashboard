import React, { useState, useEffect } from 'react';
import type { ContentBlock } from '../../api/content';
import { useUpdateContentBlock } from './useContentBlocks';
import { MediaUploadField } from './MediaUploadField';
import { useToast } from '../../components/ui/Toast';
import { Save, AlertCircle } from 'lucide-react';

interface SectionEditorProps {
  block: ContentBlock;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ block }) => {
  const { showToast } = useToast();
  const updateBlockMutation = useUpdateContentBlock();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData(block.contentData);
    setIsDirty(false);
  }, [block]);

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBlockMutation.mutateAsync({ id: block.id, contentData: formData });
      showToast(`${block.sectionTitle} saved successfully!`, 'success');
      setIsDirty(false);
    } catch (err: any) {
      console.error('Save content block failed:', err);
      showToast('Failed to save changes. Your current edits are preserved below.', 'error');
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-surface border border-border rounded-[8px] overflow-hidden animate-in fade-in duration-200">
      {/* Block Title Header */}
      <div className="px-6 py-4 bg-canvas border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">{block.sectionTitle}</h3>
          <p className="text-[9px] text-muted font-bold font-mono uppercase mt-0.5">
            Section: {block.sectionKey} | Page: {block.page}
          </p>
        </div>

        <span className="text-[10px] text-muted font-bold">
          Updated:{' '}
          {new Date(block.updatedAt).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* Inputs List */}
      <div className="p-6 space-y-5">
        {updateBlockMutation.isError && (
          <div className="flex items-start gap-2.5 p-3.5 bg-danger/10 border border-danger/20 rounded-[8px] text-danger text-xs">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-650" />
            <div>
              <p className="font-bold">Transmission Interrupted</p>
              <p className="mt-0.5 leading-relaxed text-red-700 font-medium">
                The connection to the Vantage policy nodes timed out. Retrying is recommended.
              </p>
            </div>
          </div>
        )}

        {Object.keys(block.contentData).map((key) => {
          const type = block.fieldTypes[key] || 'text';
          const label = block.fieldLabels[key] || key;
          const currentValue = formData[key] ?? '';

          if (type === 'media') {
            return (
              <MediaUploadField
                key={key}
                label={label}
                value={currentValue}
                onChange={(url) => handleFieldChange(key, url)}
              />
            );
          }

          if (type === 'textarea') {
            return (
              <div key={key} className="space-y-1.5">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted">
                  {label}
                </label>
                <textarea
                  value={currentValue}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-[8px] text-xs text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-y animate-none"
                  placeholder={`Enter content for ${label}...`}
                />
              </div>
            );
          }

          // Default text inputs
          return (
            <div key={key} className="space-y-1.5">
              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#64748B]">
                {label}
              </label>
              <input
                type="text"
                value={currentValue}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-[8px] text-xs text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all animate-none"
                placeholder={`Enter content for ${label}...`}
              />
            </div>
          );
        })}
      </div>

      {/* Editor Actions Footer */}
      <div className="px-6 py-4 bg-canvas border-t border-border flex items-center justify-between">
        <div>
          {isDirty && (
            <span className="text-[9px] font-bold tracking-wider uppercase text-amber-600 animate-pulse">
              UNSAVED CHANGES
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              type="button"
              onClick={() => {
                setFormData(block.contentData);
                setIsDirty(false);
                showToast('Changes discarded', 'info');
              }}
              className="px-4 py-2 border border-border hover:bg-canvas rounded-[8px] text-xs font-bold text-muted transition-colors bg-surface"
            >
              Discard
            </button>
          )}

          <button
            type="submit"
            disabled={!isDirty || updateBlockMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-[8px] text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {updateBlockMutation.isPending ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent"></span>
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{updateBlockMutation.isError ? 'Retry Save' : 'Save Section'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
