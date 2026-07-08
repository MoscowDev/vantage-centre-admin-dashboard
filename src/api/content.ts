import { apiClient } from './client';

export interface RawContentBlockDTO {
  id: string;
  page: string;
  section_key: string;
  section_title: string;
  content_data: string; // JSON string of Record<string, any>
  field_labels: string; // JSON string of Record<string, string>
  field_types: string;  // JSON string of Record<string, 'text' | 'textarea' | 'media'>
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  page: string;
  sectionKey: string;
  sectionTitle: string;
  contentData: Record<string, any>;
  fieldLabels: Record<string, string>;
  fieldTypes: Record<string, 'text' | 'textarea' | 'media'>;
  updatedAt: string;
}

export const mapRawBlockToBlock = (raw: RawContentBlockDTO): ContentBlock => {
  let contentData = {};
  let fieldLabels = {};
  let fieldTypes = {};

  try {
    contentData = JSON.parse(raw.content_data);
  } catch (e) {
    console.error('Failed to parse content_data JSON', e);
  }

  try {
    fieldLabels = JSON.parse(raw.field_labels);
  } catch (e) {
    console.error('Failed to parse field_labels JSON', e);
  }

  try {
    fieldTypes = JSON.parse(raw.field_types);
  } catch (e) {
    console.error('Failed to parse field_types JSON', e);
  }

  return {
    id: raw.id,
    page: raw.page,
    sectionKey: raw.section_key,
    sectionTitle: raw.section_title,
    contentData,
    fieldLabels,
    fieldTypes: fieldTypes as Record<string, 'text' | 'textarea' | 'media'>,
    updatedAt: raw.updated_at,
  };
};

export const fetchContentBlocks = async (page?: string): Promise<ContentBlock[]> => {
  const url = page ? `/admin/content?page=${page}` : '/admin/content';
  const response = await apiClient.get<RawContentBlockDTO[]>(url);
  return response.data.map(mapRawBlockToBlock);
};

export const updateContentBlock = async (id: string, contentData: Record<string, any>): Promise<ContentBlock> => {
  const response = await apiClient.put<RawContentBlockDTO>(`/admin/content/${id}`, {
    content_data: JSON.stringify(contentData),
  });
  return mapRawBlockToBlock(response.data);
};
