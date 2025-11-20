<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { PantanalEditor, type ToolbarItem, type FileBrowserProps, type ImageBrowserProps, type ImmutablesProps } from './lib';

const basicValue = ref('<p>Welcome to Pantanal Editor. Start typing.</p>');
const customValue = ref('<h2>Custom toolbar</h2><p>Only a subset of features.</p>');
const imageValue = ref('<p>Paste an image URL to embed visuals.</p>');
const cardValue = ref('<p>This editor lives inside a card UI.</p>');
const darkValue = ref('<p>Dark mode is polished and low contrast aware.</p>');
const readonlyValue = ref('<h3>Viewer Mode</h3><p>This instance is readonly.</p>');
const formValue = ref('');
const sanitizedValue = ref('<p>Hello <script>alert("xss")<\/script> World</p>');
const cleanedValue = ref('<p style="color: red; font-size: 20px;">This will be cleaned on save</p>');
const legacyValue = ref('<font color="blue" size="5">Legacy HTML</font> will be converted');
const customToolsValue = ref('<p>Try the custom tools above!</p>');
const fileBrowserValue = ref('<p>Click the image button to browse files!</p>');
const imageBrowserValue = ref('<p>Click the image button to browse images with thumbnails!</p>');
const immutablesValue = ref(`
  <p>This is regular editable text.</p>
  <div data-immutable="true" style="border: 2px dashed #ccc; padding: 1rem; margin: 1rem 0; background: #f9f9f9;">
    <h3>🔒 Immutable Widget</h3>
    <p>This content cannot be edited. Try to select or modify it!</p>
    <p>It will be preserved with custom serialization.</p>
  </div>
  <p>You can continue editing here.</p>
`);

// Mock file browser configuration
const fileBrowser: FileBrowserProps = {
  fileTypes: 'jpg,jpeg,png,gif,svg,webp',
  path: '/images',
  transport: {
    read: {
      url: '/api/files/list',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: () => ({ path: '/images' })
    },
    upload: {
      url: '/api/files/upload'
    },
    fileUrl: (path, fileName) => {
      return `/api/files${path}/${encodeURIComponent(fileName)}`;
    },
    destroy: {
      url: '/api/files/delete',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    },
    create: {
      url: '/api/files/create',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    }
  },
  schema: {
    model: {
      id: 'id',
      fields: {
        name: { field: 'name' },
        type: { field: 'type' },
        size: { field: 'size' }
      }
    }
  },
  messages: {
    uploadFile: 'Upload',
    orderBy: 'Order by',
    orderByName: 'Name',
    orderBySize: 'Size',
    directoryNotFound: 'Directory not found',
    emptyFolder: 'This folder is empty',
    deleteFile: 'Are you sure you want to delete "{0}"?',
    invalidFileType: 'Invalid file type. Allowed: {1}',
    overwriteFile: 'File "{0}" already exists. Overwrite?',
    search: 'Search files...'
  }
};

// Mock image browser configuration
const imageBrowser: ImageBrowserProps = {
  fileTypes: 'jpg,jpeg,png,gif,svg,webp',
  path: '/images',
  transport: {
    read: {
      url: '/api/images/list',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: () => ({ path: '/images' })
    },
    upload: {
      url: '/api/images/upload'
    },
    imageUrl: (path, fileName) => {
      return `/api/images${path}/${encodeURIComponent(fileName)}`;
    },
    thumbnailUrl: (path, fileName) => {
      return `/api/images/thumbnails${path}/${encodeURIComponent(fileName)}`;
    },
    destroy: {
      url: '/api/images/delete',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    },
    create: {
      url: '/api/images/create',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    }
  },
  schema: {
    model: {
      id: 'id',
      fields: {
        name: { field: 'name' },
        type: { field: 'type' },
        size: { field: 'size' }
      }
    }
  },
  messages: {
    uploadFile: 'Upload Image',
    orderBy: 'Order by',
    orderByName: 'Name',
    orderBySize: 'Size',
    directoryNotFound: 'Directory not found',
    emptyFolder: 'This folder is empty',
    deleteFile: 'Are you sure you want to delete "{0}"?',
    invalidFileType: 'The selected file "{0}" is not valid. Supported file types are {1}.',
    overwriteFile: 'A file with name "{0}" already exists. Do you want to overwrite it?',
    search: 'Search images...'
  }
};

