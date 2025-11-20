export type EditorCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'fontSize'
  | 'fontName'
  | 'foreColor'
  | 'backColor'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'justifyLeft'
  | 'justifyCenter'
  | 'justifyRight'
  | 'justifyFull'
  | 'createLink'
  | 'insertImage'
  | 'insertHTML'
  | 'removeFormat'
  | 'undo'
  | 'redo'
  | 'clearFormatting';

export type ToolbarKind = 'button' | 'dropdown' | 'color' | 'separator' | 'custom';

export interface ToolbarItem {
  id: string;
  label: string;
  icon?: string;
  command?: EditorCommand;
  kind: ToolbarKind;
  options?: Array<{ label: string; value: string; previewStyle?: Record<string, string> }>;
  width?: string;
  disabled?: boolean;
  // Custom tool properties
  tooltip?: string;
  exec?: (context: ToolExecContext) => void | Promise<void>;
  items?: Array<{ label: string; value: string }>;
  palette?: string | string[];
  columns?: number;
  template?: string;
}

export interface ToolExecContext {
  editor: {
    getHTML: () => string;
    setHTML: (html: string) => void;
    exec: (command: EditorCommand, value?: string) => void;
    getSelection: () => Selection | null;
  };
  value?: string;
}

export interface EditorEvents {
  change: (payload: { html: string }) => void;
  selectionChange: (payload: { ranges: Range[] | null }) => void;
  command: (payload: { command: EditorCommand; value?: string }) => void;
}

export type EditorEventKey = keyof EditorEvents;

/**
 * Custom deserialization function
 * Accepts HTML string and returns modified HTML string
 */
export type DeserializationCustom = (html: string) => string;

/**
 * Custom serialization function
 * Accepts HTML string and returns modified HTML string
 */
export type SerializationCustom = (html: string) => string;
