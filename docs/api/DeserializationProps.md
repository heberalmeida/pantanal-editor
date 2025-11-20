# DeserializationProps API

## deserializationCustom `Function`

A callback that allows custom deserialization. The `deserializationCustom` method accepts only strings as parameters and returns strings as modified content.

### Signature

```typescript
type DeserializationCustom = (html: string) => string;
```

### Description

The `deserializationCustom` function is called whenever HTML content needs to be loaded into the editor. This includes:

- Initial content loading via `modelValue` prop
- When `setHTML()` method is called
- When content is pasted (if `keepPasteFormatting` is `true`)

This allows you to transform, sanitize, or normalize HTML before it's rendered in the editor.

### Parameters

- `html: string` - The raw HTML string to be processed

### Returns

- `string` - The modified HTML string that will be inserted into the editor

### Example: Sanitize HTML

```vue
<template>
  <PantanalEditor
    v-model="content"
    :deserialization-custom="sanitizeHTML"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PantanalEditor } from '@pantanal/editor';

const content = ref('<p>Hello <script>alert("xss")</script> World</p>');

const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Remove script tags
  div.querySelectorAll('script').forEach(el => el.remove());
  
  // Remove event handlers
  div.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return div.innerHTML;
};
</script>
```

### Example: Convert Legacy Format

```vue
<script setup lang="ts">
const convertLegacyFormat = (html: string): string => {
  return html
    .replace(/<font\s+color="([^"]+)">/gi, '<span style="color: $1">')
    .replace(/<font\s+size="([^"]+)">/gi, '<span style="font-size: $1">')
    .replace(/<\/font>/gi, '</span>');
};
</script>
```

### Example: Process Pasted Content

```vue
<script setup lang="ts">
const processPastedContent = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Convert relative URLs to absolute
  div.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http')) {
      link.setAttribute('href', `https://example.com${href}`);
    }
  });
  
  // Resize large images
  div.querySelectorAll('img').forEach(img => {
    const width = parseInt(img.getAttribute('width') || '0');
    if (width > 800) {
      img.setAttribute('width', '800');
      img.setAttribute('style', 'max-width: 100%; height: auto;');
    }
  });
  
  return div.innerHTML;
};
</script>
```

### Best Practices

1. **Always sanitize user input** - Remove dangerous tags and attributes to prevent XSS attacks
2. **Use DOM manipulation** - Create a temporary `div` element to safely parse and modify HTML
3. **Preserve structure** - Ensure the returned HTML is valid and well-formed
4. **Handle edge cases** - Consider empty strings, malformed HTML, and special characters
5. **Performance** - Keep transformations efficient, especially for large documents

### Related

- [`SerializationProps`](./SerializationProps.md) - Custom serialization when saving content
- [`PasteCleanupProps`](./PasteCleanupProps.md) - Control paste behavior





