<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { FileBrowserProps, FileBrowserItem, FileBrowserResponse } from '../types/fileBrowser';

const props = withDefaults(defineProps<FileBrowserProps>(), {
  fileTypes: '',
  path: '/',
  messages: () => ({
    uploadFile: 'Upload',
    orderBy: 'Order by',
    orderByName: 'Name',
    orderBySize: 'Size',
    directoryNotFound: 'Directory not found',
    emptyFolder: 'This folder is empty',
    deleteFile: 'Are you sure you want to delete "{0}"?',
    invalidFileType: 'The selected file "{0}" is not valid. Supported file types are {1}.',
    overwriteFile: 'A file with name "{0}" already exists. Do you want to overwrite it?',
    search: 'Search...',
  }),
});

const emit = defineEmits<{
  select: [item: FileBrowserItem];
  cancel: [];
}>();

const currentPath = ref(props.path);
const items = ref<FileBrowserItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const orderBy = ref<'name' | 'size'>('name');

const filteredItems = computed(() => {
  let result = [...items.value];
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      item.name.toLowerCase().includes(query)
    );
  }
  
  // Sort
  result.sort((a, b) => {
    if (orderBy.value === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      const sizeA = a.size || 0;
      const sizeB = b.size || 0;
      return sizeB - sizeA;
    }
  });
  
  return result;
});

