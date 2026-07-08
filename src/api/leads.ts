import { apiClient } from './client';

export type LeadStatus = 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Draft' | 'New' | 'Contacted' | 'Converted' | 'Lost';

export interface RawNoteDTO {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
}

export interface LeadNote {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface RawLeadDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  target_country: string;
  status: string;
  created_at: string;
  notes?: RawNoteDTO[];
  valuation?: number;
  trust_score?: number;
  owner?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  targetCountry: string;
  status: LeadStatus;
  createdAt: string;
  notes: LeadNote[];
  valuation: number;
  trust_score: number;
  owner: string;
}

export interface PaginatedLeads {
  data: Lead[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LeadsFilterParams {
  status?: LeadStatus | '';
  targetCountry?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  search?: string;
}

// Decouple UI types from raw API payloads
export const mapRawNoteToLeadNote = (raw: RawNoteDTO): LeadNote => ({
  id: raw.id,
  content: raw.content || (raw as any).note || '',
  authorName: raw.author_name || (raw as any).authorName || ('Admin #' + ((raw as any).adminId || '')),
  createdAt: raw.created_at || (raw as any).createdAt || new Date().toISOString(),
});

export const mapRawLeadToLead = (raw: RawLeadDTO): Lead => ({
  id: raw.id,
  name: raw.name,
  email: raw.email,
  phone: raw.phone,
  targetCountry: raw.target_country || (raw as any).targetCountry || '',
  status: (raw.status || 'Pending') as LeadStatus,
  createdAt: raw.created_at || (raw as any).createdAt || new Date().toISOString(),
  notes: raw.notes ? raw.notes.map(mapRawNoteToLeadNote) : [],
  valuation: raw.valuation ?? 0,
  trust_score: raw.trust_score ?? 0,
  owner: raw.owner ?? 'Unknown',
});

export const fetchLeads = async (params: LeadsFilterParams): Promise<PaginatedLeads> => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.targetCountry) queryParams.append('targetCountry', params.targetCountry);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.page) queryParams.append('page', String(params.page));
  if (params.pageSize) queryParams.append('pageSize', String(params.pageSize));
  if (params.search) queryParams.append('search', params.search);

  const res = await apiClient.get<any>(`/admin/leads?${queryParams.toString()}`);
  return {
    data: (res.data.data || []).map(mapRawLeadToLead),
    totalCount: res.data.total ?? res.data.totalCount ?? 0,
    page: res.data.page ?? 1,
    pageSize: res.data.pageSize ?? 15,
    totalPages: res.data.totalPages ?? 1,
  };
};

export const fetchLeadById = async (id: string): Promise<Lead> => {
  const res = await apiClient.get<RawLeadDTO>(`/admin/leads/${id}`);
  return mapRawLeadToLead(res.data);
};

export const updateLeadStatus = async (id: string, status: LeadStatus): Promise<Lead> => {
  const res = await apiClient.patch<RawLeadDTO>(`/admin/leads/${id}/status`, { status });
  return mapRawLeadToLead(res.data);
};

export const addLeadNote = async (id: string, content: string): Promise<LeadNote> => {
  const res = await apiClient.post<RawNoteDTO>(`/admin/leads/${id}/notes`, { content });
  return mapRawNoteToLeadNote(res.data);
};

export const exportLeadsToCsv = async (params: Omit<LeadsFilterParams, 'page' | 'pageSize'>): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.targetCountry) queryParams.append('targetCountry', params.targetCountry);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.search) queryParams.append('search', params.search);

  const res = await apiClient.get<Blob>(`/admin/leads/export?${queryParams.toString()}`, {
    responseType: 'blob',
  });
  return res.data;
};
