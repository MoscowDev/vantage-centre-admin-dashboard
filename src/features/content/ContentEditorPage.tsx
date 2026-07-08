import React, { useState } from 'react';
import { useContentBlocks } from './useContentBlocks';
import { SectionEditor } from './SectionEditor';
import { LayoutGrid, AlertCircle, RefreshCw } from 'lucide-react';

interface ContentPageTab {
  id: string;
  name: string;
}

export const ContentEditorPage: React.FC = () => {
  const pages: ContentPageTab[] = [
    { id: 'home', name: 'Home' },
    { id: 'about', name: 'About' },
    { id: 'study-uk', name: 'Study UK' },
    { id: 'study-canada', name: 'Study Canada' },
    { id: 'study-australia', name: 'Study Australia' },
    { id: 'study-europe', name: 'Study Europe' },
  ];

  const [activePage, setActivePage] = useState<string>('home');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Fetch page content blocks via query
  const { data: blocks, isLoading, isError, refetch, isFetching } = useContentBlocks(activePage);

  React.useEffect(() => {
    if (blocks && blocks.length > 0) {
      setSelectedBlockId(blocks[0].id);
    } else {
      setSelectedBlockId(null);
    }
  }, [blocks, activePage]);

  const activeBlock = blocks?.find((b) => b.id === selectedBlockId) || null;

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-300">
      
      {/* Page Selector Tabs - Flat design, consistent 8px radii */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-[#E2E8F0] rounded-[8px] max-w-max shadow-xs">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={`px-4 py-2 text-xs font-bold rounded-[8px] transition-all ${
              activePage === page.id
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {page.name}
          </button>
        ))}
      </div>

      {/* Main layout: left sidebar for choosing block, right for editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Blocks checklist panel */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-[8px] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <LayoutGrid className="h-4 w-4 text-brand-500" />
              <span>Section Policies</span>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="text-slate-400 hover:text-slate-655 transition-colors p-1"
              title="Refresh sections list"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2">
            {isLoading ? (
              <div className="py-8 text-center space-y-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto"></div>
                <p className="text-[10px] text-slate-450 font-bold uppercase">Loading registry sections...</p>
              </div>
            ) : isError ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[8px] text-[11px] text-red-655 leading-normal font-semibold">
                Failed to retrieve policy blocks.
              </div>
            ) : !blocks || blocks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-bold">
                No editable guidelines configured.
              </div>
            ) : (
              blocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`w-full text-left px-4 py-3 rounded-[8px] text-xs font-bold transition-all border ${
                    selectedBlockId === block.id
                      ? 'bg-slate-50 border-[#E2E8F0] text-slate-800 shadow-xs'
                      : 'bg-white border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span>{block.sectionTitle}</span>
                    <span className="text-[9px] text-[#64748B] font-mono uppercase tracking-wider mt-0.5">
                      Key: {block.sectionKey}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Section editing workspace */}
        <div className="lg:col-span-8">
          {activeBlock ? (
            <SectionEditor block={activeBlock} />
          ) : (
            <div className="h-64 border border-dashed border-[#E2E8F0] bg-white rounded-[8px] flex flex-col items-center justify-center text-center p-6 shadow-xs">
              <AlertCircle className="h-8 w-8 text-slate-350 mb-2" />
              <p className="text-xs text-slate-500 font-bold">Select a section block from the index to start editing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
