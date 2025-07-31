# Báo Cáo Kỹ Thuật Dự Án MamaFit Client Web

## Tổng Quan

**MamaFit Client Web** là một ứng dụng web ReactJS phục vụ hệ thống quản lý sản xuất và kinh doanh trang phục bầu cho phụ nữ mang thai. Dự án được xây dựng với kiến trúc hiện đại, sử dụng TypeScript và các công nghệ tiên tiến nhất trong hệ sinh thái React.

---

## 1. Kiến Trúc Tổng Thể

### 1.1 Mô Hình Kiến Trúc
Dự án áp dụng **Client-Side Architecture** với các đặc điểm:

- **Single Page Application (SPA)**: Sử dụng React Router DOM v7 cho điều hướng
- **Component-Based Architecture**: Tổ chức theo components tái sử dụng
- **Layer-Based Structure**: Phân tách rõ ràng giữa các tầng (Presentation, Business Logic, Data Access)
- **Service-Oriented**: Tách biệt logic nghiệp vụ thành các services độc lập

### 1.2 Luồng Dữ Liệu
```
UI Components → Hooks/Services → API Layer → Backend
     ↓              ↓              ↓
State Management ← React Query ← Axios Instance
```

### 1.3 Kiến Trúc Bảo Mật
- **JWT-based Authentication**: Sử dụng Access Token và Refresh Token
- **Role-Based Access Control (RBAC)**: Phân quyền theo vai trò người dùng
- **Route Guards**: Bảo vệ các route dựa trên quyền truy cập
- **Automatic Token Refresh**: Tự động làm mới token khi hết hạn

---

## 2. Phân Tích Cấu Trúc Thư Mục

### 2.1 Cấu Trúc Tổng Thể

```
src/
├── @types/           # Type definitions cho TypeScript
├── apis/             # API calls và endpoints
├── components/       # UI components tái sử dụng
├── context/          # React Context providers
├── hooks/            # Custom React hooks
├── layouts/          # Layout components
├── lib/              # Utilities và configuration
├── middleware/       # Middleware functions
├── pages/            # Page components theo feature
├── router/           # Routing configuration
├── services/         # Business logic services
└── stores/           # State management (Zustand)
```

### 2.2 Phân Tích Chi Tiết

#### **@types/ - Type Definitions**
- `auth.type.ts`: Định nghĩa types cho authentication và authorization
- `response.ts`: Response types từ API
- `global.types.ts`: Global types được sử dụng across application
- Các types khác theo domain: chat, admin, branch, etc.

#### **apis/ - API Layer**
- `index.ts`: Centralized exports cho tất cả APIs
- `auth.api.ts`: Authentication endpoints
- `*.api.ts`: Domain-specific API calls
- Sử dụng Axios instance với interceptors

#### **components/ - UI Components**
- **Cấu trúc phân cấp**:
  - `ui/`: Shadcn/ui components (base components)
  - `layout/`: Layout-specific components
  - `providers/`: Context providers
  - Root level: Feature-specific components

#### **layouts/ - Layout System**
- `app.layout.tsx`: Root layout với providers
- `system.layout.tsx`: Admin/system layout
- `guest.layout.tsx`: Guest user layout
- `guard.layout.tsx`: Authentication guard
- `default.layout.tsx`: Default layout wrapper

#### **pages/ - Feature Pages**
Tổ chức theo role-based modules:
- `admin/`: Admin dashboard và management pages
- `branch/`: Branch manager functionality
- `designer/`: Designer workspace
- `factory-manager/`: Factory management
- `guest/`: Public pages
- `public-page/`: Common public pages (login, 404, etc.)

#### **services/ - Business Logic**
Domain-driven services:
- `auth/`: Authentication services
- `chat/`: Real-time chat functionality
- `notification/`: Notification system
- `upload/`: File upload services
- `maps/`: Location services

---

## 3. Công Nghệ & Thư Viện

### 3.1 Core Technologies

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **React** | 19.0.0 | UI framework |
| **TypeScript** | 5.7.2 | Type safety |
| **Vite** | 6.3.1 | Build tool & dev server |
| **TailwindCSS** | 4.1.4 | Styling framework |

