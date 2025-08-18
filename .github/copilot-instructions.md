# Hướng dẫn tùy chỉnh cho GitHub Copilot - Dự án MamaFit

## 📜 Quy tắc Vàng
**QUAN TRỌNG:** Luôn luôn giao tiếp, giải thích, và tạo code bằng **tiếng Việt**.

---

## 🏗️ 1. Tổng quan Kiến trúc & Dự án

- **Tên dự án:** MamaFit Client Web.
- **Mô tả:** Frontend cho hệ thống quản lý sản xuất và kinh doanh trang phục bầu.
- **Tech Stack Chính:** React 19 + TypeScript 5.7 + Vite 6 + TailwindCSS 4 + React Router DOM v7
- **Mô hình kiến trúc:**
    - **Single Page Application (SPA)**: React với routing hierarchical
    - **Component-Based**: Tái sử dụng component là nguyên tắc cốt lõi (shadcn/ui + Radix UI)
    - **Layer-Based & Service-Oriented**: Phân tách rõ ràng giữa các tầng logic (Presentation, Business, Data)
    - **Role-Based Multi-tenant**: UI khác nhau cho từng vai trò (Admin, BranchManager, Designer, Manager, Staff)
- **Điểm vào:** `main.tsx` → `RouterProvider` với browser router
- **Layout Hierarchy:** `AppLayout` (providers) → Role-based layouts với `AuthGuard` protection

---

## 📁 2. Cấu trúc Thư mục & Quy ước

Luôn tuân thủ cấu trúc đã định sẵn. Dưới đây là vai trò của các thư mục chính:

- `src/@types/`: Chứa tất cả các định nghĩa `interface` và `type` của TypeScript. File được phân chia theo domain (ví dụ: `auth.type.ts`, `response.ts`).
- `src/apis/`: Tầng giao tiếp trực tiếp với API. Mỗi file `.api.ts` tương ứng với một domain API (ví dụ: `auth.api.ts`). Sử dụng instance Axios đã được cấu hình sẵn.
- `src/components/`: Chứa các UI component có thể tái sử dụng.
    - `components/ui/`: Các component base từ **shadcn/ui**.
    - `components/layout/`: Các component dành riêng cho layout.
    - `components/providers/`: Các component đóng vai trò là Context Provider.
- `src/context/`: Chứa các React Context providers (ví dụ: `AuthContext`, `SearchContext`).
- `src/hooks/`: Chứa các custom React Hooks (ví dụ: `useAuth`, `useDebounce`).
- `src/layouts/`: Các component layout chính của ứng dụng (`app.layout.tsx`, `system.layout.tsx`, `guest.layout.tsx`).
- `src/lib/`: Chứa các tiện ích, helpers và cấu hình cốt lõi (ví dụ: `axios.ts`, `utils.ts`, `dayjs.ts`).
- `src/pages/`: Các component trang, được tổ chức theo **feature/module dựa trên vai trò người dùng** (ví dụ: `pages/admin`, `pages/designer`).
- `src/router/`: Chứa file `router.tsx` định nghĩa toàn bộ hệ thống định tuyến (routing).
- `src/services/`: **Tầng Business Logic**. Logic nghiệp vụ phức tạp được đóng gói tại đây, tách biệt khỏi component (ví dụ: `auth.service.ts`, `upload.service.ts`).
- `src/stores/`: Chứa các "store" của **Zustand** để quản lý trạng thái toàn cục.

---

## 🛠️ 3. Công nghệ & Thư viện Chính

**LUÔN SỬ DỤNG CÁC THỦ VIỆN ĐÃ CÓ TRONG DỰ ÁN** - Không tự ý thêm dependencies mới.

- **UI & Styling:**
    - **Tailwind CSS v4:** Framework chính với `@tailwindcss/vite` plugin
    - **shadcn/ui & Radix UI:** Component system - luôn sử dụng existing components trước khi tạo mới
    - **lucide-react:** Thư viện icon duy nhất
    - **class-variance-authority (cva) & clsx & tailwind-merge:** Để tạo component variants

- **State Management (Phân chia rõ ràng):**
    - **Zustand:** Chỉ cho **global client state** (auth, UI settings) - VD: `useAuthStore`
    - **TanStack Query v5:** Chỉ cho **server state** - cache 5 phút, auto retry, background refetch
    - **React Hook Form + Zod:** Cho **form state** - luôn dùng zodResolver
    - **React Context:** Cho state ít thay đổi trong component tree cụ thể

