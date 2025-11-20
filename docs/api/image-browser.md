---
title: ImageBrowser Component
description: "API Reference | ImageBrowser Component"
api_reference: true
slug: api_imagebrowser
---

# ImageBrowser

Standalone image browser component for browsing and managing images with thumbnail preview support.

## Props

All props from [ImageBrowserProps](/api/image-browser-props) are supported.

## Events

### select

Emitted when an image is selected.

```vue
<ImageBrowser @select="handleImageSelect" />
```

```typescript
const handleImageSelect = (item: ImageBrowserItem) => {
  console.log('Selected image:', item.name);
  console.log('Image path:', item.path);
  console.log('Thumbnail URL:', item.thumbnailUrl);
};
```

### cancel

Emitted when the user cancels the image selection.

```vue
<ImageBrowser @cancel="handleCancel" />
```

## Features

- **Grid and List Views** - Toggle between grid and list view modes
- **Thumbnail Preview** - Display image thumbnails for quick browsing
- **Upload Support** - Upload new images directly from the browser
- **Folder Management** - Create folders and navigate directory structure
- **Search and Sort** - Search images and sort by name or size
- **Delete Support** - Remove images and folders

## Usage

```vue
<script setup>
import { ref } from 'vue';
import { ImageBrowser, type ImageBrowserProps } from '@pantanal/editor';

const imageBrowserProps: ImageBrowserProps = {
  fileTypes: 'jpg,jpeg,png,gif',
  path: '/images',
  transport: {
    read: {
      url: '/api/images/list',
      type: 'POST',
      dataType: 'json'
    },
    thumbnailUrl: '/api/images/thumbnails/{0}',
    imageUrl: '/api/images/{0}'
  }
};

const handleImageSelect = (item) => {
  console.log('Selected:', item.name);
};
</script>

<template>
  <ImageBrowser 
    v-bind="imageBrowserProps"
    @select="handleImageSelect"
    @cancel="() => console.log('Cancelled')"
  />
</template>
```

## View Modes

The ImageBrowser supports two view modes:

- **Grid View** (default) - Displays images in a grid with thumbnails
- **List View** - Displays images in a list format

Users can toggle between views using the view toggle button.

## Suggested Links

- [ImageBrowserProps API](/api/image-browser-props)
- [PantanalEditor API](/api/pantanal-editor)
- [Examples](/examples/image-browser)




