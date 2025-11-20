---
title: Installation
description: "Installation guide for Pantanal Editor"
---

# Installation

## NPM

```bash
npm install @pantanal/editor
```

## Yarn

```bash
yarn add @pantanal/editor
```

## PNPM

```bash
pnpm add @pantanal/editor
```

## Requirements

- Vue 3.x
- TypeScript (recommended)

## Basic Setup

```vue
<script setup>
import { PantanalEditor } from '@pantanal/editor';
import '@pantanal/editor/dist/style.css';

const content = ref('<p>Hello World</p>');
</script>

<template>
  <PantanalEditor v-model="content" />
</template>
```

## Global Registration

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { PantanalEditor } from '@pantanal/editor';
import '@pantanal/editor/dist/style.css';

const app = createApp(App);
app.component('PantanalEditor', PantanalEditor);
app.mount('#app');
```

## TypeScript Support

Pantanal Editor is written in TypeScript and includes full type definitions. No additional setup is required.

## Suggested Links

- [Getting Started](/guide/)
- [Basic Usage](/guide/basic-usage)
- [Examples](/examples/)




