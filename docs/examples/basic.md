---
title: Basic Examples
description: "Basic usage examples"
---

# Basic Examples

## Simple Editor

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor } from '@pantanal/editor';

const content = ref('<p>Start typing...</p>');
</script>

<template>
  <PantanalEditor v-model="content" />
</template>
```

## With Custom Placeholder

```vue
<PantanalEditor 
  v-model="content" 
  placeholder="Enter your text here..." 
/>
```

## Readonly Mode

```vue
<PantanalEditor 
  v-model="content" 
  :readonly="true"
/>
```

## Custom Height

```vue
<PantanalEditor 
  v-model="content" 
  height="600px"
  min-height="300px"
/>
```

## Minimal Toolbar

```vue
<script setup>
const toolbar = ['bold', 'italic', 'underline'];
</script>

<template>
  <PantanalEditor 
    v-model="content" 
    :toolbar="toolbar"
  />
</template>
```

## Event Handling

```vue
<script setup>
const content = ref('');

const handleChange = (newContent) => {
  console.log('Content changed');
};

const handleReady = () => {
  console.log('Editor ready');
};
</script>

<template>
  <PantanalEditor 
    v-model="content"
    @change="handleChange"
    @ready="handleReady"
  />
</template>
```

## Suggested Links

- [Basic Usage](/guide/basic-usage)
- [PantanalEditor API](/api/pantanal-editor)
- [More Examples](/examples/)




