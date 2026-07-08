import axios from 'axios';
import { mockLeads, mockAdminUsers, mockContentBlocks, mockAuditLogs } from './mockData';
import { API_BASE_URL, USE_MOCK_DATA } from '../config/env';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vantage_admin_jwt');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('vantage_admin_jwt');
      localStorage.removeItem('vantage_admin_user');
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// MOCK ADAPTER INTERCEPTOR
// Intercepts requests and simulates Spring Boot API responses when USE_MOCK_DATA is true.
// Enabled by default so the application runs immediately without requiring local backend startup.
apiClient.interceptors.request.use(async (config) => {
  const useMock = USE_MOCK_DATA;
  if (!useMock) return config;

  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  const getRequestData = (data: any) => {
    if (!data) return {};
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return {};
      }
    }
    return data;
  };

  // Helper to simulate network latency (100-300ms)
  await new Promise((resolve) => setTimeout(resolve, 200));

  // --- 1. LOGIN MOCK ---
  if (url.includes('/admin/auth/login') && method === 'post') {
    const { email, password } = getRequestData(config.data);
    const user = mockAdminUsers.find((u) => u.email === email);
    
    if (user && user.active && password && password.length >= 6) {
      const mockToken = 'mock_jwt_token_for_' + user.role;
      return Promise.reject({
        config,
        request: {},
        response: {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data: {
            token: mockToken,
            user: { ...user },
          },
        },
      });
    } else {
      return Promise.reject({
        config,
        request: {},
        response: {
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
          data: { message: 'Invalid credentials or inactive account.' },
        },
      });
    }
  }

  // --- 2. LEADS DIRECTORY MOCK ---
  if (url.includes('/admin/leads') && method === 'get') {
    // Check if it's the export CSV path
    if (url.includes('/admin/leads/export')) {
      const csvContent = "ID,Name,Email,Phone,Target Country,Status,Submitted On\n" +
        mockLeads.map(l => `"${l.id}","${l.name}","${l.email}","${l.phone}","${l.target_country}","${l.status}","${l.created_at}"`).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv' });
      return Promise.reject({
        config,
        response: {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data: blob,
        }
      });
    }

    // Lead Detail query by ID
    const leadDetailMatch = url.match(/\/admin\/leads\/([a-zA-Z0-9_]+)$/);
    if (leadDetailMatch) {
      const id = leadDetailMatch[1];
      const lead = mockLeads.find((l) => l.id === id);
      if (lead) {
        return Promise.reject({
          config,
          response: { status: 200, statusText: 'OK', headers: {}, config, data: { ...lead } },
        });
      } else {
        return Promise.reject({
          config,
          response: { status: 404, statusText: 'Not Found', headers: {}, config, data: { message: 'Lead not found' } },
        });
      }
    }

    // Filtering, sorting and paging parameters
    const urlParams = new URL(url, 'http://localhost');
    const statusFilter = urlParams.searchParams.get('status');
    const countryFilter = urlParams.searchParams.get('targetCountry');
    const startDate = urlParams.searchParams.get('startDate');
    const endDate = urlParams.searchParams.get('endDate');
    const search = urlParams.searchParams.get('search')?.toLowerCase() || '';
    const sortBy = urlParams.searchParams.get('sortBy') || 'created_at';
    const sortOrder = urlParams.searchParams.get('sortOrder') || 'desc';
    const page = parseInt(urlParams.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(urlParams.searchParams.get('pageSize') || '15', 10);

    let filtered = [...mockLeads];

    if (statusFilter) {
      filtered = filtered.filter((l) => l.status === statusFilter);
    }
    if (countryFilter) {
      filtered = filtered.filter((l) => l.target_country === countryFilter);
    }
    if (startDate) {
      filtered = filtered.filter((l) => new Date(l.created_at) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter((l) => new Date(l.created_at) <= new Date(endDate + 'T23:59:59'));
    }
    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          l.email.toLowerCase().includes(search) ||
          l.phone.includes(search) ||
          l.target_country.toLowerCase().includes(search)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy === 'target_country' ? 'target_country' : sortBy] || '';
      let bVal = b[sortBy === 'target_country' ? 'target_country' : sortBy] || '';
      
      if (sortBy === 'created_at') {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedData = filtered.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.ceil(total / pageSize);

    return Promise.reject({
      config,
      response: {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: {
          data: paginatedData,
          total,
          page,
          pageSize,
          totalPages,
        },
      },
    });
  }

  // --- 3. PATCH LEAD STATUS ---
  const leadStatusMatch = url.match(/\/admin\/leads\/([a-zA-Z0-9_]+)\/status$/);
  if (leadStatusMatch && method === 'patch') {
    const id = leadStatusMatch[1];
    const { status } = getRequestData(config.data);
    const lead = mockLeads.find((l) => l.id === id);
    
    if (lead) {
      lead.status = status;
      return Promise.reject({
        config,
        response: { status: 200, statusText: 'OK', headers: {}, config, data: { ...lead } },
      });
    }
  }

  // --- 4. POST LEAD NOTE ---
  const leadNoteMatch = url.match(/\/admin\/leads\/([a-zA-Z0-9_]+)\/notes$/);
  if (leadNoteMatch && method === 'post') {
    const id = leadNoteMatch[1];
    const { content } = getRequestData(config.data);
    const lead = mockLeads.find((l) => l.id === id);
    
    if (lead) {
      const activeUser = JSON.parse(localStorage.getItem('vantage_admin_user') || '{"name":"Sarah Stafford"}');
      const newNote = {
        id: `note_${Date.now()}`,
        content,
        author_name: activeUser.name,
        created_at: new Date().toISOString(),
      };
      if (!lead.notes) lead.notes = [];
      lead.notes.push(newNote);

      return Promise.reject({
        config,
        response: { status: 200, statusText: 'OK', headers: {}, config, data: newNote },
      });
    }
  }

  // --- 5. CONTENT CONFIGURATOR MOCK ---
  if (url.includes('/admin/content') && method === 'get') {
    const urlParams = new URL(url, 'http://localhost');
    const pageFilter = urlParams.searchParams.get('page');
    let blocks = [...mockContentBlocks];
    if (pageFilter) {
      blocks = blocks.filter((b) => b.page === pageFilter);
    }
    return Promise.reject({
      config,
      response: { status: 200, statusText: 'OK', headers: {}, config, data: blocks },
    });
  }

  const contentUpdateMatch = url.match(/\/admin\/content\/([a-zA-Z0-9_]+)$/);
  if (contentUpdateMatch && method === 'put') {
    const id = contentUpdateMatch[1];
    const { content_data } = getRequestData(config.data);
    const blockIndex = mockContentBlocks.findIndex((b) => b.id === id);
    if (blockIndex !== -1) {
      mockContentBlocks[blockIndex].content_data = content_data;
      mockContentBlocks[blockIndex].updated_at = new Date().toISOString();
      return Promise.reject({
        config,
        response: { status: 200, statusText: 'OK', headers: {}, config, data: { ...mockContentBlocks[blockIndex] } },
      });
    }
  }

  // --- 6. ADMIN ACCOUNT DIRECTORY MOCK ---
  if (url.includes('/admin/users') && method === 'get') {
    return Promise.reject({
      config,
      response: { status: 200, statusText: 'OK', headers: {}, config, data: [...mockAdminUsers] },
    });
  }

  if (url.includes('/admin/users') && method === 'post') {
    const data = getRequestData(config.data);
    const newUser = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      active: true,
    };
    mockAdminUsers.push(newUser);
    return Promise.reject({
      config,
      response: { status: 200, statusText: 'OK', headers: {}, config, data: newUser },
    });
  }

  const adminUpdateMatch = url.match(/\/admin\/users\/([a-zA-Z0-9_]+)$/);
  if (adminUpdateMatch && method === 'put') {
    const id = adminUpdateMatch[1];
    const data = getRequestData(config.data);
    const userIndex = mockAdminUsers.findIndex((u) => u.id === id);
    if (userIndex !== -1) {
      mockAdminUsers[userIndex] = {
        ...mockAdminUsers[userIndex],
        name: data.name ?? mockAdminUsers[userIndex].name,
        email: data.email ?? mockAdminUsers[userIndex].email,
        role: data.role ?? mockAdminUsers[userIndex].role,
      };
      return Promise.reject({
        config,
        response: { status: 200, statusText: 'OK', headers: {}, config, data: mockAdminUsers[userIndex] },
      });
    }
  }

  const adminStatusMatch = url.match(/\/admin\/users\/([a-zA-Z0-9_]+)\/status$/);
  if (adminStatusMatch && method === 'patch') {
    const id = adminStatusMatch[1];
    const { active } = getRequestData(config.data);
    const userIndex = mockAdminUsers.findIndex((u) => u.id === id);
    if (userIndex !== -1) {
      mockAdminUsers[userIndex].active = active;
      return Promise.reject({
        config,
        response: { status: 200, statusText: 'OK', headers: {}, config, data: mockAdminUsers[userIndex] },
      });
    }
  }

  // --- 7. SECURITY AUDIT TRAIL MOCK ---
  if (url.includes('/admin/audit-logs') && method === 'get') {
    return Promise.reject({
      config,
      response: {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: {
          data: [...mockAuditLogs],
          total: mockAuditLogs.length,
        },
      },
    });
  }

  // --- 8. DIRECT MEDIA UPLOAD FALLBACK MOCK ---
  if (url.includes('/admin/media/upload') && method === 'post') {
    // Emulate Cloudinary return payload containing secure_url
    const mockUrl = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000';
    return Promise.reject({
      config,
      response: {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: { secure_url: mockUrl },
      },
    });
  }

  // Fallthrough for requests that do not match mock handlers
  return config;
});

// Axios throws rejected promises for intercepted mock results (using mock payloads in response).
// We must parse the rejected promise in a second response interceptor to map it to a normal resolved request!
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If it is a mock response (contains config and response fields), resolve it normally!
    if (error && error.response && error.response.status === 200) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);
