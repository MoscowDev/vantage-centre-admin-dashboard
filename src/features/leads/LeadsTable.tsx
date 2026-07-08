import React, { useState } from 'react';
import { useLeads } from './useLeads';
import type { LeadsFilterParams, LeadStatus } from '../../api/leads';
import { exportLeadsToCsv } from '../../api/leads';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '../../components/ui/Table';
import { LeadJourneyRoute } from './LeadJourneyRoute';
import { LeadDetail } from './LeadDetail';
import { useToast } from '../../components/ui/Toast';
import {
  Download,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Globe,
} from 'lucide-react';

export const LeadsTable: React.FC = () => {
  const { showToast } = useToast();
  
  // State for search and filters
  const [filters, setFilters] = useState<LeadsFilterParams>({
    status: '',
    targetCountry: '',
    startDate: '',
    endDate: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    pageSize: 15,
    search: '',
  });

  const [searchText, setSearchText] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Fetch leads
  const { data, isLoading, isError, refetch, isFetching } = useLeads(filters);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchText, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchText('');
    setFilters({
      status: '',
      targetCountry: '',
      startDate: '',
      endDate: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
      pageSize: 15,
      search: '',
    });
  };

  const handleSort = (field: string) => {
    setFilters((prev) => {
      const isAsc = prev.sortBy === field && prev.sortOrder === 'asc';
      return {
        ...prev,
        sortBy: field,
        sortOrder: isAsc ? 'desc' : 'asc',
        page: 1,
      };
    });
  };

  const handleExportCsv = async () => {
    try {
      showToast('Preparing CSV export...', 'info');
      const { page, pageSize, ...exportParams } = filters;
      const csvBlob = await exportLeadsToCsv(exportParams);
      
      const url = window.URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vantage-leads-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast('CSV downloaded successfully!', 'success');
    } catch (err) {
      console.error('CSV Export failed:', err);
      showToast('Failed to export registry. Please try again.', 'error');
    }
  };

  const countries = ['United Kingdom', 'Canada', 'United States', 'Australia', 'Germany', 'Ireland', 'New Zealand'];

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-300">
      
      {/* Top search & quick actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface border border-border p-4 rounded-[8px]">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search name, email, target country..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border focus:border-accent focus:ring-2 focus:ring-accent/10 rounded-[8px] text-xs text-ink placeholder-muted focus:outline-none transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="p-2.5 border border-border bg-surface rounded-[8px] text-muted hover:text-ink hover:bg-canvas disabled:opacity-50 transition-all active:scale-95"
            title="Refresh database"
          >
            <RefreshCw className={`h-4.5 w-4.5 text-muted ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleExportCsv}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-surface border border-border text-ink hover:bg-canvas rounded-[8px] text-xs font-bold transition-all active:scale-[0.98]"
          >
            <Download className="h-4 w-4 text-muted" />
            <span>Export CSV Leads</span>
          </button>
        </div>
      </div>

      {/* Advanced filters */}
      <div className="bg-surface border border-border p-5 rounded-[8px] space-y-4">
        <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase tracking-wider">
          <SlidersHorizontal className="h-4 w-4 text-accent" />
          <span>Filter Registry Leads</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted">
              Admission Status
            </label>
            <select
              aria-label="Filter by lead status"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as LeadStatus | '', page: 1 }))}
              className="w-full px-3 py-2 bg-surface border border-border rounded-[8px] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted">
              Target Country
            </label>
            <select
              aria-label="Filter by target country"
              value={filters.targetCountry}
              onChange={(e) => setFilters((prev) => ({ ...prev, targetCountry: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 bg-surface border border-border rounded-[8px] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted">
              Date Submitted (From)
            </label>
            <input
              aria-label="Filter by start date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 bg-surface border border-border rounded-[8px] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted">
              Date Submitted (To)
            </label>
            <input
              aria-label="Filter by end date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 bg-surface border border-border rounded-[8px] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all"
            />
          </div>
        </div>

        {/* Reset Trigger */}
        {(filters.status || filters.targetCountry || filters.startDate || filters.endDate || filters.search) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-bold text-muted hover:text-accent transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Leads Registry */}
      <div className="flex-1 min-h-[300px]">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border rounded-[8px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mb-3"></div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Syncing database entries...</p>
          </div>
        ) : isError ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border rounded-[8px] text-center p-6 space-y-4">
            <p className="text-sm font-bold text-danger">Leads Registry Off-line</p>
            <p className="text-xs text-muted max-w-sm">Unable to securely fetch student files. Ensure the Vantage API node is responsive.</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded-[8px] transition-all">
              Reconnect Server
            </button>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center bg-surface border border-border rounded-[8px] text-center p-8 space-y-2">
            <Filter className="h-8 w-8 text-muted" />
            <p className="text-xs text-muted font-bold">No candidate profiles match the criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* DESKTOP VIEW */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeadCell className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1.5">
                        <span>Student Candidate</span>
                        <ArrowUpDown className="h-3 w-3 text-[#64748B]" />
                      </div>
                    </TableHeadCell>
                    <TableHeadCell>Email Address</TableHeadCell>
                    <TableHeadCell>Phone Contact</TableHeadCell>
                    <TableHeadCell className="cursor-pointer select-none" onClick={() => handleSort('target_country')}>
                      <div className="flex items-center gap-1.5">
                        <span>Destination country</span>
                        <ArrowUpDown className="h-3 w-3 text-[#64748B]" />
                      </div>
                    </TableHeadCell>
                    <TableHeadCell className="w-36">Journey Status</TableHeadCell>
                    <TableHeadCell className="text-right">Action</TableHeadCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((lead: any) => (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedLeadId(lead.id)}
                    >
                      <TableCell className="font-bold text-ink">
                        <div className="flex flex-col">
                          <span>{lead.name}</span>
                          <span className="text-[9px] text-muted font-bold font-mono uppercase mt-0.5">{lead.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-muted">{lead.email}</TableCell>
                      <TableCell className="font-medium text-muted">{lead.phone || 'N/A'}</TableCell>
                      <TableCell className="font-bold text-ink">
                        <span className="inline-flex items-center gap-1 text-muted">
                          <Globe className="h-3.5 w-3.5 text-muted" />
                          <span>{lead.targetCountry}</span>
                        </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="w-28 py-1">
                          <LeadJourneyRoute status={lead.status} />
                          <div className="text-[9px] text-muted font-bold text-center mt-1">
                            {lead.status}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="text-xs font-bold text-accent hover:text-accent/80 transition-colors"
                        >
                          Details
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE VIEW */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {data.data.map((lead: any) => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className="bg-surface border border-border p-5 rounded-[8px] space-y-4 active:bg-canvas transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-ink">{lead.name}</h4>
                      <span className="text-[10px] text-muted font-mono mt-1 block">{lead.id}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-canvas border border-border px-2 py-0.5 rounded-[4px] text-muted">
                      <Globe className="h-3 w-3 text-muted" />
                      <span>{lead.targetCountry}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[11px] border-t border-b border-border py-3">
                    <div className="space-y-0.5">
                      <span className="block text-muted font-bold uppercase text-[9px] tracking-wider">Email</span>
                      <span className="font-bold text-ink truncate block">{lead.email}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-muted font-bold uppercase text-[9px] tracking-wider">Phone</span>
                      <span className="font-bold text-ink block">{lead.phone || 'N/A'}</span>
                    </div>
                    <div className="space-y-0.5 col-span-2">
                      <span className="block text-muted font-bold uppercase text-[9px] tracking-wider">Submitted On</span>
                      <span className="font-bold text-ink block">
                        {new Date(lead.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
                    <div className="w-28 py-1">
                      <LeadJourneyRoute status={lead.status} />
                      <div className="text-[9px] text-[#64748B] font-bold text-center mt-1">
                        {lead.status}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="px-3.5 py-1.5 bg-surface border border-border text-[10px] font-bold text-ink hover:bg-canvas rounded-[8px] transition-all"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface border border-border px-6 py-4 rounded-[8px]">
              <span className="text-xs font-semibold text-muted text-center sm:text-left">
                Page <strong className="text-ink">{filters.page}</strong> of{' '}
                <strong className="text-ink">{data.totalPages || 1}</strong> ({data.totalCount} lead entries)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                  aria-label="Go to previous page"
                  disabled={filters.page === 1}
                  className="p-2 bg-surface border border-border text-muted hover:bg-canvas rounded-[8px] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: Math.min(data.totalPages, (prev.page || 1) + 1) }))
                  }
                  aria-label="Go to next page"
                  disabled={filters.page === data.totalPages || data.totalPages === 0}
                  className="p-2 bg-surface border border-border text-muted hover:bg-canvas rounded-[8px] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Drawer */}
      {selectedLeadId && (
        <LeadDetail leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
      )}
    </div>
  );
};
