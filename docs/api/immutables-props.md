---
title: ImmutablesProps API
description: "API Reference | ImmutablesProps"
api_reference: true
slug: api_immutablesprops
---

# ImmutablesProps

Configuration interface for immutable elements in Pantanal Editor. Immutable elements are parts of the content that cannot be edited but can be serialized and deserialized with custom logic.

## Overview

Immutables allow you to mark certain elements in the editor as non-editable while preserving their structure and allowing custom serialization/deserialization. This is useful for:

- Embedding widgets or components
- Preserving specific HTML structures
- Protecting certain content from editing
- Custom data serialization

## Props

### deserialization `Function`

A callback function that allows custom deserialization of an immutable element when loading content into the editor.

**Signature:**
```typescript
(viewElement: HTMLElement, immutableElement: HTMLElement) => HTMLElement
```

**Parameters:**
- `viewElement` - The DOM element which represents the immutable element in the HTML view
- `immutableElement` - The immutable DOM element which will be restored

**Returns:** The deserialized element (usually the same or modified `immutableElement`)

**Example:**
```vue
<script setup>
import { PantanalEditor, type ImmutablesProps } from '@pantanal/editor';

const immutables: ImmutablesProps = {
  deserialization: (viewElement, immutableElement) => {
    // Custom deserialization logic
    const widgetId = viewElement.getAttribute('data-widget-id');
    if (widgetId) {
      immutableElement.setAttribute('data-widget-id', widgetId);
      immutableElement.setAttribute('contenteditable', 'false');
      immutableElement.classList.add('widget');
    }
    return immutableElement;
  }
};
</script>

<template>
  <PantanalEditor :immutables="immutables" />
</template>
```

### serialization `String | Function`

The template string or callback function that allows custom serialization of an immutable element when saving content from the editor.

**As Function:**
```typescript
(immutableElement: HTMLElement) => string
```

**Parameters:**
- `immutableElement` - The DOM element to serialize

**Returns:** The HTML string representation of the element

**Example:**
```vue
<script setup>
const immutables: ImmutablesProps = {
  serialization: (immutableElement) => {
    // Extract data and create custom HTML
    const widgetId = immutableElement.getAttribute('data-widget-id');
    const widgetType = immutableElement.getAttribute('data-widget-type');
    
    // Return custom HTML structure
    return `<div data-widget-id="${widgetId}" data-widget-type="${widgetType}" data-immutable="true">
      ${immutableElement.innerHTML}
    </div>`;
  }
};
</script>
```

**As String (Template):**
```vue
<script setup>
const immutables: ImmutablesProps = {
  // Simple template string (for basic cases)
  serialization: '<div data-immutable="true">#{content}</div>'
};
</script>
```

## Complete Example

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor, type ImmutablesProps } from '@pantanal/editor';

const content = ref(`
  <p>Regular editable text.</p>
  <div data-immutable="true" data-widget-id="123" data-widget-type="chart">
    <h3>Chart Widget</h3>
    <p>This is a chart widget that cannot be edited.</p>
  </div>
  <p>More editable text.</p>
`);

const immutables: ImmutablesProps = {
  deserialization: (viewElement, immutableElement) => {
    // When loading, mark widget elements as immutable
    if (viewElement.hasAttribute('data-widget-id')) {
      immutableElement.setAttribute('contenteditable', 'false');
      immutableElement.classList.add('widget-immutable');
      
      // Restore widget data
      const widgetId = viewElement.getAttribute('data-widget-id');
      const widgetType = viewElement.getAttribute('data-widget-type');
      
      if (widgetId) {
        immutableElement.setAttribute('data-widget-id', widgetId);
      }
      if (widgetType) {
        immutableElement.setAttribute('data-widget-type', widgetType);
      }
    }
    
    return immutableElement;
  },
  
  serialization: (immutableElement) => {
    // When saving, create clean HTML structure
    const widgetId = immutableElement.getAttribute('data-widget-id');
    const widgetType = immutableElement.getAttribute('data-widget-type');
    const content = immutableElement.innerHTML;
    
    return `<div data-immutable="true" data-widget-id="${widgetId}" data-widget-type="${widgetType}">
      ${content}
    </div>`;
  }
};
</script>

<template>
  <PantanalEditor 
    v-model="content" 
    :immutables="immutables"
  />
</template>