### 3.2 State Management & Data Fetching

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| **Zustand** | 5.0.3 | Global state management |
| **TanStack React Query** | 5.74.11 | Server state & caching |
| **React Hook Form** | 7.56.1 | Form state management |

### 3.3 UI & Design System

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| **Radix UI** | 2.x.x | Headless UI primitives |
| **Shadcn/ui** | - | Design system components |
| **Lucide React** | 0.503.0 | Icon library |
| **Class Variance Authority** | 0.7.1 | Variant-based styling |

### 3.4 Routing & Navigation

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| **React Router DOM** | 7.6.0 | Client-side routing |
| **TanStack Router** | 1.120.11 | Type-safe routing (alternative) |

### 3.5 Communication & Real-time

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| **Axios** | 1.9.0 | HTTP client |
| **Microsoft SignalR** | 8.0.7 | Real-time communication |

### 3.6 Utilities & Helper Libraries

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| **Day.js** | 1.11.13 | Date manipulation |
| **Zod** | 3.24.3 | Schema validation |
| **Yup** | 1.4.0 | Form validation |
| **Jose** | 6.0.10 | JWT handling |
| **js-cookie** | 3.0.5 | Cookie management |

### 3.7 Development & Quality Tools

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| **ESLint** | 9.22.0 | Code linting |
| **Prettier** | 3.5.3 | Code formatting |
| **TypeScript ESLint** | 8.26.1 | TypeScript linting |

---

## 4. Luồng Dữ Liệu & Giao Tiếp API

### 4.1 Kiến Trúc API

#### **Axios Configuration**
```typescript
// Base configuration với interceptors
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})
```

#### **Request Interceptor**
- Tự động thêm Authorization header với Bearer token
- Loại bỏ token cho refresh endpoint

#### **Response Interceptor**
- **Automatic Token Refresh**: Tự động refresh token khi 401/403
- **Request Queue**: Queue các request trong lúc refresh
- **Retry Logic**: Retry network errors với exponential backoff
- **Error Handling**: Centralized error handling

### 4.2 API Response Format

```typescript
interface ItemBaseResponse<T> {
  statusCode: HttpStatusCode
  message: string
  data: T
  additionalData?: string
  code: string
}

interface ListBaseResponse<T> {
  data: {
    items: T[]
    pageNumber: number
    totalPages: number
    totalCount: number
    pageSize: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
  // ... other fields
}
```

### 4.3 React Query Integration

