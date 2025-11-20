---
title: ToolbarItem Interface
description: "Interface for defining toolbar items"
---

# ToolbarItem

Interface for defining toolbar items and custom tools.

## Interface Definition

```typescript
interface ToolbarItem {
  id: string;                    // Unique identifier
  label: string;                 // Display label
  icon?: string;                 // Icon name from registry
  command?: EditorCommand;       // Built-in command to execute
  kind: ToolbarKind;            // 'button' | 'dropdown' | 'color' | 'separator' | 'custom'
  options?: Array<{ label: string; value: string }>; // For dropdowns
  width?: string;                // Width for dropdowns
  disabled?: boolean;           // Disable the tool
  tooltip?: string;              // Tooltip text
  exec?: (context: ToolExecContext) => void | Promise<void>; // Custom execution
  items?: Array<{ label: string; value: string }>; // For custom dropdowns
  palette?: string | string[];   // Color palette
  columns?: number;              // Color columns
  template?: string;             // HTML template
}
```

## ToolbarKind

```typescript
type ToolbarKind = 'button' | 'dropdown' | 'color' | 'separator' | 'custom';
```

## ToolExecContext

```typescript
interface ToolExecContext {
  editor: {
    getHTML: () => string;           // Get current HTML
    setHTML: (html: string) => void;  // Set HTML content
    exec: (command: EditorCommand, value?: string) => void; // Execute command
    getSelection: () => Selection | null; // Get selection
  };
  value?: string; // Value from dropdown/select
}
```

## Examples

### Basic Button

```typescript
const button: ToolbarItem = {
  id: 'bold',
  label: 'Bold',
  icon: 'bold',
  command: 'bold',
  kind: 'button'
};
```

### Dropdown

```typescript
const dropdown: ToolbarItem = {
  id: 'fontSize',
  label: 'Size',
  kind: 'dropdown',
  width: '120px',
  options: [
    { label: 'Small', value: '2' },
    { label: 'Normal', value: '3' },
    { label: 'Large', value: '4' }
  ]
};
```

### Custom Tool

```typescript
const customTool: ToolbarItem = {
  id: 'insertDate',
  label: 'Date',
  icon: 'link',
  kind: 'custom',
  tooltip: 'Insert current date',
  exec: (context) => {
    const date = new Date().toLocaleDateString();
    context.editor.exec('insertText', date);
  }
};
```

## Suggested Links

- [EditorTool API](/api/editor-tool)
- [EditorCommand Type](/api/types)
- [Custom Tools Guide](/guide/custom-tools)




