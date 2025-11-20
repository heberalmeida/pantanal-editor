---
title: File Browser Examples
description: "Examples of File Browser implementation"
---

# File Browser Examples

This page demonstrates how to use the File Browser feature in Pantanal Editor.

## Basic File Browser

A simple file browser with read-only access:

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor, type FileBrowserProps } from '@pantanal/editor';

const content = ref('');

const fileBrowser: FileBrowserProps = {
  fileTypes: 'jpg,jpeg,png,gif,svg',
  path: '/images',
  transport: {
    read: {
      url: '/api/files/list',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    },
    fileUrl: '/api/files/{0}'
  }
};
</script>

<template>
  <PantanalEditor 
    v-model="content" 
    :file-browser="fileBrowser"
  />
</template>
```

## Full Featured File Browser

File browser with upload, delete, and create folder capabilities:

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor, type FileBrowserProps } from '@pantanal/editor';

const content = ref('');

const fileBrowser: FileBrowserProps = {
  fileTypes: 'jpg,jpeg,png,gif,svg,webp',
  path: '/uploads',
  transport: {
    read: {
      url: '/api/files/list',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: { path: '/uploads' }
    },
    upload: {
      url: '/api/files/upload'
    },
    fileUrl: (path, fileName) => {
      return `/api/files${path}/${encodeURIComponent(fileName)}`;
    },
    destroy: {
      url: '/api/files/delete',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    },
    create: {
      url: '/api/files/create-folder',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    }
  },
  messages: {
    uploadFile: 'Upload File',
    search: 'Search files...',
    deleteFile: 'Delete "{0}"?'
  }
};
</script>

<template>
  <PantanalEditor 
    v-model="content" 
    :file-browser="fileBrowser"
  />
</template>
```

## Custom Schema

File browser with custom response parsing:

```vue
<script setup>
const fileBrowser: FileBrowserProps = {
  fileTypes: 'jpg,jpeg,png',
  path: '/images',
  transport: {
    read: {
      url: '/api/files/list',
      type: 'POST',
      dataType: 'json'
    },
    fileUrl: '/api/files/{0}'
  },
  schema: {
    model: {
      id: 'fileId',
      fields: {
        name: {
          field: 'fileName',
          parse: (value) => value.toUpperCase()
        },
        type: {
          field: 'fileType',
          parse: (value) => value === 'FILE' ? 'f' : 'd'
        },
        size: {
          field: 'fileSize',
          parse: (value) => parseInt(value, 10)
        }
      }
    }
  }
};
</script>
```

## Standalone File Browser

Using FileBrowser as a standalone component:

```vue
<script setup>
import { ref } from 'vue';
import { FileBrowser, type FileBrowserProps } from '@pantanal/editor';

const fileBrowserProps: FileBrowserProps = {
  fileTypes: 'jpg,jpeg,png',
  path: '/images',
  transport: {
    read: {
      url: '/api/files/list',
      type: 'POST',
      dataType: 'json'
    },
    fileUrl: '/api/files/{0}'
  }
};

const selectedFile = ref(null);

const handleFileSelect = (item) => {
  selectedFile.value = item;
  console.log('Selected:', item.name);
};
</script>

<template>
  <div>
    <FileBrowser 
      v-bind="fileBrowserProps"
      @select="handleFileSelect"
      @cancel="() => console.log('Cancelled')"
    />
    <div v-if="selectedFile">
      <p>Selected: {{ selectedFile.name }}</p>
    </div>
  </div>
</template>
```

## Mock Server Example

Example server implementation (Node.js/Express):

```javascript
// Express.js example
app.post('/api/files/list', (req, res) => {
  const { path } = req.body;
  
  // Mock file list
  const files = [
    {
      id: '1',
      name: 'image1.jpg',
      type: 'f',
      size: 102400,
      path: path
    },
    {
      id: '2',
      name: 'subfolder',
      type: 'd',
      path: path
    }
  ];
  
  res.json({ data: files, total: files.length });
});

app.post('/api/files/upload', upload.single('file'), (req, res) => {
  // Handle file upload
  res.json({ success: true, file: req.file });
});

app.post('/api/files/delete', (req, res) => {
  const { path, name } = req.body;
  // Delete file logic
  res.json({ success: true });
});

app.post('/api/files/create', (req, res) => {
  const { path, name } = req.body;
  // Create folder logic
  res.json({ success: true });
});
```

## Suggested Links

- [FileBrowserProps API](/api/file-browser-props)
- [FileBrowser Component](/api/file-browser)
- [PantanalEditor API](/api/pantanal-editor)




