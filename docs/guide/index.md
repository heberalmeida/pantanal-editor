---
title: Getting Started
description: "Introduction to Pantanal Editor"
---

# Getting Started

Pantanal Editor is a modern, lightweight rich text editor built with Vue 3 and TypeScript, providing a clean interface with full customization capabilities.

## Features

- 🎨 **Beautiful UI** - Clean and modern interface
- ⚡️ **Fast & Lightweight** - Built with Vue 3 Composition API
- 🔧 **Highly Customizable** - Custom tools, serialization, and plugins
- 📦 **TypeScript Ready** - Full TypeScript support
- 🎯 **Easy Integration** - Simple API for Vue 3 applications
- 🔌 **Extensible** - Plugin system and custom tool support

## Quick Start

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

## Installation

```bash
npm install @pantanal/editor
```

See [Installation Guide](/guide/installation) for more details.

## Basic Usage

```vue
<template>
  <PantanalEditor 
    v-model="content"
    placeholder="Start typing..."
    height="500px"
  />
</template>
```

## Next Steps

- [Installation](/guide/installation) - Setup instructions
- [Basic Usage](/guide/basic-usage) - Learn the basics
- [Toolbar](/guide/toolbar) - Configure the toolbar
- [Custom Tools](/guide/custom-tools) - Create custom tools
- [Examples](/examples/) - See examples in action



