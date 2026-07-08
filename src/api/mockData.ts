import type { RawNoteDTO } from './leads';
import type { RawContentBlockDTO } from './content';
import type { RawAuditLogDTO } from './audit';

// Helper to generate mock study-abroad leads
const generateMockLeads = (): any[] => {
  const statuses = ['New', 'Contacted', 'In Progress', 'Converted', 'Lost'];
  const countries = ['United Kingdom', 'Canada', 'United States', 'Australia', 'Germany', 'Ireland', 'New Zealand'];
  const names = [
    'Amara Okafor', 'Chinedu Eze', 'Fatima Abubakar', 'Tunde Folawiyo',
    'Oluwaseun Adebayo', 'Chioma Nwachukwu', 'Babajide Sanwo', 'Yusuf Musa',
    'Zainab Bello', 'Efe Obada', 'Nkem Owoh', 'Somtochukwu Ani',
    'Olumide Makanjuola', 'Damilola Taylor', 'Kelechi Iheanacho', 'Simi Kosoko'
  ];

  const leads: any[] = [];
  let idCounter = 1000;

  for (let i = 0; i < 65; i++) {
    const name = names[i % names.length] + ' ' + (Math.floor(i / names.length) + 1);
    const country = countries[i % countries.length];
    const status = statuses[i % statuses.length];
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    leads.push({
      id: `lead_${idCounter++}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: `+234 ${703 + (i % 3)} 555 ${String(1000 + i).substring(1)}`,
      target_country: country,
      status,
      created_at: date.toISOString(),
      notes: [
        {
          id: `note_${i}_1`,
          content: `Inquiry submitted for undergraduate program study in ${country}. Student is preparing for IELTS exams.`,
          author_name: 'System Intake',
          created_at: new Date(date.getTime() + 60000).toISOString(),
        },
        i % 2 === 0 ? {
          id: `note_${i}_2`,
          content: `Contacted candidate. Discussed visa requirements, transcript submissions, and tuition estimates. Ready to begin application next week.`,
          author_name: 'Sarah Stafford',
          created_at: new Date(date.getTime() + 3600000).toISOString(),
        } : null
      ].filter(Boolean) as RawNoteDTO[],
    });
  }
  return leads;
};

export const mockLeads = generateMockLeads();

export const mockAdminUsers: any[] = [
  {
    id: 'user_1',
    name: 'Sarah Stafford',
    email: 'staff@vantage.com',
    role: 'STAFF',
    active: true,
  },
  {
    id: 'user_2',
    name: 'Andrew Admin',
    email: 'admin@vantage.com',
    role: 'SUPER_ADMIN',
    active: true,
  },
  {
    id: 'user_3',
    name: 'Jessica Jones',
    email: 'jessica@vantage.com',
    role: 'STAFF',
    active: false,
  }
];

export const mockContentBlocks: RawContentBlockDTO[] = [
  {
    id: 'cb_1',
    page: 'home',
    section_key: 'hero',
    section_title: 'Hero Section Notice',
    content_data: JSON.stringify({
      title: 'Vantage Center Global Education',
      subtitle: 'Premium advisory support for visa verification, course registration, and admissions.',
      mediaUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000',
    }),
    field_labels: JSON.stringify({
      title: 'Headline Title',
      subtitle: 'Overview Description',
      mediaUrl: 'Header Visual URL',
    }),
    field_types: JSON.stringify({
      title: 'text',
      subtitle: 'textarea',
      mediaUrl: 'media',
    }),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb_2',
    page: 'home',
    section_key: 'admissions',
    section_title: 'IELTS Preparation Rules',
    content_data: JSON.stringify({
      title: 'Required Score Criteria',
      undergradScore: 'Minimum IELTS Academic band of 6.0 overall.',
      postgradScore: 'Minimum IELTS Academic band of 6.5 overall.',
    }),
    field_labels: JSON.stringify({
      title: 'Section Title',
      undergradScore: 'Undergraduate Program Requirement',
      postgradScore: 'Postgraduate Program Requirement',
    }),
    field_types: JSON.stringify({
      title: 'text',
      undergradScore: 'text',
      postgradScore: 'text',
    }),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb_3',
    page: 'about',
    section_key: 'agency',
    section_title: 'About Our Mission',
    content_data: JSON.stringify({
      headline: 'Empowering Global Student Journeys',
      text: 'Vantage Center is dedicated to bridging the academic gap for prospective students seeking international exposure.',
    }),
    field_labels: JSON.stringify({
      headline: 'Corporate Mandate Headline',
      text: 'Mandate Description Body',
    }),
    field_types: JSON.stringify({
      headline: 'text',
      text: 'textarea',
    }),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb_4',
    page: 'study-uk',
    section_key: 'hero',
    section_title: 'UK Study Hero Section',
    content_data: JSON.stringify({
      title: 'Study in the United Kingdom',
      subtitle: 'Unlock world-class education and fast-tracked degree programs at historic UK institutions.',
      bannerUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000',
    }),
    field_labels: JSON.stringify({
      title: 'Headline Title',
      subtitle: 'Introduction Text',
      bannerUrl: 'Banner Image/Video',
    }),
    field_types: JSON.stringify({
      title: 'text',
      subtitle: 'textarea',
      bannerUrl: 'media',
    }),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb_5',
    page: 'study-uk',
    section_key: 'destination_cards',
    section_title: 'UK Visa & Route Checklist',
    content_data: JSON.stringify({
      visaRouteName: 'Student Route Visa (formerly Tier 4)',
      financialRequirement: 'Proof of funds covering tuition fee plus £1,334 per month (inside London) or £1,023 (outside London).',
    }),
    field_labels: JSON.stringify({
      visaRouteName: 'Visa Route Designation',
      financialRequirement: 'Maintenance / Fund Requirement Policy',
    }),
    field_types: JSON.stringify({
      visaRouteName: 'text',
      financialRequirement: 'textarea',
    }),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb_6',
    page: 'study-canada',
    section_key: 'hero',
    section_title: 'Canada Study Hero Section',
    content_data: JSON.stringify({
      title: 'Academic Futures in Canada',
      subtitle: 'Explore flexible post-graduation work opportunities and top-ranking research universities.',
      bannerUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1000',
    }),
    field_labels: JSON.stringify({
      title: 'Headline Title',
      subtitle: 'Introduction Text',
      bannerUrl: 'Banner Image/Video',
    }),
    field_types: JSON.stringify({
      title: 'text',
      subtitle: 'textarea',
      bannerUrl: 'media',
    }),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb_7',
    page: 'study-canada',
    section_key: 'destination_cards',
    section_title: 'Canada Study Permit Guidance',
    content_data: JSON.stringify({
      permitType: 'Study Permit & Provincial Attestation Letter (PAL)',
      gcaFund: 'Guaranteed Investment Certificate (GIC) requirement of $20,635 CAD.',
    }),
    field_labels: JSON.stringify({
      permitType: 'Study Permit Policy',
      gcaFund: 'Financial GIC Requirement',
    }),
    field_types: JSON.stringify({
      permitType: 'text',
      gcaFund: 'textarea',
    }),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb_8',
    page: 'study-australia',
    section_key: 'hero',
    section_title: 'Australia Study Hero Section',
    content_data: JSON.stringify({
      title: 'Study in Australia',
      subtitle: 'Experience vibrant campus life, world-leading coursework, and active post-study rights.',
      bannerUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1000',
    }),
    field_labels: JSON.stringify({
      title: 'Headline Title',
      subtitle: 'Introduction Text',
      bannerUrl: 'Banner Image/Video',
    }),
    field_types: JSON.stringify({
      title: 'text',
      subtitle: 'textarea',
      bannerUrl: 'media',
    }),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb_9',
    page: 'study-australia',
    section_key: 'destination_cards',
    section_title: 'Australia Subclass 500 Rules',
    content_data: JSON.stringify({
      visaType: 'Student Visa (Subclass 500)',
      englishLevel: 'Minimum IELTS score of 6.0 (or equivalent) for direct entry.',
    }),
    field_labels: JSON.stringify({
      visaType: 'Visa Category',
      englishLevel: 'English Proficiency Standard',
    }),
    field_types: JSON.stringify({
      visaType: 'text',
      englishLevel: 'text',
    }),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb_10',
    page: 'study-europe',
    section_key: 'hero',
    section_title: 'Europe Study Hero Section',
    content_data: JSON.stringify({
      title: 'Study in Continental Europe',
      subtitle: 'Access affordable or tuition-free academic paths across Germany, Ireland, France, and beyond.',
      bannerUrl: 'https://images.unsplash.com/photo-1485088478177-d55463b90037?q=80&w=1000',
    }),
    field_labels: JSON.stringify({
      title: 'Headline Title',
      subtitle: 'Introduction Text',
      bannerUrl: 'Banner Image/Video',
    }),
    field_types: JSON.stringify({
      title: 'text',
      subtitle: 'textarea',
      bannerUrl: 'media',
    }),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb_11',
    page: 'study-europe',
    section_key: 'destination_cards',
    section_title: 'Europe Schengen Study Visa',
    content_data: JSON.stringify({
      schengenRule: 'National Long-Stay Visa (D-Type) for academic semesters.',
      blockedAccount: 'German Blocked Account (Sperrkonto) requirement of €11,904 per year.',
    }),
    field_labels: JSON.stringify({
      schengenRule: 'Schengen Visa Category',
      blockedAccount: 'Financial Account Block System',
    }),
    field_types: JSON.stringify({
      schengenRule: 'text',
      blockedAccount: 'textarea',
    }),
    updated_at: new Date().toISOString(),
  }
];

export const mockAuditLogs: RawAuditLogDTO[] = [
  {
    id: 'audit_1',
    admin_name: 'Andrew Admin',
    admin_email: 'admin@vantage.com',
    action: 'LEAD_STATUS_CHANGED',
    details: 'Changed status of lead_1001 (Amara Okafor) to In Progress.',
    created_at: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'audit_2',
    admin_name: 'Andrew Admin',
    admin_email: 'admin@vantage.com',
    action: 'CONTENT_BLOCK_UPDATED',
    details: 'Modified Home Page Hero guidelines block values.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'audit_3',
    admin_name: 'Sarah Stafford',
    admin_email: 'staff@vantage.com',
    action: 'LEAD_NOTE_POSTED',
    details: 'Appended follow-up advisor response note for lead_1005.',
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'audit_4',
    admin_name: 'Andrew Admin',
    admin_email: 'admin@vantage.com',
    action: 'USER_DEACTIVATE',
    details: 'Suspended advisor access credentials: Jessica Jones.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  }
];
