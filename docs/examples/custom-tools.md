---
title: Custom Tools Examples
description: "Examples of custom tools implementation"
---

# Custom Tools Examples

This page demonstrates various ways to create and use custom tools in Pantanal Editor.

## Basic Custom Tool

A simple custom tool that inserts text:

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor } from '@pantanal/editor';

const content = ref('');

const customTools = [
  {
    id: 'insertGreeting',
    label: 'Hello',
    icon: 'link',
    kind: 'custom',
    tooltip: 'Insert greeting',
    exec: (context) => {
      context.editor.exec('insertText', 'Hello, World!');
    }
  }
];
</script>

<template>
  <PantanalEditor v-model="content" :tools="customTools" />
</template>
```

## Insert Date Tool

A tool that inserts the current date:

```vue
<script setup>
const insertDateTool = {
  id: 'insertDate',
  label: 'Date',
  icon: 'calendar',
  kind: 'custom',
  tooltip: 'Insert current date',
  exec: (context) => {
    const date = new Date();
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    context.editor.exec('insertText', formatted);
  }
};
</script>
```

## Custom Font Size Dropdown

A custom dropdown for font sizes:

```vue
<script setup>
const fontSizeTool = {
  id: 'customFontSize',
  label: 'Font Size',
  kind: 'custom',
  width: '120px',
  items: [
    { label: '8pt', value: '1' },
    { label: '10pt', value: '2' },
    { label: '12pt', value: '3' },
    { label: '14pt', value: '4' },
    { label: '18pt', value: '5' },
    { label: '24pt', value: '6' },
    { label: '36pt', value: '7' },
  ],
  exec: (context) => {
    if (context.value) {
      context.editor.exec('fontSize', context.value);
    }
  }
};
</script>
```

## Insert Image Tool

A tool that prompts for an image URL and inserts it:

```vue
<script setup>
const insertImageTool = {
  id: 'insertImage',
  label: 'Image',
  icon: 'image',
  kind: 'custom',
  tooltip: 'Insert image from URL',
  exec: async (context) => {
    const url = prompt('Enter image URL:');
    if (url) {
      const img = `<img src="${url}" alt="Image" style="max-width: 100%;" />`;
      const html = context.editor.getHTML();
      context.editor.setHTML(html + img);
    }
  }
};
</script>
```

## Color Palette Tool

A custom color picker with predefined colors:

```vue
<script setup>
const colorPalette = {
  id: 'customColor',
  label: 'Text Color',
  kind: 'custom',
  palette: [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
  ],
  columns: 6,
  exec: (context) => {
    if (context.value) {
      context.editor.exec('foreColor', context.value);
    }
  }
};
</script>
```

## Word Count Tool

A tool that shows word count in an alert:

```vue
<script setup>
const wordCountTool = {
  id: 'wordCount',
  label: 'Word Count',
  icon: 'font',
  kind: 'custom',
  tooltip: 'Show word count',
  exec: (context) => {
    const html = context.editor.getHTML();
    const text = html.replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    alert(`Word count: ${words.length}`);
  }
};
</script>
```

## Clear Formatting Tool

A tool that removes all formatting from selected text:

```vue
<script setup>
const clearFormattingTool = {
  id: 'clearFormat',
  label: 'Clear',
  icon: 'clear',
  kind: 'custom',
  tooltip: 'Clear all formatting',
  exec: (context) => {
    context.editor.exec('removeFormat');
    context.editor.exec('unlink');
  }
};
</script>
```

## Insert Code Block Tool

A tool that wraps selected text in a code block:

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
    } else {
      context.editor.exec('insertHTML', '<pre><code></code></pre>');
    }
  }
};
</script>
```

## Custom Template Tool

A tool with a custom HTML template:

```vue
<script setup>
const templateTool = {
  id: 'customTemplate',
  template: `
    <button class="custom-tool" style="
      padding: 6px 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    ">
      ✨ Custom
    </button>
  `,
  exec: (context) => {
    context.editor.exec('insertText', 'Custom content inserted!');
  }
};
</script>
```

## Complete Example

A full example with multiple custom tools:

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor } from '@pantanal/editor';

const content = ref('<p>Start editing...</p>');

const customTools = [
  {
    id: 'insertDate',
    label: 'Date',
    icon: 'link',
    kind: 'custom',
    tooltip: 'Insert current date',
    exec: (context) => {
      const date = new Date().toLocaleDateString();
      context.editor.exec('insertText', date);
    }
  },
  {
    id: 'wordCount',
    label: 'Count',
    icon: 'font',
    kind: 'custom',
    tooltip: 'Show word count',
    exec: (context) => {
      const html = context.editor.getHTML();
      const text = html.replace(/<[^>]*>/g, '').trim();
      const words = text.split(/\s+/).filter(w => w.length > 0);
      alert(`Words: ${words.length}`);
    }
  },
  {
    id: 'customFontSize',
    label: 'Size',
    kind: 'custom',
    width: '100px',
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
  }
];
</script>

<template>
  <div>
    <PantanalEditor v-model="content" :tools="customTools" />
    <div style="margin-top: 1rem;">
      <pre>{{ content }}</pre>
    </div>
  </div>
</template>
```

## Suggested Links

- [EditorTool API](/api/editor-tool)
- [Custom Tools Guide](/guide/custom-tools)
- [PantanalEditor API](/api/pantanal-editor)