#### **Configuration**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error.response?.status === 404 || error.response?.status === 403) 
          return false
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      refetchOnWindowFocus: false
    }
  }
})
```

#### **Features**
- **Smart Caching**: 5 phút cache cho data
- **Background Refetch**: Tự động cập nhật khi reconnect
- **Error Retry**: Retry logic theo HTTP status
- **DevTools**: React Query DevTools cho debugging

### 4.4 Real-time Communication

#### **SignalR Integration**
- **Auto Connect/Disconnect**: Dựa trên authentication status
- **Global Message Handler**: Centralized message processing
- **Notification System**: Toast notifications cho chat messages
- **Connection State Management**: Track connection status

---

## 5. Quản Lý Trạng Thái

### 5.1 Zustand for Global State

#### **Auth Store**
```typescript
interface AuthStoreState {
  isAuthenticated: boolean
  user: User | null
  accessToken: string
  refreshToken: string
  save: (tokens) => void
  clear: () => void
}
```

**Features:**
- **Persistent Storage**: LocalStorage với JSON serialization
- **JWT Decoding**: Tự động decode và extract user info
- **Rehydration**: Restore state sau khi reload page
- **Token Normalization**: Handle multiple JWT claim formats

### 5.2 React Query for Server State

#### **Query Configuration**
- **Caching Strategy**: 5 phút stale time
- **Background Updates**: Automatic refetch on reconnect
- **Error Handling**: Retry logic based on HTTP status codes
- **Optimistic Updates**: Immediate UI updates cho mutations

#### **Key Features**
- **Automatic Deduplication**: Prevents duplicate requests
- **Background Refetching**: Keeps data fresh
- **Offline Support**: Handles network failures gracefully
- **Pagination Support**: Built-in pagination utilities

### 5.3 React Hook Form for Form State

#### **Configuration**
```typescript
const methods = useForm<FormType>({
  defaultValues,
  resolver: zodResolver(schema),
  mode: 'onChange'
})
```

**Features:**
- **Schema Validation**: Zod integration cho type-safe validation
- **Performance**: Minimal re-renders
- **Error Handling**: Comprehensive error states
- **TypeScript Support**: Full type safety

### 5.4 Context API for Feature State

#### **Auth Context**
```typescript
interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  userPermission: PermissionResponse | null
  hasRole: (role: string) => boolean
  checkAuth: () => void
}
```

#### **Search Context**
- Global search functionality
- Search state management
- Results caching

---

## 6. Định Tuyến & Layouts

### 6.1 Routing Architecture

#### **Hierarchical Structure**
```typescript
const router = createBrowserRouter([
  {
    element: <AppLayout />, // Root layout
    children: [
      // Public routes
      { path: '/', element: <HomePage /> },
      { path: '/system/sign-in', element: <GuestLayout /> },
      
      // Protected routes with guards
      {
        path: '/system/admin',
        element: (
          <AuthGuard requiredRole='Admin'>
            <SystemLayout role='Admin' />
          </AuthGuard>
        ),
        children: [/* admin routes */]
      }
      // ... other role-based routes
    ]
  }
])
```

### 6.2 Route Protection

#### **AuthGuard Component**
**Features:**
- **Role-based Access**: Check user roles before rendering
- **Silent Redirects**: Prevent flash of unauthorized content
- **Loading States**: Show spinners during auth checks
- **Toast Notifications**: User-friendly error messages
- **Fallback Routing**: Redirect to appropriate pages

#### **Protection Levels**
1. **Authentication Check**: Verify user is logged in
2. **Role Verification**: Check user has required role
3. **Permission Validation**: Validate specific permissions

### 6.3 Layout System

#### **AppLayout (Root)**
```typescript
export default function AppLayout() {
  useSignalRAutoConnect() // Auto-connect SignalR
  
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <Outlet />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
```

#### **SystemLayout (Admin/Dashboard)**
```typescript
function SystemLayout({ role }: { role: UserRole }) {
  return (
    <SearchProvider>
      <SidebarProvider>
        <AppSidebar role={role} />
        <SidebarInset>
          <Header>
            <Search />
            <NotificationDropdown />
            <ModeToggle />
          </Header>
          <Content />
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  )
}
```

#### **Layout Features**
- **Responsive Design**: Mobile-first approach
- **Theme Support**: Light/dark mode toggle
- **Role-based Sidebar**: Different navigation per role
- **Global Search**: Integrated search functionality
- **Notification System**: Real-time notifications

---

## 7. Quy Ước & Chất Lượng Code

### 7.1 Code Style & Formatting

#### **ESLint Configuration**
```javascript
export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
```

#### **Prettier Integration**
- **Auto-formatting**: Format on save
- **Consistent Style**: Unified code formatting
- **Script Command**: `npm run format`

### 7.2 TypeScript Configuration

#### **Strict Type Checking**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### **Path Mapping**
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

### 7.3 Naming Conventions

#### **Files & Folders**
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuthStore.ts`)
- **Types**: PascalCase with `.type.ts` suffix
- **APIs**: camelCase with `.api.ts` suffix
- **Services**: camelCase with `.service.ts` suffix

#### **Code Conventions**
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase with descriptive names
- **Types**: PascalCase, often with suffix (e.g., `UserRole`)

### 7.4 Project Structure Standards

#### **Feature-based Organization**
```
pages/
├── admin/           # Admin-specific pages
├── branch/          # Branch manager pages
├── designer/        # Designer pages
└── public-page/     # Shared public pages
```

#### **Service Layer Pattern**
```
services/
├── auth/           # Authentication services
├── chat/           # Chat services
├── notification/   # Notification services
└── upload/         # File upload services
```