// Immutables configuration
const immutables: ImmutablesProps = {
  deserialization: (viewElement, immutableElement) => {
    // When loading, mark elements with data-immutable as non-editable
    if (viewElement.hasAttribute('data-immutable')) {
      immutableElement.setAttribute('contenteditable', 'false');
      immutableElement.classList.add('immutable-widget');
    }
    return immutableElement;
  },
  serialization: (immutableElement) => {
    // When saving, preserve the immutable structure
    if (immutableElement.hasAttribute('data-immutable')) {
      return immutableElement.outerHTML;
    }
    return immutableElement.outerHTML;
  }
};

const toolbarCompact = ['bold', 'italic', 'underline', 'foreColor', 'insertOrderedList', 'insertUnorderedList', 'clearFormatting'];

// Custom tools example
const customTools: ToolbarItem[] = [
  {
    id: 'insertDate',
    label: 'Date',
    icon: 'link',
    kind: 'custom',
    tooltip: 'Insert current date',
    exec: (context) => {
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const selection = context.editor.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(date));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        const html = context.editor.getHTML();
        context.editor.setHTML(html + date);
      }
    }
  },
  {
    id: 'wordCount',
    label: 'Count',
    icon: 'font',
    kind: 'custom',
    tooltip: 'Show word count',
    exec: (context) => {
      const html = context.editor.getHTML();
      const text = html.replace(/<[^>]*>/g, '').trim();
      const words = text.split(/\s+/).filter(w => w.length > 0);
      alert(`Word count: ${words.length}`);
    }
  },
  {
    id: 'customFontSize',
    label: 'Size',
    kind: 'custom',
    width: '100px',
    items: [
      { label: 'Small', value: '2' },
      { label: 'Normal', value: '3' },
      { label: 'Large', value: '4' },
      { label: 'Huge', value: '5' },
    ],
    exec: (context) => {
      if (context.value) {
        context.editor.exec('fontSize', context.value);
      }
    }
  }
];

const theme = ref<'light' | 'dark'>('light');

onMounted(() => {
  document.documentElement.dataset.theme = theme.value;
});

watch(theme, (value) => {
  document.documentElement.dataset.theme = value;
});

const darkCardTheme = computed(() => (theme.value === 'dark' ? 'light' : 'dark'));

const handleFormSubmit = () => {
  console.log('Form submitted with HTML:', formValue.value);
};

// Custom deserialization: Sanitize HTML on load
const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Remove script tags
  div.querySelectorAll('script').forEach(el => el.remove());
  
  // Remove on* event handlers
  div.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return div.innerHTML;
};

// Custom serialization: Clean formatting on save
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

// Convert legacy <font> tags to modern format
const convertLegacyFormat = (html: string): string => {
  return html
    .replace(/<font\s+color="([^"]+)">/gi, '<span style="color: $1">')
    .replace(/<font\s+size="([^"]+)">/gi, '<span style="font-size: $1">')
    .replace(/<\/font>/gi, '</span>');
};
</script>

