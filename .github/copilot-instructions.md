# Hướng dẫn tùy chỉnh cho GitHub Copilot - Dự án MamaFit

## 📜 Quy tắc Vàng
**QUAN TRỌNG:** Luôn luôn giao tiếp, giải thích, và tạo code bằng **tiếng Việt**.

---

## 🏗️ 1. Tổng quan Kiến trúc & Dự án

- **Tên dự án:** MamaFit Client Web.
- **Mô tả:** Frontend cho hệ thống quản lý sản xuất và kinh doanh trang phục bầu.
- **Mô hình kiến trúc:**
    - **Single Page Application (SPA)**: Được xây dựng trên nền tảng React.
    - **Component-Based**: Tái sử dụng component là nguyên tắc cốt lõi.
    - **Layer-Based & Service-Oriented**: Phân tách rõ ràng giữa các tầng logic (Presentation, Business, Data). Logic nghiệp vụ được đặt trong các `services`.
- **Điểm vào (Entry Point):** `main.tsx`.
- **Luồng khởi tạo:** `AppLayout` là layout gốc, bọc ngoài cùng các providers quan trọng như `QueryProvider`, `ThemeProvider`, `AuthProvider`.

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

Luôn ưu tiên sử dụng các thư viện đã có trong dự án cho đúng mục đích của chúng.

- **UI & Styling:**
    - **Tailwind CSS:** Framework chính.
    - **shadcn/ui & Radix UI:** Sử dụng để xây dựng các component UI.
    - **lucide-react:** Thư viện icon.
    - **class-variance-authority (cva) & clsx:** Để tạo các component có variants và quản lý class.

- **Quản lý Trạng thái (State Management):**
    - **Zustand:** Dùng cho **trạng thái client toàn cục** (global client state) như thông tin xác thực, cài đặt UI.
    - **TanStack Query (React Query):** Dùng cho **trạng thái server** (server state). Quản lý tất cả các hoạt động data fetching, caching, và mutation.
    - **React Hook Form:** Dùng cho **trạng thái của form** (form state).
    - **React Context:** Dùng cho các trạng thái ít thay đổi và cần chia sẻ trong một cây component cụ thể (ví dụ: `AuthProvider`, `SearchProvider`).

- **Định tuyến (Routing):**
    - **React Router DOM (v7):** Thư viện chính để định tuyến.

- **Xử lý Form:**
    - **React Hook Form:** Thư viện chính để xây dựng form.
    - **Zod:** Dùng để định nghĩa schema và **validation**. Ưu tiên sử dụng Zod thay vì Yup.

- **Giao tiếp API & Real-time:**
    - **Axios:** HTTP client chính. Luôn sử dụng instance đã được cấu hình sẵn trong `lib/axios/axios.ts` với các interceptor.
    - **Microsoft SignalR:** Dùng cho giao tiếp real-time (chat, notifications).

---

## 🔄 4. Luồng Dữ liệu & API

- **Cấu hình Axios:** Instance Axios đã được cấu hình với `baseURL`, `timeout`, và quan trọng nhất là các `interceptors`:
    - **Request Interceptor:** Tự động đính kèm `Authorization: Bearer <token>`.
    - **Response Interceptor:** Tự động refresh token khi nhận lỗi 401, xếp hàng và thử lại các request thất bại.

- **Cấu trúc Response API:** Tuân thủ theo cấu trúc `ItemBaseResponse<T>` và `ListBaseResponse<T>` đã được định nghĩa trong `src/@types/response.ts`.

- **Sử dụng React Query:**
    - Tận dụng cache (`staleTime: 5 phút`) để giảm thiểu request.
    - Sử dụng `queryKey` một cách nhất quán để quản lý cache.
    - Khi thực hiện `mutations`, hãy làm vô hiệu (invalidate) các queries liên quan để dữ liệu luôn được đồng bộ.

---

## 🔐 5. Xác thực & Phân quyền (Auth)

- **Cơ chế:** JWT-based (Access Token & Refresh Token).
- **Lưu trữ Token:** Token được quản lý bởi `useAuthStore` của Zustand và lưu vào `localStorage`.
- **Bảo vệ Route (Route Guarding):**
    - Component `AuthGuard` được sử dụng để bọc các route cần bảo vệ.
    - `AuthGuard` kiểm tra trạng thái đăng nhập và vai trò (`requiredRole`) của người dùng.
    - Nếu không đáp ứng, tự động chuyển hướng người dùng đến trang đăng nhập.
- **Vai trò người dùng (Roles):** Hệ thống phân quyền dựa trên vai trò (RBAC). Các vai trò chính: `Admin`, `BranchManager`, `Designer`, `Manager`, `Staff`.

---

## ✍️ 6. Quy ước Code & Naming

- **Components:** `PascalCase.tsx` (ví dụ: `UserProfile.tsx`).
- **Hooks & Stores:** `useCamelCase.ts` hoặc `use-kebab-case.ts` (ví dụ: `useAuth.ts`, `use-auth-store.ts`).
- **Types:** `*.type.ts` (ví dụ: `user.type.ts`).
- **APIs & Services:** `*.api.ts`, `*.service.ts`.
- **Linting & Formatting:** Tuân thủ nghiêm ngặt các quy tắc trong file `eslint.config.js` và `.prettierrc`. Chạy `npm run format` và `npm run lint` thường xuyên.
- **Path Aliases:** Sử dụng `@/*` để import từ thư mục `src/`.