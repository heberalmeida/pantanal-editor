---
title: Immutables Examples
description: "Examples of Immutables implementation"
---

# Immutables Examples

This page demonstrates how to use Immutables in Pantanal Editor to create non-editable elements with custom serialization.

## Basic Immutable Element

A simple example of marking an element as immutable:

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor, type ImmutablesProps } from '@pantanal/editor';

const content = ref(`
  <p>This is regular editable text.</p>
  <div data-immutable="true" style="border: 2px solid #ccc; padding: 1rem; margin: 1rem 0;">
    <h3>Immutable Widget</h3>
    <p>This content cannot be edited.</p>
  </div>
  <p>More editable text here.</p>
`);

const immutables: ImmutablesProps = {
  deserialization: (viewElement, immutableElement) => {
    // Ensure element is marked as immutable
    immutableElement.setAttribute('contenteditable', 'false');
    return immutableElement;
  },
  serialization: (immutableElement) => {
    // Return the element's HTML
    return immutableElement.outerHTML;
  }
};
</script>

<template>
  <PantanalEditor 
    v-model="content" 
    :immutables="immutables"
  />
</template>
```

## Widget Embedding

Example of embedding a chart widget that cannot be edited:

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor, type ImmutablesProps } from '@pantanal/editor';

const content = ref(`
  <p>Article content here...</p>
  <div 
    data-immutable="true" 
    data-widget-id="chart-123" 
    data-widget-type="bar-chart"
    class="chart-widget"
  >
    <h4>Sales Chart</h4>
    <div class="chart-placeholder">Chart will be rendered here</div>
  </div>
  <p>Continue writing...</p>
`);

const immutables: ImmutablesProps = {
  deserialization: (viewElement, immutableElement) => {
    if (viewElement.hasAttribute('data-widget-id')) {
      const widgetId = viewElement.getAttribute('data-widget-id');
      const widgetType = viewElement.getAttribute('data-widget-type');
      
      // Mark as immutable
      immutableElement.setAttribute('contenteditable', 'false');
      immutableElement.setAttribute('data-widget-id', widgetId || '');
      immutableElement.setAttribute('data-widget-type', widgetType || '');
      immutableElement.classList.add('widget');
      
      // Initialize widget (example)
      // initializeWidget(widgetId, widgetType);
    }
    
    return immutableElement;
  },
  
  serialization: (immutableElement) => {
    if (immutableElement.hasAttribute('data-widget-id')) {
      const widgetId = immutableElement.getAttribute('data-widget-id');
      const widgetType = immutableElement.getAttribute('data-widget-type');
      const content = immutableElement.innerHTML;
      
      return `<div 
        data-immutable="true" 
        data-widget-id="${widgetId}" 
        data-widget-type="${widgetType}"
        class="chart-widget"
      >${content}</div>`;
    }
    
    return immutableElement.outerHTML;
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
.chart-widget {
  border: 2px dashed #4CAF50;
  padding: 1rem;
  margin: 1rem 0;
  background: #f1f8f4;
  border-radius: 4px;
}

.chart-placeholder {
  height: 200px;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}
</style>
```

## Custom Component Serialization

Example of serializing immutable elements to a custom component format:

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor, type ImmutablesProps } from '@pantanal/editor';

const content = ref(`
  <p>Document content...</p>
  <div 
    data-immutable="true" 
    data-component="video-player"
    data-props='{"src":"https://example.com/video.mp4","autoplay":false}'
  >
    <h4>Video Player</h4>
    <p>Video component placeholder</p>
  </div>
  <p>More content...</p>
`);

const immutables: ImmutablesProps = {
  deserialization: (viewElement, immutableElement) => {
    if (viewElement.hasAttribute('data-component')) {
      immutableElement.setAttribute('contenteditable', 'false');
      immutableElement.classList.add('component');
    }
    return immutableElement;
  },
  
  serialization: (immutableElement) => {
    if (immutableElement.hasAttribute('data-component')) {
      const componentType = immutableElement.getAttribute('data-component');
      const props = immutableElement.getAttribute('data-props') || '{}';
      const content = immutableElement.innerHTML;
      
      // Serialize to custom component format
      return `<component 
        type="${componentType}" 
        props='${props}' 
        data-immutable="true"
      >${content}</component>`;
    }
    
    return immutableElement.outerHTML;
  }
};
</script>

<template>
  <PantanalEditor 
    v-model="content" 
    :immutables="immutables"
  />
