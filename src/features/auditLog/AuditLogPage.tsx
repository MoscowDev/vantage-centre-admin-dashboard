import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../../api/audit';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '../../components/ui/Table';
import { ShieldAlert, RefreshCw, ChevronLeft, ChevronRight, User, Calendar, Terminal } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['auditLogs', page],
    queryFn: () => fetchAuditLogs(page, pageSize),
    placeholderData: (prev) => prev,
  });

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return dateStr;
    }
  };

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-300">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface border border-border p-4 rounded-[8px]">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-warning shrink-0" />
          <span className="text-xs font-semibold text-muted leading-normal">
            Chronological read-only trail of geo-verification operations, trust computations, and deed signoffs.
          </span>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="w-full sm:w-auto p-2.5 border border-border bg-surface rounded-[8px] text-muted hover:bg-canvas transition-colors flex items-center justify-center"
          title="Refresh audit trails"
        >
          <RefreshCw className={`h-4.5 w-4.5 text-muted ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Audit Log list */}
      <div className="flex-1">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border rounded-[8px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mb-3"></div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Decoding archives...</p>
          </div>
        ) : isError ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border rounded-[8px] text-center p-6 space-y-4">
            <p className="text-sm font-bold text-danger">Audit Node Connection Broken</p>
            <p className="text-xs text-muted max-w-sm">Failed to connect securely. Verify agency cluster configuration.</p>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border rounded-[8px] text-center py-12">
            <ShieldAlert className="h-8 w-8 text-muted mb-2" />
            <p className="text-xs text-muted font-bold">No system audits recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* DESKTOP VIEW */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeadCell>Auditing Officer</TableHeadCell>
                    <TableHeadCell>Action Event</TableHeadCell>
                    <TableHeadCell>Deed Reference</TableHeadCell>
                    <TableHeadCell>Logged Time</TableHeadCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-bold text-ink">
                        <div className="flex flex-col">
                          <span>{log.adminName}</span>
                          <span className="text-[10px] text-muted font-bold mt-0.5">{log.adminEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-[10px] font-mono font-bold bg-canvas border border-border text-accent uppercase">
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-ink text-xs font-semibold leading-relaxed max-w-xs truncate" title={log.details}>
                        {log.details}
                      </TableCell>
                      <TableCell className="text-muted text-xs font-mono">
                        {formatTimestamp(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE VIEW */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {data.data.map((log) => (
                <div
                  key={log.id}
                  className="bg-surface border border-border p-5 rounded-[8px] space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-ink">{log.adminName}</h4>
                        <span className="text-[9px] text-muted font-semibold block mt-0.5">{log.adminEmail}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[9px] font-mono font-bold bg-canvas border border-border text-accent uppercase">
                      {log.action}
                    </span>
                  </div>

                  <div className="p-3.5 bg-canvas border border-border rounded-[8px] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted uppercase tracking-wide">
                      <Terminal className="h-3.5 w-3.5 text-muted" />
                      <span>Action Details</span>
                    </div>
                    <p className="text-[11px] text-ink leading-normal font-medium">{log.details}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-muted font-bold border-t border-border pt-3">
                    <Calendar className="h-4 w-4" />
                    <span>{formatTimestamp(log.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between bg-surface border border-border px-6 py-4 rounded-[8px]">
              <span className="text-xs font-semibold text-muted">
                Page <strong className="text-ink">{page}</strong> of{' '}
                <strong className="text-ink">{totalPages || 1}</strong> ({data.totalCount} entries)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  aria-label="Go to previous page"
                  disabled={page === 1}
                  className="p-2 bg-surface border border-border text-ink hover:bg-canvas rounded-[8px] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  aria-label="Go to next page"
                  disabled={page === totalPages || totalPages === 0}
                  className="p-2 bg-surface border border-border text-ink hover:bg-canvas rounded-[8px] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
