import { apiClient } from './client';

export interface RawAuditLogDTO {
  id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  details: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  details: string;
  createdAt: string;
}

export const mapRawAuditLogToAuditLog = (raw: RawAuditLogDTO): AuditLog => ({
  id: raw.id,
  adminName: raw.admin_name,
  adminEmail: raw.admin_email,
  action: raw.action,
  details: raw.details,
  createdAt: raw.created_at,
});

export const fetchAuditLogs = async (page = 1, pageSize = 20): Promise<{ data: AuditLog[]; totalCount: number }> => {
  const response = await apiClient.get<{ data: RawAuditLogDTO[]; total: number }>(
    `/admin/audit-logs?page=${page}&pageSize=${pageSize}`
  );
  return {
    data: response.data.data.map(mapRawAuditLogToAuditLog),
    totalCount: response.data.total,
  };
};
