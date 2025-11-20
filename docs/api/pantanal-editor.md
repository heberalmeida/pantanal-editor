---
title: PantanalEditor API
description: "API Reference | PantanalEditor Component"
api_reference: true
slug: api_pantanaleditor
---

# PantanalEditor

The main editor component that provides a rich text editing experience.

## Props

### modelValue `string`

The HTML content of the editor. Supports two-way binding with `v-model`.

```vue
<PantanalEditor v-model="content" />
```

### placeholder `string`

Placeholder text displayed when the editor is empty.

**Default:** `'Start writing...'`

```vue
<PantanalEditor placeholder="Enter your text here..." />
```

### readonly `boolean`

Makes the editor read-only. Toolbar is disabled when readonly.

**Default:** `false`

```vue
<PantanalEditor :readonly="true" />
```

### toolbar `string[]`

Array of tool IDs to display in the toolbar. If not provided, all default tools are shown.

```vue
<PantanalEditor :toolbar="['bold', 'italic', 'underline']" />
```

### height `string`

Height of the editor content area.

**Default:** `'480px'`

```vue
<PantanalEditor height="600px" />
```

### minHeight `string`

Minimum height of the editor content area.

**Default:** `'280px'`

```vue
<PantanalEditor min-height="200px" />
```

### keepPasteFormatting `boolean`

Whether to preserve formatting when pasting content.

**Default:** `true`

```vue
<PantanalEditor :keep-paste-formatting="false" />
```

### plugins `EditorPlugin[]`

Array of plugins to extend editor functionality.

```vue
<script setup>
import { defineEditorPlugin } from '@pantanal/editor';

const myPlugin = defineEditorPlugin({
  onInit: () => console.log('Editor initialized'),
  onDestroy: () => console.log('Editor destroyed'),
});
</script>

<template>
  <PantanalEditor :plugins="[myPlugin]" />
</template>
```

### deserializationCustom `Function`

Custom function to process HTML when loading content into the editor.

```vue
<script setup>
const sanitizeHTML = (html) => {
  // Remove script tags
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('script').forEach(el => el.remove());
  return div.innerHTML;
};
</script>

<template>
  <PantanalEditor :deserialization-custom="sanitizeHTML" />
</template>
```

### serializationCustom `Function`

Custom function to process HTML when getting content from the editor.

```vue
<script setup>
const cleanFormatting = (html) => {
  // Remove all inline styles
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('*').forEach(el => el.removeAttribute('style'));
  return div.innerHTML;
};
</script>

<template>
  <PantanalEditor :serialization-custom="cleanFormatting" />
</template>
```

### fileBrowser `FileBrowserProps`

Configuration for the file browser feature. When configured, clicking the image button opens a file browser dialog.

```vue
<script setup>
import { PantanalEditor, type FileBrowserProps } from '@pantanal/editor';

const fileBrowser: FileBrowserProps = {
  fileTypes: 'jpg,jpeg,png,gif',
  path: '/images',
  transport: {
    read: {
      url: '/api/files/list',
      type: 'POST',
      dataType: 'json'
    },
    upload: {
      url: '/api/files/upload'
    },
    fileUrl: '/api/files/{0}'
  }
};
</script>

<template>
  <PantanalEditor :file-browser="fileBrowser" />
</template>
```

See [FileBrowserProps API](/api/file-browser-props) for complete configuration options.

### imageBrowser `ImageBrowserProps`

Configuration for the image browser feature. When configured, clicking the image button opens an image browser dialog with thumbnail preview support. The image browser is preferred over the file browser when both are configured.

```vue
<script setup>
import { PantanalEditor, type ImageBrowserProps } from '@pantanal/editor';

const imageBrowser: ImageBrowserProps = {
  fileTypes: 'jpg,jpeg,png,gif,svg,webp',
  path: '/images',
  transport: {
    read: {
      url: '/api/images/list',
      type: 'POST',
      dataType: 'json'
    },
    upload: {
      url: '/api/images/upload'
    },
    imageUrl: '/api/images/{0}',
    thumbnailUrl: '/api/images/thumbnails/{0}'
  }
};
</script>

<template>
  <PantanalEditor :image-browser="imageBrowser" />
</template>
```

See [ImageBrowserProps API](/api/image-browser-props) for complete configuration options.

### immutables `ImmutablesProps`

Configuration for immutable elements. Immutable elements are parts of the content that cannot be edited but can be serialized and deserialized with custom logic.

```vue
<script setup>
import { PantanalEditor, type ImmutablesProps } from '@pantanal/editor';

const immutables: ImmutablesProps = {
  deserialization: (viewElement, immutableElement) => {
    // Custom deserialization logic
    immutableElement.setAttribute('contenteditable', 'false');
    return immutableElement;
  },
  serialization: (immutableElement) => {
    // Custom serialization logic
    return immutableElement.outerHTML;
  }
};
</script>

<template>
  <PantanalEditor :immutables="immutables" />
</template>
```

See [ImmutablesProps API](/api/immutables-props) for complete configuration options.

## Events

### update:modelValue

Emitted when the editor content changes.

```vue
<PantanalEditor @update:model-value="handleUpdate" />
```

### change

Emitted when the editor content changes (same as `update:modelValue`).

```vue
<PantanalEditor @change="handleChange" />
```

### ready

Emitted when the editor is initialized and ready.

```vue
<PantanalEditor @ready="handleReady" />
```

## Methods

### getHTML()

Returns the current HTML content of the editor.

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor } from '@pantanal/editor';

const editorRef = ref();

const getContent = () => {
  const html = editorRef.value?.getHTML();
  console.log(html);
};
</script>

<template>
  <PantanalEditor ref="editorRef" />
  <button @click="getContent">Get HTML</button>
</template>
```

### setHTML(html: string)

Sets the HTML content of the editor.

```vue
<script setup>
const editorRef = ref();

const setContent = () => {
  editorRef.value?.setHTML('<p>New content</p>');
};
</script>
```

### exec(command: EditorCommand, value?: string)

Executes an editor command programmatically.

```vue
<script setup>
const editorRef = ref();

const makeBold = () => {
  editorRef.value?.exec('bold');
};
</script>
```

### on(event: string, handler: Function)

Registers an event listener.

```vue
<script setup>
import { onMounted } from 'vue';

const editorRef = ref();

onMounted(() => {
  editorRef.value?.on('change', ({ html }) => {
    console.log('Content changed:', html);
  });
});
</script>
```

## Examples

### Basic Usage

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor } from '@pantanal/editor';

const content = ref('<p>Hello World</p>');
</script>

<template>
  <PantanalEditor v-model="content" />
</template>
```

### Custom Toolbar

```vue
<script setup>
const toolbar = ['bold', 'italic', 'underline', '|', 'insertOrderedList', 'insertUnorderedList'];
</script>

<template>
  <PantanalEditor :toolbar="toolbar" />
</template>
```

### Form Integration

```vue
<script setup>
import { ref } from 'vue';

const formData = ref({
  title: '',
  content: '',
});

const handleSubmit = () => {
  console.log('Content:', formData.value.content);
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.title" placeholder="Title" />
    <PantanalEditor v-model="formData.content" />
    <button type="submit">Submit</button>
  </form>
</template>
```

## Suggested Links

- [EditorTool Component](/api/editor-tool)
- [Getting Started](/guide/)
- [Examples](/examples/)

