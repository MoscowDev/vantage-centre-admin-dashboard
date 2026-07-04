# Vantage Center Admin Dashboard

Production-grade operations and content management portal for **Vantage Center**. Decoupled from the public frontend, this application provides internal staff and super administrators with high-density control panels to manage consultation leads, edit inline page sections, and configure admin credentials.

---

## 🛠️ Technology Stack

| Concern | Choice |
|---|---|
| **Framework** | React 19 + Vite |
| **Routing** | React Router (v6), route-level authentication guards |
| **Styling** | Tailwind CSS + Lucide Icons (Dense, Dark-Mode Slate design) |
| **Server State** | TanStack Query (React Query v5) |
| **Forms & Validation** | React Hook Form + Zod resolvers |
| **Auth Strategy** | JWT local retention (memory + secure storage) with 401 redirect interceptors |

---

## 📁 Architectural Highlights

1. **Feature-based Structure**: Component layout grouped by logic (`features/auth`, `features/leads`, `features/content`, `features/adminUsers`, `features/auditLog`).
2. **Centralized Axios Interceptors**: Intercepts outgoing requests to append `Authorization` Bearer JWT headers and handles `401 Unauthorized` responses by automatically routing expired sessions back to `/login`.
3. **Double-layer RBAC**: 
   - **Route Guarding**: `<ProtectedRoute requiredRole="..." />` blocks unauthorized address entries.
   - **Component Guarding**: Conditionally conceals administrative UI buttons and nav folders from `STAFF` members.
4. **Adapter Separation Layer**: Front-facing components bind strictly to cleanly modeled local types (`Lead`, `ContentBlock`, `AdminUser`), fully insulated from backend API DTO schema shifts.
5. **Interactive Client Mocks**: Integrates an elegant request interceptor fallback that feeds authentic database records when running locally, allowing immediate deployment validation without running local databases.

---

## 🚀 Setup & Execution

### 1. Configure Environment Variables
Create a `.env` file at the project root (default configs are already created):
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
# Switch to 'false' once your Spring Boot backend is running locally
VITE_USE_MOCK_DATA=true
```

### 2. Install Dependencies
Run from the project root:
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Credentials for Local Testing

When running with `VITE_USE_MOCK_DATA=true`, authenticate using the following built-in profiles:

| Role Authority | Email Account | Password | Visible Screens / Actions |
|---|---|---|---|
| **SUPER_ADMIN** | `admin@vantage.com` | `admin123` | Leads Board, Content Editor, Admin Directory, Audit Logs. Toggling active accounts, notes submission. |
| **STAFF** | `staff@vantage.com` | `staff123` | Leads Board, Content Editor. *Note: Admin Directory and Audit Log navigation links are completely hidden and guarded.* |

---

## 📈 Operational Workflows

- **Export Leads to CSV**: On the Leads Dashboard, click the **Export to CSV** button to download all filtered/searched lead data.
- **Section Block Editor**: Choose a page tab in the **Content Editor** page, click the section card on the left panel, and adjust values inline on the right workspace. Unsaved changes warning flags protect against navigating away prematurely.
- **Cloudinary / Fallback Upload**: In the media editor, clicking upload invokes the Cloudinary widget or falls back to server-wired upload if widgets fail to load.
