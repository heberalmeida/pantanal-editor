---
title: Custom Tools
description: "Guide to creating custom tools for Pantanal Editor"
---

# Custom Tools

Pantanal Editor allows you to create custom toolbar tools with full control over their behavior, appearance, and functionality.

## Overview

Custom tools are defined using the `ToolbarItem` interface and can be passed to the editor via the `tools` prop. Each custom tool can have:

- **name**: Unique identifier (required)
- **tooltip**: Hover text
- **exec**: Execution function
- **items**: Dropdown items
- **palette**: Color palette
- **columns**: Color grid columns
- **template**: Custom HTML template

## Basic Custom Tool

The simplest custom tool is a button that executes a function:

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor } from '@pantanal/editor';

const content = ref('');

const customTools = [
  {
    id: 'insertHello',
    label: 'Hello',
    icon: 'link',
    kind: 'custom',
    tooltip: 'Insert "Hello World"',
    exec: (context) => {
      context.editor.exec('insertText', 'Hello World');
    }
  }
];
</script>

<template>
  <PantanalEditor v-model="content" :tools="customTools" />
</template>
```

## Tool Execution Context

The `exec` function receives a `ToolExecContext` object with:

```typescript
interface ToolExecContext {
  editor: {
    getHTML: () => string;           // Get current HTML
    setHTML: (html: string) => void;  // Set HTML content
    exec: (command, value?) => void;  // Execute command
    getSelection: () => Selection;    // Get selection
  };
  value?: string; // Value from dropdown/select
}
```

## Dropdown Tools

Create dropdown tools using the `items` property:

```vue
<script setup>
const fontSizeTool = {
  id: 'customFontSize',
  label: 'Size',
  kind: 'custom',
  width: '120px',
  items: [
    { label: 'Small', value: '2' },
    { label: 'Normal', value: '3' },
    { label: 'Large', value: '4' },
  ],
  exec: (context) => {
    if (context.value) {
      context.editor.exec('fontSize', context.value);
    }
  }
};
</script>
```

## Color Palette Tools

Create color picker tools with custom palettes:

```vue
<script setup>
const colorTool = {
  id: 'customColor',
  label: 'Color',
  kind: 'custom',
  palette: ['#000000', '#FF0000', '#00FF00', '#0000FF'],
  columns: 2,
  exec: (context) => {
    if (context.value) {
      context.editor.exec('foreColor', context.value);
    }
  }
};
</script>
```

## Custom Templates

Use HTML templates for complete visual control:

```vue
<script setup>
const templateTool = {
  id: 'customButton',
  template: '<button class="my-btn">Custom</button>',
  exec: (context) => {
    context.editor.exec('insertText', 'Custom content');
  }
};
</script>
```

## Advanced Examples

### Insert Date Tool

```vue
<script setup>
const insertDateTool = {
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
</script>
```

### Word Count Tool

```vue
<script setup>
const wordCountTool = {
  id: 'wordCount',
  label: 'Count',
  icon: 'font',
  kind: 'custom',
  tooltip: 'Show word count',
  exec: (context) => {
    const html = context.editor.getHTML();
    const text = html.replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    alert(`Word count: ${words.length}`);
  }
};
</script>
```

### Insert Code Block

```vue
<script setup>
const codeBlockTool = {
  id: 'insertCode',
  label: 'Code',
  icon: 'link',
  kind: 'custom',
  tooltip: 'Insert code block',
  exec: (context) => {
    const selection = context.editor.getSelection();
    if (selection && selection.toString()) {
      const code = `<pre><code>${selection.toString()}</code></pre>`;
      context.editor.exec('insertHTML', code);
    }
  }
};
</script>
```

## Best Practices

1. **Always provide tooltips** for better UX
2. **Use icons** from the icon registry when possible
3. **Handle edge cases** (empty selection, etc.)
4. **Keep exec functions simple** and focused
5. **Use async/await** for async operations

## Reserved Tool Names

The following tool names are reserved:
- `undo`
- `redo`

## Suggested Links

- [EditorTool API](/api/editor-tool)
- [Examples](/examples/custom-tools)
- [PantanalEditor API](/api/pantanal-editor)




