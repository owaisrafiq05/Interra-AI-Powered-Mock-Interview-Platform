export interface IUser {
  _id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  hasNotifications: boolean;
  isEmailVerified: boolean;
  address?: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IPagination {
  totalItems: number;
  perPage: number;
  totalPages: number;
  currentPage: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface FileInfo {
  file: File;
  preview: string;
}
