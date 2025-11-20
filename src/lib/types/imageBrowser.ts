/**
 * Image Browser configuration types
 */

export interface ImageBrowserTransport {
  read?: ImageBrowserReadTransport;
  upload?: ImageBrowserUploadTransport;
  destroy?: ImageBrowserDestroyTransport;
  create?: ImageBrowserCreateTransport;
  imageUrl?: string | ((path: string, fileName: string) => string);
  thumbnailUrl?: string | ((path: string, fileName: string) => string);
}

export interface ImageBrowserReadTransport {
  url?: string | (() => string);
  type?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  dataType?: 'json' | 'jsonp' | 'xml' | 'html' | 'text';
  contentType?: string;
  data?: Record<string, any> | string | (() => Record<string, any> | string);
}

export interface ImageBrowserUploadTransport {
  url: string;
}

export interface ImageBrowserDestroyTransport {
  url?: string | (() => string);
  type?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  dataType?: 'json' | 'jsonp' | 'xml' | 'html' | 'text';
  contentType?: string;
  data?: Record<string, any> | string | (() => Record<string, any> | string);
}

export interface ImageBrowserCreateTransport {
  url?: string | (() => string);
  type?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  dataType?: 'json' | 'jsonp' | 'xml' | 'html' | 'text';
  contentType?: string;
  data?: Record<string, any> | string | (() => Record<string, any> | string);
}

export interface ImageBrowserSchema {
  model?: {
    id?: string;
    fields?: {
      name?: ImageBrowserField;
      type?: ImageBrowserField;
      size?: ImageBrowserField;
    };
  };
}

export interface ImageBrowserField {
  field?: string;
  parse?: (value: any) => any;
}

export interface ImageBrowserMessages {
  uploadFile?: string;
  orderBy?: string;
  orderByName?: string;
  orderBySize?: string;
  directoryNotFound?: string;
  emptyFolder?: string;
  deleteFile?: string;
  invalidFileType?: string;
  overwriteFile?: string;
  search?: string;
}

export interface ImageBrowserProps {
  fileTypes?: string; // Allowed file extensions (e.g., "gif,jpg,jpeg,png")
  path?: string; // Initial folder path
  transport?: ImageBrowserTransport;
  schema?: ImageBrowserSchema;
  messages?: ImageBrowserMessages;
}

export interface ImageBrowserItem {
  id: string;
  name: string;
  type: 'f' | 'd'; // 'f' = file, 'd' = directory
  size?: number;
  path?: string;
  thumbnailUrl?: string;
}

export interface ImageBrowserResponse {
  data: ImageBrowserItem[];
  total?: number;
}




