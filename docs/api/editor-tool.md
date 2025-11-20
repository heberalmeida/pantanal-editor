---
title: EditorTool API
description: "API Reference | EditorTool Component"
api_reference: true
slug: api_editortool
---

# EditorTool

The `EditorTool` component allows you to create custom toolbar tools with full control over their behavior and appearance.

## Directive

`pantanal-editor-tool` (for Vue directive usage)

## Props

### name `String`

When you specify a tool as an object, you are required to supply a `name` for that tool. The names `undo` and `redo` are reserved tool names.

```typescript
{
  id: 'myCustomTool',
  name: 'myCustomTool',
  label: 'Custom Tool',
  kind: 'custom',
  exec: (context) => {
    // Tool execution logic
  }
}
```

### tooltip `String`

The text which will be displayed when the user hovers over the tool button with the mouse.

```typescript
{
  id: 'bold',
  tooltip: 'Make text bold (Ctrl+B)',
  // ...
}
```

### exec `Function`

The JavaScript function which will be executed when the user clicks the tool button. The function receives a `ToolExecContext` object with editor API methods.

```typescript
{
  id: 'insertDate',
  exec: async (context) => {
    const date = new Date().toLocaleDateString();
    context.editor.exec('insertText', date);
  }
}
```

#### ToolExecContext

```typescript
interface ToolExecContext {
  editor: {
    getHTML: () => string;           // Get current editor HTML
    setHTML: (html: string) => void; // Set editor HTML
    exec: (command: EditorCommand, value?: string) => void; // Execute command
    getSelection: () => Selection | null; // Get current selection
  };
  value?: string; // Value from dropdown/select tools
}
```

### items `Array`

Specifies the list items which are displayed by certain tools—for example, `fontName`, `fontSize`, or `formatting`.

```typescript
{
  id: 'fontSize',
  kind: 'custom',
  items: [
    { label: 'Small', value: '2' },
    { label: 'Normal', value: '3' },
    { label: 'Large', value: '4' },
    { label: 'Huge', value: '5' },
  ],
  exec: (context) => {
    if (context.value) {
      context.editor.exec('fontSize', context.value);
    }
  }
}
```

### palette `String | Array`

Specifies the color palette for the `foreColor` and `backColor` tools. Can be a predefined palette name or an array of color values.

```typescript
// Predefined palette
{
  id: 'foreColor',
  palette: 'websafe', // or 'basic', 'extended'
}

// Custom palette
{
  id: 'foreColor',
  palette: ['#000000', '#FF0000', '#00FF00', '#0000FF'],
}
```

### columns `Number`

When a list of colors is defined, specifies the number of color columns for `foreColor` and `backColor` tools.

```typescript
{
  id: 'foreColor',
  palette: ['#000000', '#FF0000', '#00FF00', '#0000FF'],
  columns: 4, // Display colors in 4 columns
}
```

### template `String`

The HTML template for rendering the given tool. Allows complete customization of the tool's appearance.

```typescript
{
  id: 'customButton',
  template: '<button class="my-custom-btn">Custom</button>',
  exec: (context) => {
    // Handle click
  }
}
```

## ToolbarItem Interface

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

## Examples

### Basic Custom Tool

```vue
<script setup>
import { PantanalEditor } from '@pantanal/editor';

const customTools = [
  {
    id: 'insertDate',
    label: 'Insert Date',
    icon: 'calendar',
    kind: 'custom',
    tooltip: 'Insert current date',
    exec: (context) => {
      const date = new Date().toLocaleDateString();
      context.editor.exec('insertText', date);
    }
  }
];
</script>

<template>
  <PantanalEditor :tools="customTools" />
</template>
```

### Custom Dropdown Tool

```vue
<script setup>
const fontSizeTool = {
  id: 'customFontSize',
  label: 'Size',
  kind: 'custom',
  items: [
    { label: '8pt', value: '1' },
    { label: '10pt', value: '2' },
    { label: '12pt', value: '3' },
    { label: '14pt', value: '4' },
    { label: '18pt', value: '5' },
    { label: '24pt', value: '6' },
  ],
  exec: (context) => {
    if (context.value) {
      context.editor.exec('fontSize', context.value);
    }
  }
};
</script>
```

### Custom Template Tool

```vue
<script setup>
const templateTool = {
  id: 'customTemplate',
  template: `
    <button class="custom-tool-btn" style="padding: 8px 16px; background: #ff6b35; color: white; border: none; border-radius: 4px;">
      Custom Button
    </button>
  `,
  exec: (context) => {
    context.editor.exec('insertText', 'Custom content inserted!');
  }
};
</script>
```

### Color Palette Tool

```vue
<script setup>
const colorTool = {
  id: 'customColor',
  label: 'Text Color',
  kind: 'custom',
  palette: ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'],
  columns: 3,
  exec: (context) => {
    if (context.value) {
      context.editor.exec('foreColor', context.value);
    }
  }
};
</script>
```

## Suggested Links

- [PantanalEditor Component](/api/pantanal-editor)
- [Toolbar Configuration](/guide/toolbar)
- [Custom Tools Guide](/guide/custom-tools)
- [Examples](/examples/custom-tools)



