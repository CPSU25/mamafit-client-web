import { ElementType } from 'react';

// Các interface cơ bản không thay đổi
interface User {
  name: string;
  email: string;
  avatar: string;
}
interface Role {
  name: string;
  navGroups: NavGroup[];
}

interface BaseNavItem {
  title: string;
  badge?: string;
  icon?: ElementType;
}

// --- ĐỊNH NGHĨA LẠI ĐỂ CHẶT CHẼ HƠN ---

// NavLink: Định nghĩa một link điều hướng. Nó BẮT BUỘC có `url` và KHÔNG ĐƯỢC CÓ `items`.
export type NavLink = BaseNavItem & {
  url: string;
  items?: never; // Dùng `never` để TypeScript báo lỗi nếu một NavLink có thuộc tính `items`
};

// NavCollapsible: Định nghĩa một nhóm menu có thể thu gọn. Nó BẮT BUỘC có `items` và KHÔNG ĐƯỢC CÓ `url`.
export type NavCollapsible = BaseNavItem & {
  items: NavItem[];
  url?: never; // Dùng `never` để cấm một group có thuộc tính `url`
};

// NavItem: Là một trong hai loại trên. Giờ đây TypeScript có thể dễ dàng phân biệt chúng.
export type NavItem = NavLink | NavCollapsible;

// Các interface còn lại không thay đổi
export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface SidebarData {
  user: User;
  role: Role[];
}