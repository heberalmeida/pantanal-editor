---
title: Basic Usage
description: "Basic usage guide for Pantanal Editor"
---

# Basic Usage

## Simple Editor

The most basic usage is with `v-model`:

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

## Custom Placeholder

```vue
<PantanalEditor 
  v-model="content" 
  placeholder="Enter your text here..." 
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

## Readonly Mode

```vue
<PantanalEditor 
  v-model="content" 
  :readonly="true"
/>
```

## Custom Toolbar

```vue
<script setup>
const toolbar = [
  'bold',
  'italic',
  'underline',
  '|', // separator
  'insertOrderedList',
  'insertUnorderedList'
];
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
  console.log('Content changed:', newContent);
};

const handleReady = () => {
  console.log('Editor is ready');
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

## Programmatic Control

```vue
<script setup>
import { ref } from 'vue';

const editorRef = ref();
const content = ref('');

const makeBold = () => {
  editorRef.value?.exec('bold');
};

const getContent = () => {
  const html = editorRef.value?.getHTML();
  console.log(html);
};

const setContent = () => {
  editorRef.value?.setHTML('<p>New content</p>');
};
</script>

<template>
  <div>
    <PantanalEditor 
      ref="editorRef"
      v-model="content"
    />
    <div style="margin-top: 1rem;">
      <button @click="makeBold">Bold</button>
      <button @click="getContent">Get HTML</button>
      <button @click="setContent">Set Content</button>
    </div>
  </div>
</template>
```

## Form Integration

```vue
<script setup>
import { ref } from 'vue';

const formData = ref({
  title: '',
  content: ''
});

const handleSubmit = () => {
  console.log('Form data:', formData.value);
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input 
      v-model="formData.title" 
      placeholder="Title"
    />
    <PantanalEditor 
      v-model="formData.content"
      placeholder="Content"
    />
    <button type="submit">Submit</button>
  </form>
</template>
```

## Suggested Links

- [Installation](/guide/installation)
- [Toolbar](/guide/toolbar)
- [Custom Tools](/guide/custom-tools)
- [Examples](/examples/)