<style>
.widget-immutable {
  border: 2px dashed #ccc;
  padding: 1rem;
  margin: 1rem 0;
  background: #f9f9f9;
}
</style>
```

## Marking Elements as Immutable

Elements can be marked as immutable in several ways:

### 1. Using `data-immutable` Attribute

```html
<div data-immutable="true">
  This content cannot be edited
</div>
```

### 2. Programmatically via API

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { PantanalEditor } from '@pantanal/editor';

const editorRef = ref<InstanceType<typeof PantanalEditor> | null>(null);

onMounted(() => {
  // Get an element and make it immutable
  const element = document.querySelector('.my-widget');
  if (element && editorRef.value) {
    editorRef.value.makeImmutable(element as HTMLElement);
  }
});
</script>

<template>
  <PantanalEditor ref="editorRef" />
</template>
```

### 3. Check if Element is Immutable

```vue
<script setup>
const checkImmutable = () => {
  const element = document.querySelector('.my-element');
  if (element && editorRef.value) {
    const isImmutable = editorRef.value.isImmutable(element as HTMLElement);
    console.log('Is immutable:', isImmutable);
  }
};
</script>
```

## Use Cases

### 1. Embedding Widgets

```vue
<script setup>
const immutables: ImmutablesProps = {
  deserialization: (viewElement, immutableElement) => {
    if (viewElement.classList.contains('widget')) {
      // Initialize widget when loading
      const widgetId = viewElement.getAttribute('data-id');
      // Initialize your widget here
      return immutableElement;
    }
    return immutableElement;
  },
  serialization: (immutableElement) => {
    if (immutableElement.classList.contains('widget')) {
      // Save widget state
      const widgetId = immutableElement.getAttribute('data-id');
      return `<div class="widget" data-id="${widgetId}" data-immutable="true">
        ${immutableElement.innerHTML}
      </div>`;
    }
    return immutableElement.outerHTML;
  }
};
</script>
```

### 2. Preserving Specific HTML Structures

```vue
<script setup>
const immutables: ImmutablesProps = {
  deserialization: (viewElement, immutableElement) => {
    // Preserve specific attributes
    if (viewElement.hasAttribute('data-preserve')) {
      const preserveData = viewElement.getAttribute('data-preserve');
      immutableElement.setAttribute('data-preserve', preserveData);
      immutableElement.setAttribute('contenteditable', 'false');
    }
    return immutableElement;
  },
  serialization: (immutableElement) => {
    // Ensure data-preserve is maintained
    if (immutableElement.hasAttribute('data-preserve')) {
      return immutableElement.outerHTML;
    }
    return immutableElement.outerHTML;
  }
};
</script>
```

### 3. Custom Component Serialization

```vue
<script setup>
const immutables: ImmutablesProps = {
  serialization: (immutableElement) => {
    // Convert to custom component format
    const componentType = immutableElement.getAttribute('data-component');
    const props = immutableElement.getAttribute('data-props');
    
    if (componentType) {
      return `<component type="${componentType}" props="${props}" data-immutable="true">
        ${immutableElement.innerHTML}
      </component>`;
    }
    
    return immutableElement.outerHTML;
  }
};
</script>
```

## Styling Immutable Elements

Immutable elements automatically receive the `.pan-immutable` class and can be styled:

```css
.pan-immutable,
[data-immutable] {
  border: 2px dashed rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.02);
  padding: 2px 4px;
  user-select: none;
  cursor: default;
}

.pan-immutable:hover {
  border-color: rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.04);
}
```

## API Methods

The editor exposes methods for working with immutables:

### `makeImmutable(element: HTMLElement)`

Marks an element as immutable.

```typescript
editorRef.value?.makeImmutable(element);
```

### `isImmutable(element: HTMLElement): boolean`

Checks if an element is immutable.

```typescript
const immutable = editorRef.value?.isImmutable(element);
```

## Best Practices

1. **Always mark elements with `data-immutable="true"`** - This ensures they are recognized as immutable
2. **Use deserialization to restore state** - When loading content, use deserialization to restore widget state or data
3. **Keep serialization simple** - Serialization should produce clean, maintainable HTML
4. **Test both directions** - Ensure content can be saved and loaded correctly
5. **Handle edge cases** - Consider what happens if immutable elements are nested or removed

## Suggested Links

- [PantanalEditor API](/api/pantanal-editor)
- [Serialization Guide](/guide/serialization)
- [Examples](/examples/immutables)