- **Routing & Navigation:**
    - **React Router DOM v7:** `createBrowserRouter` với nested routes
    - **Hierarchical routing:** `/system/{role}/*` structure với AuthGuard protection
    - **Role-based layouts:** SystemLayout component nhận role prop

- **API & Real-time:**
    - **Axios:** Instance trong `lib/axios/axios.ts` có interceptors cho auto-refresh token
    - **Microsoft SignalR v8:** Real-time chat/notifications với auto-connect hooks
    - **Response patterns:** `ItemBaseResponse<T>` và `ListBaseResponse<T>`

---

## 🔄 4. Luồng Dữ liệu & API Patterns

- **Axios Instance Pattern:** Luôn import từ `@/lib/axios/axios` - KHÔNG tạo instance mới
    - **Auto Authorization:** Request interceptor tự động thêm Bearer token
    - **Smart Token Refresh:** Response interceptor với queue system để refresh token
    - **Error Normalization:** Unified error message extraction từ server response
    - **Retry Logic:** Auto retry network errors với exponential backoff

- **API Response Structure:** Backend trả về chuẩn `ItemBaseResponse<T>` hoặc `ListBaseResponse<T>`
    ```typescript
    // Single item response
    { statusCode, message, data: T, code, additionalData? }
    // List response  
    { data: { items: T[], pageNumber, totalPages, totalCount, pageSize, hasPreviousPage, hasNextPage }, ... }
    ```

- **React Query Best Practices:**
    - **Cache config:** `staleTime: 5 phút`, no refetch on window focus
    - **Query keys:** Consistent naming - `['entity', 'action', ...params]`
    - **Mutations:** Luôn `invalidateQueries` related data sau khi mutation thành công
    - **Error handling:** Errors từ axios interceptor, toast notifications trong mutations

- **Service Layer Pattern:** 
    - API calls trong `apis/*.api.ts` - thuần HTTP calls
    - Business logic trong `services/*/*.service.ts` - combine hooks + logic
    - Custom hooks combine useQuery/useMutation với form state

---

## 🔐 5. Authentication & Authorization Patterns

- **JWT Flow:** Access + Refresh tokens trong `useAuthStore` với localStorage persistence
- **Auto-refresh:** Axios interceptor queue system - requests chờ khi refresh, retry với token mới
- **Route Protection Pattern:**
    ```tsx
    <AuthGuard requiredRole='Admin'>
      <SystemLayout role='Admin' />
    </AuthGuard>
    ```
- **Role Hierarchy:** `Admin | BranchManager | Designer | Manager | Staff` - check role với `hasRole()` method
- **Permission Context:** `AuthProvider` wrap app, expose `isAuthenticated`, `isLoading`, `hasRole`
- **Silent Redirects:** AuthGuard có loading states, tránh flash of unauthorized content
- **SignalR Integration:** Auto-connect/disconnect dựa trên auth status trong `AppLayout`

---

## ⚡ 6. Developer Workflow & Commands  

- **Development:** `npm run dev` (port 3000) và `npm run prod` cho production mode
- **Build:** `npm run build` = TypeScript check + Vite build (luôn chạy type check trước)
- **Code Quality:** `npm run lint` (ESLint) và `npm run format` (Prettier) - chạy trước commit
- **Path Aliases:** `@/*` map to `src/*` - luôn dùng absolute imports
- **Environment:** Config trong `vite.config.ts`, sử dụng `import.meta.env.VITE_*` variables

---

## 🏛️ 7. Component Architecture Patterns

- **shadcn/ui Base:** Import từ `@/components/ui/*` - KHÔNG tạo lại basic components
- **Compound Components:** Sử dụng Radix UI patterns với `forwardRef` và proper typing
- **Variant System:** CVA cho consistent component variants - `size`, `variant`, `color` props
- **Form Integration:** React Hook Form + Zod resolver pattern:
    ```tsx
    const methods = useForm<FormType>({
      resolver: zodResolver(schema),
      defaultValues
    })
    ```
- **Loading States:** Consistent spinner với `animate-spin` class, disable buttons khi `isPending`
- **Error Boundaries:** Toast notifications trong mutation errors, user-friendly messages
- **TypeScript Patterns:** Generic components với proper inference, extend HTML element props

---

---

