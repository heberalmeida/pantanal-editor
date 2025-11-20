/**
 * File Browser configuration types
 */

export interface FileBrowserTransport {
  read?: FileBrowserReadTransport;
  upload?: FileBrowserUploadTransport;
  destroy?: FileBrowserDestroyTransport;
  create?: FileBrowserCreateTransport;
  fileUrl?: string | ((path: string, fileName: string) => string);
}

export interface FileBrowserReadTransport {
  url?: string | (() => string);
  type?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  dataType?: 'json' | 'jsonp' | 'xml' | 'html' | 'text';
  contentType?: string;
  data?: Record<string, any> | string | (() => Record<string, any> | string);
}

export interface FileBrowserUploadTransport {
  url: string;
}

export interface FileBrowserDestroyTransport {
  url?: string | (() => string);
  type?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  dataType?: 'json' | 'jsonp' | 'xml' | 'html' | 'text';
  contentType?: string;
  data?: Record<string, any> | string | (() => Record<string, any> | string);
}

export interface FileBrowserCreateTransport {
  url?: string | (() => string);
  type?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  dataType?: 'json' | 'jsonp' | 'xml' | 'html' | 'text';
  contentType?: string;
  data?: Record<string, any> | string | (() => Record<string, any> | string);
}

export interface FileBrowserSchema {
  model?: {
    id?: string;
    fields?: {
      name?: FileBrowserField;
      type?: FileBrowserField;
      size?: FileBrowserField;
    };
  };
}

export interface FileBrowserField {
  field?: string;
  parse?: (value: any) => any;
}

export interface FileBrowserMessages {
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

export interface FileBrowserProps {
  fileTypes?: string; // Allowed file extensions (e.g., "gif,jpg,jpeg,png")
  path?: string; // Initial folder path
  transport?: FileBrowserTransport;
  schema?: FileBrowserSchema;
  messages?: FileBrowserMessages;
}

export interface FileBrowserItem {
  id: string;
  name: string;
  type: 'f' | 'd'; // 'f' = file, 'd' = directory
  size?: number;
  path?: string;
}

export interface FileBrowserResponse {
  data: FileBrowserItem[];
  total?: number;
}




