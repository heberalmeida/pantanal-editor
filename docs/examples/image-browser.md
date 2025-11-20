---
title: Image Browser Examples
description: "Examples of Image Browser implementation"
---

# Image Browser Examples

This page demonstrates how to use the Image Browser feature in Pantanal Editor.

## Basic Image Browser

A simple image browser with read-only access:

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor, type ImageBrowserProps } from '@pantanal/editor';

const content = ref('');

const imageBrowser: ImageBrowserProps = {
  fileTypes: 'jpg,jpeg,png,gif,svg,webp',
  path: '/images',
  transport: {
    read: {
      url: '/api/images/list',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    },
    imageUrl: '/api/images/{0}',
    thumbnailUrl: '/api/images/thumbnails/{0}'
  }
};
</script>

<template>
  <PantanalEditor 
    v-model="content" 
    :image-browser="imageBrowser"
  />
</template>
```

## Full Featured Image Browser

Image browser with upload, delete, create folder, and thumbnail support:

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor, type ImageBrowserProps } from '@pantanal/editor';

const content = ref('');

const imageBrowser: ImageBrowserProps = {
  fileTypes: 'jpg,jpeg,png,gif,svg,webp',
  path: '/uploads/images',
  transport: {
    read: {
      url: '/api/images/list',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: { path: '/uploads/images' }
    },
    upload: {
      url: '/api/images/upload'
    },
    imageUrl: (path, fileName) => {
      return `/api/images${path}/${encodeURIComponent(fileName)}`;
    },
    thumbnailUrl: (path, fileName) => {
      return `/api/images/thumbnails${path}/${encodeURIComponent(fileName)}`;
    },
    destroy: {
      url: '/api/images/delete',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    },
    create: {
      url: '/api/images/create-folder',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    }
  },
  messages: {
    uploadFile: 'Upload Image',
    search: 'Search images...',
    deleteFile: 'Delete "{0}"?'
  }
};
</script>

<template>
  <PantanalEditor 
    v-model="content" 
    :image-browser="imageBrowser"
  />
</template>
```

## Custom Schema

Image browser with custom response parsing:

```vue
<script setup>
const imageBrowser: ImageBrowserProps = {
  fileTypes: 'jpg,jpeg,png',
  path: '/images',
  transport: {
    read: {
      url: '/api/images/list',
      type: 'POST',
      dataType: 'json'
    },
    imageUrl: '/api/images/{0}',
    thumbnailUrl: '/api/images/thumbnails/{0}'
  },
  schema: {
    model: {
      id: 'imageId',
      fields: {
        name: {
          field: 'imageName',
          parse: (value) => value.toUpperCase()
        },
        type: {
          field: 'imageType',
          parse: (value) => value === 'FILE' ? 'f' : 'd'
        },
        size: {
          field: 'imageSize',
          parse: (value) => parseInt(value, 10)
        }
      }
    }
  }
};
</script>
```

## Standalone Image Browser

Using ImageBrowser as a standalone component:

```vue
<script setup>
import { ref } from 'vue';
import { ImageBrowser, type ImageBrowserProps } from '@pantanal/editor';

const imageBrowserProps: ImageBrowserProps = {
  fileTypes: 'jpg,jpeg,png',
  path: '/images',
  transport: {
    read: {
      url: '/api/images/list',
      type: 'POST',
      dataType: 'json'
    },
    imageUrl: '/api/images/{0}',
    thumbnailUrl: '/api/images/thumbnails/{0}'
  }
};

const selectedImage = ref(null);

const handleImageSelect = (item) => {
  selectedImage.value = item;
  console.log('Selected:', item.name);
};
</script>

<template>
  <div>
    <ImageBrowser 
      v-bind="imageBrowserProps"
      @select="handleImageSelect"
      @cancel="() => console.log('Cancelled')"
    />
    <div v-if="selectedImage">
      <p>Selected: {{ selectedImage.name }}</p>
      <img v-if="selectedImage.thumbnailUrl" :src="selectedImage.thumbnailUrl" alt="Preview" />
    </div>
  </div>
</template>
```

## Server Implementation Example

Example server implementation (Node.js/Express):

```javascript
// Express.js example
app.post('/api/images/list', (req, res) => {
  const { path } = req.body;
  
  // Mock image list
  const images = [
    {
      id: '1',
      name: 'photo1.jpg',
      type: 'f',
      size: 102400,
      path: path
    },
    {
      id: '2',
      name: 'photo2.png',
      type: 'f',
      size: 204800,
      path: path
    },
    {
      id: '3',
      name: 'gallery',
      type: 'd',
      path: path
    }
  ];
  
  res.json({ data: images, total: images.length });
});

app.post('/api/images/upload', upload.single('file'), (req, res) => {
  // Handle image upload
  // Generate thumbnail
  res.json({ success: true, file: req.file });
});

app.get('/api/images/thumbnails/:path(*)', (req, res) => {
  // Serve thumbnail image
  const thumbnailPath = path.join(thumbnailsDir, req.params.path);
  res.sendFile(thumbnailPath);
});

app.get('/api/images/:path(*)', (req, res) => {
  // Serve original image
  const imagePath = path.join(imagesDir, req.params.path);
  res.sendFile(imagePath);
});

app.post('/api/images/delete', (req, res) => {
  const { path, name } = req.body;
  // Delete image logic
  res.json({ success: true });
});

app.post('/api/images/create-folder', (req, res) => {
  const { path, name } = req.body;
  // Create folder logic
  res.json({ success: true });
});
```

## Grid vs List View

The ImageBrowser automatically supports both grid and list views:

- **Grid View**: Best for visual browsing with thumbnails
- **List View**: Better for seeing file names and sizes

Users can toggle between views using the view toggle button in the toolbar.

## Suggested Links

- [ImageBrowserProps API](/api/image-browser-props)
- [ImageBrowser Component](/api/image-browser)
- [PantanalEditor API](/api/pantanal-editor)