## ✍️ 9. Quy ước Code & Naming

- **Components:** `PascalCase.tsx` (ví dụ: `UserProfile.tsx`).
- **Hooks & Stores:** `useCamelCase.ts` hoặc `use-kebab-case.ts` (ví dụ: `useAuth.ts`, `use-auth-store.ts`).
- **Types:** `*.type.ts` (ví dụ: `user.type.ts`).
- **APIs & Services:** `*.api.ts`, `*.service.ts`.
- **Linting & Formatting:** Tuân thủ nghiêm ngặt các quy tắc trong file `eslint.config.js` và `.prettierrc`. Chạy `npm run format` và `npm run lint` thường xuyên.
- **Path Aliases:** Sử dụng `@/*` để import từ thư mục `src/`.

## 🗂️ 10. MCP Filesystem – BẮT BUỘC trước khi phân tích

> **Mục tiêu:** Trước khi trả lời hay kết luận về code, Copilot **phải dùng MCP Filesystem để tìm & đọc file liên quan**, rồi mới phân tích. **Không suy đoán** khi chưa đọc.

### 10.1 Luồng hành động chuẩn (bắt buộc)
1. **Xác định phạm vi đọc**
   - Ưu tiên: `src/**`, `apps/**`, `packages/**`, `config/**`
   - Bỏ qua: `node_modules`, `dist`, `build`, `coverage`, các file sinh ra khi build
2. **Tìm entry points & cấu hình**
   - `main.tsx`, `router.tsx`, `AppLayout`, `SystemLayout`, `AuthGuard`, `components/providers/*`
   - `vite.config.ts`, `tsconfig.*`, `package.json`, `lib/axios/axios.ts`, `stores/*`
3. **Đọc theo ngữ cảnh câu hỏi**
   - Với lỗi/feature cụ thể: lần theo import từ file liên quan → đọc component/container/service → theo dõi call graph (service → api/query → store)
4. **Chỉ sau khi đọc xong**: tóm tắt kiến trúc, nêu giả thuyết, đề xuất sửa/refactor
5. **Nếu chưa đủ dữ liệu**: yêu cầu quyền đọc thêm file/thư mục cụ thể (nêu rõ đường dẫn)

### 10.2 Cách gọi tool (nếu Chat cho phép chọn tool trực tiếp)
- **Tìm file:** `#filesystem.search_files`
  - `path=${workspaceFolder}`
  - `pattern=src/**/*.{ts,tsx}, apps/**/*, packages/**/*`
  - `exclude=node_modules|dist|build|coverage`
- **Đọc nội dung:** `#filesystem.read_text_file` (đọc batch các file entry/route/service chính)
- **Kiểm tra phạm vi:** `#filesystem.list_allowed_directories` để đảm bảo chỉ đọc trong workspace  
**Lưu ý:** Không ghi file trừ khi **được yêu cầu rõ ràng**.

### 10.3 Quy tắc trả lời sau khi đọc
- **Bắt đầu bằng:** “**Đã đọc các file:** …” và liệt kê ngắn gọn đường dẫn chính đã đọc
- **Tóm tắt 5 phần (ngắn – gọn – đúng trọng tâm):**
  1. **Overview:** entry points, layout, router, providers
  2. **Luồng dữ liệu:** component → service → api/query → store
  3. **Hợp đồng API:** kiểu dữ liệu `ItemBaseResponse`/`ListBaseResponse`, interceptor/refresh
  4. **Điểm rủi ro:** state, side effects, cache, guard
  5. **Hành động đề xuất:** từng bước, nêu rõ file/đường dẫn cần chỉnh
- **Không kết luận** về file **chưa đọc**; nếu cần, **xin phép đọc tiếp** (chỉ rõ đường dẫn)

### 10.4 Ưu tiên performance khi repo lớn
- Đọc **ít nhưng đúng**: entry points, router, layout, providers, service/axios, store
- Giới hạn **số file/độ sâu** ở lượt đầu; mở rộng dần theo call graph và theo câu hỏi
- Tái sử dụng kết quả đã đọc ở lượt trước; tránh đọc lặp

### 10.5 Giữ đúng “Quy tắc Vàng”
- **Mọi giao tiếp, giải thích, và code** đều bằng **tiếng Việt**
- Khi trích dẫn/đề xuất sửa, ghi rõ **file/đường dẫn** để thao tác nhanh