const loadItems = async () => {
  if (!props.transport?.read) {
    error.value = 'Read transport not configured';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const readConfig = props.transport.read;
    const url = typeof readConfig.url === 'function' 
      ? readConfig.url() 
      : readConfig.url || '';

    const requestData = typeof readConfig.data === 'function'
      ? readConfig.data()
      : readConfig.data || { path: currentPath.value };

    const response = await fetch(url, {
      method: readConfig.type || 'POST',
      headers: {
        'Content-Type': readConfig.contentType || 'application/json',
      },
      body: JSON.stringify({
        ...requestData,
        path: currentPath.value,
      }),
    });

    // Check if response is ok
    if (!response.ok) {
      if (response.status === 404) {
        // 404 means endpoint doesn't exist - show friendly message
        error.value = 'File browser endpoint not found. Please configure the server endpoint.';
        items.value = [];
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response has content
    const text = await response.text();
    if (!text || text.trim() === '') {
      // Return empty data if response is empty
      items.value = [];
      return;
    }

    // Parse JSON only if there's content
    let data: FileBrowserResponse;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError}`);
    }
    
    // Parse items using schema if provided
    if (props.schema?.model) {
      items.value = (data.data || []).map(item => parseItem(item));
    } else {
      items.value = data.data || [];
    }
  } catch (err) {
    // Only set error if not already set (e.g., from 404 handling)
    if (!error.value) {
      error.value = err instanceof Error ? err.message : 'Failed to load files';
    }
    items.value = [];
  } finally {
    loading.value = false;
  }
};

const parseItem = (item: any): FileBrowserItem => {
  const schema = props.schema?.model;
  if (!schema) return item;

  const result: FileBrowserItem = {
    id: schema.id ? item[schema.id] : item.id || item.name,
    name: schema.fields?.name?.parse
      ? schema.fields.name.parse(schema.fields.name.field ? item[schema.fields.name.field] : item.name)
      : (schema.fields?.name?.field ? item[schema.fields.name.field] : item.name),
    type: schema.fields?.type?.parse
      ? schema.fields.type.parse(schema.fields.type.field ? item[schema.fields.type.field] : item.type)
      : (schema.fields?.type?.field ? item[schema.fields.type.field] : item.type),
  };

  if (schema.fields?.size) {
    result.size = schema.fields.size.parse
      ? schema.fields.size.parse(schema.fields.size.field ? item[schema.fields.size.field] : item.size)
      : (schema.fields.size.field ? item[schema.fields.size.field] : item.size);
  }

  return result;
};

const handleItemClick = (item: FileBrowserItem) => {
  if (item.type === 'd') {
    // Navigate to directory
    currentPath.value = item.path || `${currentPath.value}/${item.name}`;
    loadItems();
  } else {
    // Select file
    emit('select', item);
  }
};

const handleBack = () => {
  const parts = currentPath.value.split('/').filter(Boolean);
  if (parts.length > 0) {
    parts.pop();
    currentPath.value = '/' + parts.join('/');
    loadItems();
  }
};

const handleUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !props.transport?.upload) return;

  // Check file type
  if (props.fileTypes) {
    const allowedTypes = props.fileTypes.split(',').map(t => t.trim().toLowerCase());
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      alert(props.messages?.invalidFileType
        ?.replace('{0}', file.name)
        ?.replace('{1}', props.fileTypes) || 'Invalid file type');
      return;
    }
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', currentPath.value);

  try {
    const response = await fetch(props.transport.upload.url, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      loadItems();
      input.value = '';
    }
  } catch (err) {
    alert('Upload failed');
  }
};

const handleDelete = async (item: FileBrowserItem) => {
  if (!props.transport?.destroy) return;

  if (!confirm(props.messages?.deleteFile?.replace('{0}', item.name) || 'Delete file?')) {
    return;
  }

  try {
    const destroyConfig = props.transport.destroy;
    const url = typeof destroyConfig.url === 'function'
      ? destroyConfig.url()
      : destroyConfig.url || '';

    const requestData = typeof destroyConfig.data === 'function'
      ? destroyConfig.data()
      : destroyConfig.data || {};

    await fetch(url, {
      method: destroyConfig.type || 'POST',
      headers: {
        'Content-Type': destroyConfig.contentType || 'application/json',
      },
      body: JSON.stringify({
        ...requestData,
        path: item.path || currentPath.value,
        name: item.name,
      }),
    });

    loadItems();
  } catch (err) {
    alert('Delete failed');
  }
};

const handleCreateFolder = async () => {
  if (!props.transport?.create) return;

  const folderName = prompt('Enter folder name:');
  if (!folderName) return;

  try {
    const createConfig = props.transport.create;
    const url = typeof createConfig.url === 'function'
      ? createConfig.url()
      : createConfig.url || '';

    const requestData = typeof createConfig.data === 'function'
      ? createConfig.data()
      : createConfig.data || {};

    await fetch(url, {
      method: createConfig.type || 'POST',
      headers: {
        'Content-Type': createConfig.contentType || 'application/json',
      },
      body: JSON.stringify({
        ...requestData,
        path: currentPath.value,
        name: folderName,
      }),
    });

    loadItems();
  } catch (err) {
    alert('Create folder failed');
  }
};

const formatSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

onMounted(() => {
  loadItems();
});
</script>

<template>
  <div class="file-browser">
    <div class="file-browser-header">
      <div class="file-browser-path">
        <button v-if="currentPath !== '/'" @click="handleBack" class="file-browser-back">
          ← Back
        </button>
        <span class="file-browser-path-text">{{ currentPath }}</span>
      </div>
      <div class="file-browser-actions">
        <select v-model="orderBy" class="file-browser-order">
          <option value="name">{{ messages?.orderByName || 'Name' }}</option>
          <option value="size">{{ messages?.orderBySize || 'Size' }}</option>
        </select>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="messages?.search || 'Search...'"
          class="file-browser-search"
        />
        <label v-if="transport?.upload" class="file-browser-upload-btn">
          {{ messages?.uploadFile || 'Upload' }}
          <input type="file" @change="handleUpload" style="display: none;" />
        </label>
        <button
          v-if="transport?.create"
          @click="handleCreateFolder"
          class="file-browser-create-btn"
        >
          New Folder
        </button>
      </div>
    </div>

    <div class="file-browser-content">
      <div v-if="loading" class="file-browser-loading">Loading...</div>
      <div v-else-if="error" class="file-browser-error">
        <p><strong>Error:</strong> {{ error }}</p>
        <p v-if="error.includes('404') || error.includes('not found')" class="file-browser-error-hint">
          This is a demo. Configure your server endpoints to enable full functionality.
        </p>
      </div>
      <div v-else-if="filteredItems.length === 0" class="file-browser-empty">
        {{ messages?.emptyFolder || 'This folder is empty' }}
      </div>
      <div v-else class="file-browser-items">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="file-browser-item"
          :class="{ 'file-browser-item-dir': item.type === 'd' }"
          @click="handleItemClick(item)"
        >
          <span class="file-browser-item-icon">
            {{ item.type === 'd' ? '📁' : '📄' }}
          </span>
          <span class="file-browser-item-name">{{ item.name }}</span>
          <span v-if="item.size" class="file-browser-item-size">
            {{ formatSize(item.size) }}
          </span>
          <button
            v-if="transport?.destroy"
            @click.stop="handleDelete(item)"
            class="file-browser-item-delete"
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-browser {
  width: 100%;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  background: white;
}

.file-browser-header {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-browser-path {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-browser-back {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.file-browser-path-text {
  font-family: monospace;
  color: #666;
}

.file-browser-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.file-browser-order,
.file-browser-search {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.file-browser-search {
  flex: 1;
}

.file-browser-upload-btn,
.file-browser-create-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid #ddd;
  background: #f5f5f5;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.875rem;
}

.file-browser-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.file-browser-loading,
.file-browser-error,
.file-browser-empty {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.file-browser-error {
  color: #d32f2f;
}

.file-browser-error p {
  margin: 0.5rem 0;
}

.file-browser-error-hint {
  font-size: 0.875rem;
  color: #666;
  font-style: italic;
  margin-top: 0.5rem;
}

.file-browser-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-browser-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.file-browser-item:hover {
  background: #f5f5f5;
  border-color: #ddd;
}

.file-browser-item-dir {
  font-weight: 500;
}

.file-browser-item-icon {
  font-size: 1.25rem;
}

.file-browser-item-name {
  flex: 1;
}

.file-browser-item-size {
  color: #666;
  font-size: 0.875rem;
}

.file-browser-item-delete {
  padding: 0.25rem 0.5rem;
  border: none;
  background: transparent;
  color: #d32f2f;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
}

.file-browser-item-delete:hover {
  background: #ffebee;
  border-radius: 4px;
}
</style>