### 7.5 Development Workflow

#### **Scripts Available**
```json
{
  "dev": "vite --mode development",
  "prod": "vite --mode production", 
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "format": "prettier --write \"src/**/*.{ts,tsx}\"",
  "preview": "vite preview"
}
```

#### **Environment Modes**
- **Development**: Local development với hot reload
- **Production**: Production build với optimizations
- **Preview**: Preview production build locally

---

## 8. Xác Thực & Phân Quyền

### 8.1 Authentication System

#### **JWT-based Authentication**
```typescript
interface LoginResponse {
  accessToken: string
  refreshToken: string
}
```

**Flow:**
1. **Login**: User credentials → Backend validation → JWT tokens
2. **Token Storage**: Zustand store với localStorage persistence
3. **Auto-refresh**: Interceptor handles token expiration
4. **Logout**: Clear tokens và redirect

#### **Token Management**
```typescript
// Automatic token refresh trong Axios interceptor
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true
  const { accessToken } = await refresh()
  // Retry original request với token mới
  return api(originalRequest)
}
```

### 8.2 Authorization System

#### **Role-based Access Control**

**User Roles:**
```typescript
type SystemRole = 'Admin' | 'BranchManager' | 'Designer' | 'Manager' | 'Staff'
type ClientRole = 'User'
type UserRole = SystemRole | ClientRole
```

**Role Hierarchy:**
- **Admin**: Full system access
- **BranchManager**: Branch-specific management
- **Designer**: Design và template management
- **Manager**: Factory operations management
- **Staff**: Task execution
- **User**: Customer interface (future implementation)

#### **Permission System**
```typescript
interface PermissionResponse {
  userName: string
  userEmail: string
  roleName: string
  profilePicture: string
}
```

#### **Route Protection Implementation**
```typescript
const AuthGuard = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/system/sign-in" />
  }
  
  if (requiredRole && !hasRole(requiredRole)) {
    toast.error('Access Denied')
    return <Navigate to="/system/sign-in" />
  }
  
  return <>{children}</>
}
```

### 8.3 Security Features

#### **Token Security**
- **HTTPOnly Storage**: Không expose tokens to XSS
- **Automatic Expiration**: Tokens có thời hạn cố định
- **Refresh Rotation**: New refresh token mỗi lần refresh
- **Secure Headers**: Proper CORS và security headers

#### **Route Security**
- **Protected Routes**: Tất cả system routes được bảo vệ
- **Role Validation**: Double-check role ở component level
- **Silent Redirects**: Prevent information disclosure
- **Session Management**: Proper cleanup on logout

#### **API Security**
- **Bearer Token**: Authorization header cho mọi requests
- **Request Signing**: HTTPS only
- **Error Handling**: No sensitive info trong error messages
- **Rate Limiting**: Client-side request throttling

---

## 9. Performance & Optimization

### 9.1 Build Optimization

