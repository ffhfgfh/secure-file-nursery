
export type FileType = 'image' | 'document' | 'video' | 'audio' | 'archive' | 'code' | 'pdf' | 'other';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: FileType;
  lastModified: Date;
  encrypted: boolean;
  path: string;
  extension: string;
  favorited?: boolean;
  blob?: Blob;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  files: FileItem[];
  subfolders: Folder[];
  parent: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type SortType = 'name' | 'size' | 'date' | 'type';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  type: SortType;
  direction: SortDirection;
}

export interface ViewMode {
  type: 'grid' | 'list';
  showDetails: boolean;
}