</template>
```

## Programmatic Immutable Creation

Example of creating immutable elements programmatically:

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { PantanalEditor } from '@pantanal/editor';

const content = ref('<p>Start typing...</p>');
const editorRef = ref<InstanceType<typeof PantanalEditor> | null>(null);

const insertImmutableWidget = () => {
  if (!editorRef.value) return;
  
  // Get current selection
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  
  // Create immutable element
  const widget = document.createElement('div');
  widget.setAttribute('data-immutable', 'true');
  widget.setAttribute('data-widget-id', `widget-${Date.now()}`);
  widget.className = 'custom-widget';
  widget.innerHTML = '<h4>Custom Widget</h4><p>This was inserted programmatically</p>';
  
  // Insert at selection
  range.deleteContents();
  range.insertNode(widget);
  
  // Mark as immutable
  editorRef.value.makeImmutable(widget);
  
  // Update content
  selection.removeAllRanges();
};
</script>

<template>
  <div>
    <button @click="insertImmutableWidget">Insert Immutable Widget</button>
    <PantanalEditor 
      ref="editorRef"
      v-model="content" 
    />
  </div>
</template>
```

## Complex Widget with State

Example of a widget that maintains state across serialization:

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor, type ImmutablesProps } from '@pantanal/editor';

const content = ref(`
  <p>Document with stateful widget:</p>
  <div 
    data-immutable="true" 
    data-widget="counter"
    data-count="0"
    class="counter-widget"
  >
    <h4>Counter Widget</h4>
    <p>Count: <span class="count">0</span></p>
    <button onclick="incrementCounter(this)">Increment</button>
  </div>
`);

const immutables: ImmutablesProps = {
  deserialization: (viewElement, immutableElement) => {
    if (viewElement.hasAttribute('data-widget')) {
      const widgetType = viewElement.getAttribute('data-widget');
      const count = viewElement.getAttribute('data-count') || '0';
      
      immutableElement.setAttribute('contenteditable', 'false');
      immutableElement.setAttribute('data-widget', widgetType || '');
      immutableElement.setAttribute('data-count', count);
      immutableElement.classList.add('counter-widget');
      
      // Restore count display
      const countSpan = immutableElement.querySelector('.count');
      if (countSpan) {
        countSpan.textContent = count;
      }
    }
    
    return immutableElement;
  },
  
  serialization: (immutableElement) => {
    if (immutableElement.hasAttribute('data-widget')) {
      const widgetType = immutableElement.getAttribute('data-widget');
      const count = immutableElement.getAttribute('data-count') || '0';
      const content = immutableElement.innerHTML;
      
      // Preserve state in serialized HTML
      return `<div 
        data-immutable="true" 
        data-widget="${widgetType}" 
        data-count="${count}"
        class="counter-widget"
      >${content}</div>`;
    }
    
    return immutableElement.outerHTML;
  }
};

// Counter function (would be in global scope or handled differently)
(window as any).incrementCounter = function(button: HTMLElement) {
  const widget = button.closest('.counter-widget');
  if (widget) {
    const countSpan = widget.querySelector('.count');
    const currentCount = parseInt(widget.getAttribute('data-count') || '0');
    const newCount = currentCount + 1;
    
    widget.setAttribute('data-count', String(newCount));
    if (countSpan) {
      countSpan.textContent = String(newCount);
    }
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
.counter-widget {
  border: 2px solid #2196F3;
  padding: 1rem;
  margin: 1rem 0;
  background: #e3f2fd;
  border-radius: 4px;
}

.counter-widget button {
  padding: 0.5rem 1rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.counter-widget button:hover {
  background: #1976D2;
}
</style>
```

## Multiple Immutable Types

Example handling multiple types of immutable elements:

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor, type ImmutablesProps } from '@pantanal/editor';

const content = ref(`
  <p>Document with multiple widget types:</p>
  <div data-immutable="true" data-type="chart" data-id="chart-1">Chart Widget</div>
  <div data-immutable="true" data-type="form" data-id="form-1">Form Widget</div>
  <div data-immutable="true" data-type="table" data-id="table-1">Table Widget</div>
`);

const immutables: ImmutablesProps = {
  deserialization: (viewElement, immutableElement) => {
    const type = viewElement.getAttribute('data-type');
    const id = viewElement.getAttribute('data-id');
    
    if (type && id) {
      immutableElement.setAttribute('contenteditable', 'false');
      immutableElement.setAttribute('data-type', type);
      immutableElement.setAttribute('data-id', id);
      immutableElement.classList.add(`widget-${type}`);
      
      // Initialize based on type
      switch (type) {
        case 'chart':
          // Initialize chart
          break;
        case 'form':
          // Initialize form
          break;
        case 'table':
          // Initialize table
          break;
      }
    }
    
    return immutableElement;
  },
  
  serialization: (immutableElement) => {
    const type = immutableElement.getAttribute('data-type');
    const id = immutableElement.getAttribute('data-id');
    
    if (type && id) {
      return `<div 
        data-immutable="true" 
        data-type="${type}" 
        data-id="${id}"
        class="widget-${type}"
      >${immutableElement.innerHTML}</div>`;
    }
    
    return immutableElement.outerHTML;
  }
};
</script>

<template>
  <PantanalEditor 
    v-model="content" 
    :immutables="immutables"
  />
</template>
```

## Suggested Links

- [ImmutablesProps API](/api/immutables-props)
- [PantanalEditor API](/api/pantanal-editor)
- [Serialization Guide](/guide/serialization)




