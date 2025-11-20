---
title: FileBrowser Component
description: "API Reference | FileBrowser Component"
api_reference: true
slug: api_filebrowser
---

# FileBrowser

Standalone file browser component for browsing and managing files.

## Props

All props from [FileBrowserProps](/api/file-browser-props) are supported.

## Events

### select

Emitted when a file is selected.

```vue
<FileBrowser @select="handleFileSelect" />
```

```typescript
const handleFileSelect = (item: FileBrowserItem) => {
  console.log('Selected file:', item.name);
  console.log('File path:', item.path);
  console.log('File size:', item.size);
};
```

### cancel

Emitted when the user cancels the file selection.

```vue
<FileBrowser @cancel="handleCancel" />
```

## Usage

```vue
<script setup>
import { ref } from 'vue';
import { FileBrowser, type FileBrowserProps } from '@pantanal/editor';

const fileBrowserProps: FileBrowserProps = {
  fileTypes: 'jpg,jpeg,png,gif',
  path: '/images',
  transport: {
    read: {
      url: '/api/files/list',
      type: 'POST',
      dataType: 'json'
    }
  }
};

const handleFileSelect = (item) => {
  console.log('Selected:', item.name);
};
</script>

<template>
  <FileBrowser 
    v-bind="fileBrowserProps"
    @select="handleFileSelect"
    @cancel="() => console.log('Cancelled')"
  />
</template>
```

## Suggested Links

- [FileBrowserProps API](/api/file-browser-props)
- [PantanalEditor API](/api/pantanal-editor)
- [Examples](/examples/file-browser)




