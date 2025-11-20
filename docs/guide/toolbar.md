---
title: Toolbar
description: "Toolbar configuration guide"
---

# Toolbar

The toolbar provides quick access to formatting commands. You can customize which tools are displayed and create custom tools.

## Default Tools

By default, the editor shows all available tools:

- **Undo/Redo** - History navigation
- **Font Name** - Font family selection
- **Font Size** - Text size selection
- **Bold, Italic, Underline, Strikethrough** - Text formatting
- **Text Color, Background Color** - Color pickers
- **Bullet List, Numbered List** - Lists
- **Align Left, Center, Right, Justify** - Text alignment
- **Link, Image** - Media insertion
- **Clear Formatting** - Remove formatting

## Custom Toolbar

Specify which tools to show using the `toolbar` prop:

```vue
<script setup>
const toolbar = [
  'bold',
  'italic',
  'underline',
  '|', // separator
  'insertOrderedList',
  'insertUnorderedList'
];
</script>

<template>
  <PantanalEditor :toolbar="toolbar" />
</template>
```

## Available Tool IDs

- `undo`, `redo`
- `fontName`, `fontSize`
- `bold`, `italic`, `underline`, `strikeThrough`
- `foreColor`, `backColor`
- `insertUnorderedList`, `insertOrderedList`
- `justifyLeft`, `justifyCenter`, `justifyRight`, `justifyFull`
- `createLink`, `insertImage`
- `clearFormatting`

## Separators

Use `|` or `'separator'` to add visual separators:

```vue
const toolbar = [
  'bold',
  'italic',
  '|',
  'insertOrderedList'
];
```

## Custom Tools

Add custom tools using the `tools` prop:

```vue
<script setup>
const customTools = [
  {
    id: 'insertDate',
    label: 'Date',
    icon: 'link',
    kind: 'custom',
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

See [Custom Tools](/guide/custom-tools) for more details.

## Suggested Links

- [Custom Tools](/guide/custom-tools)
- [EditorTool API](/api/editor-tool)
- [Examples](/examples/)