<template>
  <main class="pantanal-page">
    <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;">
      <div>
        <h1 style="margin:0;font-size:2rem;">Pantanal Editor Playground</h1>
        <p style="margin:0.5rem 0 0;color:var(--pan-editor-text-muted);">
          Vue 3 + TypeScript + native DOM editing.
        </p>
      </div>
      <button
        class="pan-toolbar-btn"
        type="button"
        @click="theme = theme === 'light' ? 'dark' : 'light'"
      >
        Toggle {{ theme === 'light' ? 'Dark' : 'Light' }} Mode
      </button>
    </header>

    <section class="demo-grid">
      <article class="demo-card">
        <header>
          <h2>Basic Editor</h2>
          <span class="demo-meta">Two-way binding</span>
        </header>
        <PantanalEditor v-model="basicValue" placeholder="Write a hero paragraph..." />
      </article>

      <article class="demo-card">
        <header>
          <h2>Custom Toolbar</h2>
          <span class="demo-meta">Subset of tools</span>
        </header>
        <PantanalEditor
          v-model="customValue"
          :toolbar="toolbarCompact"
          height="360px"
          placeholder="Try the minimalist toolbar"
        />
      </article>

      <article class="demo-card">
        <header>
          <h2>Image & Links</h2>
          <span class="demo-meta">Insert media</span>
        </header>
        <PantanalEditor
          v-model="imageValue"
          height="360px"
          @ready="console.info('Image demo ready')"
        />
        <p class="demo-meta">Use the toolbar buttons to insert images or hyperlinks.</p>
      </article>

      <article class="demo-card" style="background:linear-gradient(135deg,#eef2ff,#fef3c7);">
        <header>
          <h2>Card UI</h2>
          <span class="demo-meta">Responsive layout</span>
        </header>
        <PantanalEditor v-model="cardValue" height="320px" />
      </article>

      <article class="demo-card" :data-theme="darkCardTheme">
        <header>
          <h2>Dark Mode</h2>
          <span class="demo-meta">Auto tokens</span>
        </header>
        <PantanalEditor v-model="darkValue" height="320px" />
      </article>

      <article class="demo-card">
        <header>
          <h2>Viewer Mode</h2>
          <span class="demo-meta">Readonly rendering</span>
        </header>
        <PantanalEditor
          v-model="readonlyValue"
          :toolbar="[]"
          :readonly="true"
          height="280px"
        />
      </article>

      <article class="demo-card" style="grid-column:1 / -1;">
        <header>
          <h2>Form Integration</h2>
          <span class="demo-meta">Submit HTML</span>
        </header>
        <form
          @submit.prevent="handleFormSubmit"
          style="display:flex;flex-direction:column;gap:1rem;"
        >
          <PantanalEditor v-model="formValue" placeholder="Compose your product description" />
          <button class="pan-toolbar-btn" type="submit">Submit form</button>
        </form>
      </article>

      <article class="demo-card">
        <header>
          <h2>HTML Sanitization</h2>
          <span class="demo-meta">deserializationCustom</span>
        </header>
        <PantanalEditor
          v-model="sanitizedValue"
          :deserialization-custom="sanitizeHTML"
          height="280px"
          placeholder="Dangerous tags are removed on load"
        />
        <p class="demo-meta">Script tags and event handlers are stripped when content loads.</p>
      </article>

      <article class="demo-card">
        <header>
          <h2>Clean on Save</h2>
          <span class="demo-meta">serializationCustom</span>
        </header>
        <PantanalEditor
          v-model="cleanedValue"
          :serialization-custom="cleanFormatting"
          height="280px"
          placeholder="Inline styles removed on save"
        />
        <p class="demo-meta">All inline styles are removed before emitting update:modelValue.</p>
      </article>

      <article class="demo-card">
        <header>
          <h2>Legacy Format Conversion</h2>
          <span class="demo-meta">deserializationCustom</span>
        </header>
        <PantanalEditor
          v-model="legacyValue"
          :deserialization-custom="convertLegacyFormat"
          height="280px"
          placeholder="Old &lt;font&gt; tags converted to modern HTML"
        />
        <p class="demo-meta">Legacy &lt;font&gt; tags are converted to modern &lt;span&gt; with CSS.</p>
      </article>

      <article class="demo-card" style="grid-column:1 / -1;">
        <header>
          <h2>Custom Tools</h2>
          <span class="demo-meta">EditorTool API with exec, items, tooltip</span>
        </header>
        <PantanalEditor
          v-model="customToolsValue"
          :tools="customTools"
          height="360px"
          placeholder="Try the custom tools: Insert Date, Word Count, and Custom Font Size"
        />
        <div class="demo-meta">
          <p>Custom tools demonstrate the EditorTool API with:</p>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            <li><strong>exec</strong> - Custom execution function</li>
            <li><strong>items</strong> - Dropdown items for customFontSize</li>
            <li><strong>tooltip</strong> - Hover tooltips</li>
            <li><strong>icon</strong> - Icon from registry</li>
          </ul>
        </div>
      </article>

      <article class="demo-card" style="grid-column:1 / -1;">
        <header>
          <h2>File Browser</h2>
          <span class="demo-meta">FileBrowserProps API with upload, delete, create</span>
        </header>
        <PantanalEditor
          v-model="fileBrowserValue"
          :file-browser="fileBrowser"
          height="360px"
          placeholder="Click the image button in the toolbar to open the file browser"
        />
        <div class="demo-meta">
          <p>File Browser features:</p>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            <li><strong>fileTypes</strong> - Allowed file extensions</li>
            <li><strong>transport.read</strong> - Load files from server</li>
            <li><strong>transport.upload</strong> - Upload new files</li>
            <li><strong>transport.destroy</strong> - Delete files/folders</li>
            <li><strong>transport.create</strong> - Create new folders</li>
            <li><strong>transport.fileUrl</strong> - Generate file URLs</li>
            <li><strong>schema</strong> - Custom response parsing</li>
            <li><strong>messages</strong> - Custom UI messages</li>
          </ul>
          <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #999;">
            Note: This is a demo. Configure your server endpoints to enable full functionality.
          </p>
        </div>
      </article>
      <article class="demo-card" style="grid-column:1 / -1;">
        <header>
          <h2>Image Browser</h2>
          <span class="demo-meta">ImageBrowserProps API with thumbnails, upload, delete, create</span>
        </header>
        <PantanalEditor
          v-model="imageBrowserValue"
          :image-browser="imageBrowser"
          height="360px"
          placeholder="Click the image button in the toolbar to open the image browser"
        />
        <div class="demo-meta">
          <p>Image Browser features:</p>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            <li><strong>fileTypes</strong> - Allowed image extensions</li>
            <li><strong>transport.read</strong> - Load images from server</li>
            <li><strong>transport.upload</strong> - Upload new images</li>
            <li><strong>transport.destroy</strong> - Delete images/folders</li>
            <li><strong>transport.create</strong> - Create new folders</li>
            <li><strong>transport.imageUrl</strong> - Generate image URLs</li>
            <li><strong>transport.thumbnailUrl</strong> - Generate thumbnail URLs</li>
            <li><strong>schema</strong> - Custom response parsing</li>
            <li><strong>messages</strong> - Custom UI messages</li>
            <li><strong>Grid/List views</strong> - Toggle between view modes</li>
          </ul>
          <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #999;">
            Note: This is a demo. Configure your server endpoints to enable full functionality.
          </p>
        </div>
      </article>
      <article class="demo-card" style="grid-column:1 / -1;">
        <header>
          <h2>Immutables</h2>
          <span class="demo-meta">ImmutablesProps API with custom serialization/deserialization</span>
        </header>
        <PantanalEditor
          v-model="immutablesValue"
          :immutables="immutables"
          height="360px"
          placeholder="Try to edit the immutable widget below - it cannot be modified!"
        />
        <div class="demo-meta">
          <p>Immutables features:</p>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            <li><strong>deserialization</strong> - Custom logic when loading immutable elements</li>
            <li><strong>serialization</strong> - Custom logic when saving immutable elements</li>
            <li><strong>data-immutable</strong> - Mark elements as non-editable</li>
            <li><strong>makeImmutable()</strong> - Programmatically mark elements as immutable</li>
            <li><strong>isImmutable()</strong> - Check if an element is immutable</li>
          </ul>
          <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #999;">
            Immutable elements are protected from editing but preserved in the HTML output.
          </p>
        </div>
      </article>
    </section>
  </main>
</template>

