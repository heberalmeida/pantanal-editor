# SerializationProps API

## serializationCustom `Function`

A callback that allows custom serialization. The `serializationCustom` method accepts only strings as parameters and returns strings as modified content.

### Signature

```typescript
type SerializationCustom = (html: string) => string;
```

### Description

The `serializationCustom` function is called whenever HTML content needs to be saved or emitted from the editor. This includes:

- When content changes and `update:modelValue` is emitted
- When `getHTML()` is called internally
- Before content is synced to the parent component

This allows you to clean, normalize, or transform HTML before it's saved to your data model or sent to a server.

### Parameters

- `html: string` - The raw HTML string from the editor

### Returns

- `string` - The modified HTML string that will be emitted or returned

### Example: Clean Formatting

```vue
<template>
  <PantanalEditor
    v-model="content"
    :serialization-custom="cleanFormatting"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PantanalEditor } from '@pantanal/editor';

const content = ref('');

const cleanFormatting = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Remove all inline styles
  div.querySelectorAll('*').forEach(el => {
    el.removeAttribute('style');
  });
  
  // Normalize empty paragraphs
  div.querySelectorAll('p').forEach(p => {
    if (!p.textContent?.trim()) {
      p.innerHTML = '<br>';
    }
  });
  
  return div.innerHTML;
};
</script>
```

### Example: Strip Unwanted Tags

```vue
<script setup lang="ts">
const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'img'];
const allowedAttributes = {
  a: ['href', 'title'],
  img: ['src', 'alt', 'width', 'height'],
};

const stripUnwantedTags = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Remove disallowed tags
  div.querySelectorAll('*').forEach(el => {
    if (!allowedTags.includes(el.tagName.toLowerCase())) {
      el.replaceWith(...Array.from(el.childNodes));
    } else {
      // Remove disallowed attributes
      const allowedAttrs = allowedAttributes[el.tagName.toLowerCase()] || [];
      Array.from(el.attributes).forEach(attr => {
        if (!allowedAttrs.includes(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    }
  });
  
  return div.innerHTML;
};
</script>
```

### Example: Minify HTML

```vue
<script setup lang="ts">
const minifyHTML = (html: string): string => {
  return html
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .replace(/>\s+</g, '><')        // Remove spaces between tags
    .replace(/\s+>/g, '>')          // Remove trailing whitespace
    .replace(/<\s+/g, '<')          // Remove leading whitespace
    .trim();
};
</script>
```

### Example: Convert to Legacy Format

```vue
<script setup lang="ts">
const convertToLegacyFormat = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Convert color styles to <font> tags
  div.querySelectorAll('*[style*="color"]').forEach(el => {
    const style = el.getAttribute('style');
    const colorMatch = style?.match(/color:\s*([^;]+)/);
    if (colorMatch) {
      const color = colorMatch[1].trim();
      const font = document.createElement('font');
      font.setAttribute('color', color);
      font.innerHTML = el.innerHTML;
      el.replaceWith(font);
      el.removeAttribute('style');
    }
  });
  
  return div.innerHTML;
};
</script>
```

### Best Practices

1. **Clean before saving** - Remove unnecessary formatting, styles, or attributes
2. **Normalize structure** - Ensure consistent HTML structure across saves
3. **Validate output** - Make sure the returned HTML is valid and well-formed
4. **Preserve content** - Don't remove actual content, only formatting
5. **Performance** - Optimize for frequent calls during typing

### Related

- [`DeserializationProps`](./DeserializationProps.md) - Custom deserialization when loading content
- [`PasteCleanupProps`](./PasteCleanupProps.md) - Control paste behavior