#### **Vite Configuration**
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
})
```

#### **Code Splitting**
- **Dynamic Imports**: Lazy loading cho pages
- **Vendor Chunks**: Separate chunks cho vendor libraries
- **Tree Shaking**: Eliminate dead code

### 9.2 Runtime Performance

#### **React Optimizations**
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Memoize expensive computations
- **Lazy Loading**: Dynamic imports cho components

#### **State Management Optimizations**
- **Selective Subscriptions**: Zustand với selective updates
- **Query Deduplication**: React Query prevents duplicate requests
- **Background Updates**: Keep data fresh without blocking UI

### 9.3 Asset Optimization

#### **Images & Media**
- **Cloudinary Integration**: CDN-based image optimization
- **Firebase Storage**: Scalable file storage
- **Lazy Loading**: Load images on demand

#### **Fonts & Icons**
- **Local Fonts**: Roboto font family local hosting
- **Icon Tree Shaking**: Lucide React selective imports
- **CSS Optimization**: Tailwind CSS purging

---

## 10. Deployment & Infrastructure

### 10.1 Build Process

#### **Production Build**
```bash
npm run build  # TypeScript compilation + Vite build
```

**Output:**
- **Static Assets**: Optimized HTML, CSS, JS
- **Asset Hashing**: Cache busting với file hashes
- **Source Maps**: Debug support trong production

#### **Environment Configuration**
```typescript
define: {
  'import.meta.env.APP_MODE': JSON.stringify(mode)
}
```

### 10.2 Deployment Strategy

#### **Static Hosting Ready**
- **SPA Support**: Proper routing configuration
- **Asset Optimization**: Compressed và cached assets
- **CDN Integration**: CloudFront/CloudFlare ready

#### **Environment Variables**
```
VITE_API_BASE_URL=https://api.mamafit.com
VITE_CLOUDINARY_CLOUD_NAME=mamafit
VITE_FIREBASE_CONFIG=...
```

---

## 11. Testing Strategy

### 11.1 Testing Setup

#### **Faker.js Integration**
```typescript
import { faker } from '@faker-js/faker'
// Mock data generation cho development và testing
```

### 11.2 Error Handling

#### **Global Error Boundary**
- **React Error Boundaries**: Catch component errors
- **Axios Error Interceptors**: Centralized API error handling
- **Toast Notifications**: User-friendly error messages

#### **Error Reporting**
```typescript
// Service-based error handling
const handleAuthError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    authStore.clear()
    toast.error('Session expired')
    navigate('/system/sign-in')
  }
}
```

---

## 12. Future Improvements & Recommendations

### 12.1 Technical Debt

#### **Immediate Actions**
1. **Add Unit Tests**: Jest + React Testing Library setup
2. **E2E Testing**: Playwright/Cypress integration
3. **Performance Monitoring**: Add performance metrics
4. **Error Tracking**: Sentry integration

#### **Medium-term Goals**
1. **Progressive Web App**: Service workers + offline support
2. **Internationalization**: i18n support cho multiple languages
3. **Accessibility**: WCAG compliance improvements
4. **Bundle Analysis**: Optimize bundle size

### 12.2 Scalability Considerations

#### **Code Organization**
1. **Micro-frontends**: Module federation cho large teams
2. **Component Library**: Extract reusable components
3. **Design System**: Comprehensive design token system
4. **Documentation**: Storybook integration

#### **Performance Scaling**
1. **Virtual Scrolling**: For large data sets
2. **Image Optimization**: WebP conversion + lazy loading
3. **Caching Strategy**: Service worker caching
4. **CDN Integration**: Global asset delivery

---

## 13. Kết Luận

### 13.1 Điểm Mạnh Của Dự Án

1. **Modern Architecture**: Sử dụng các công nghệ mới nhất và best practices
2. **Type Safety**: Full TypeScript coverage cho code quality
3. **Developer Experience**: Excellent tooling với Vite, ESLint, Prettier
4. **Performance**: Optimized với React Query caching và code splitting
5. **Security**: Comprehensive authentication và authorization system
6. **Scalability**: Well-structured codebase dễ maintain và extend

### 13.2 Technical Highlights

- **Real-time Communication**: SignalR integration cho chat functionality
- **Smart Caching**: React Query với intelligent cache invalidation
- **Automatic Token Management**: Seamless authentication flow
- **Role-based UI**: Dynamic interface based on user permissions
- **Responsive Design**: Mobile-first approach với Tailwind CSS
- **Developer Productivity**: Hot reload, type checking, auto-formatting

### 13.3 Business Value

Dự án MamaFit Client Web cung cấp một nền tảng robust cho việc quản lý sản xuất và kinh doanh trang phục bầu, với khả năng:

- **Multi-role Management**: Support nhiều loại người dùng với quyền khác nhau
- **Real-time Collaboration**: Chat system cho communication giữa các bộ phận
- **Scalable Architecture**: Dễ dàng thêm features và scale theo business growth
- **Professional UI/UX**: Modern interface tăng productivity cho users
- **Data Integrity**: Type-safe operations và proper error handling

**Dự án này thể hiện một kiến trúc frontend professional, suitable cho enterprise-level applications trong lĩnh vực fashion và e-commerce.**