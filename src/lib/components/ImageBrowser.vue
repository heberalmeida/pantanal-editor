<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { ImageBrowserProps, ImageBrowserItem, ImageBrowserResponse } from '../types/imageBrowser';

const props = withDefaults(defineProps<ImageBrowserProps>(), {
  fileTypes: 'gif,jpg,jpeg,png,svg,webp',
  path: '/images',
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
  select: [item: ImageBrowserItem];
  cancel: [];
}>();

const currentPath = ref(props.path);
const items = ref<ImageBrowserItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const orderBy = ref<'name' | 'size'>('name');
const viewMode = ref<'grid' | 'list'>('grid');

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
        error.value = 'Image browser endpoint not found. Please configure the server endpoint.';
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
    let data: ImageBrowserResponse;
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
    
    // Generate thumbnail URLs if not provided
    items.value = items.value.map(item => {
      if (item.type === 'f' && !item.thumbnailUrl && props.transport?.thumbnailUrl) {
        const thumbUrl = typeof props.transport.thumbnailUrl === 'function'
          ? props.transport.thumbnailUrl(item.path || currentPath.value, item.name)
          : props.transport.thumbnailUrl.replace('{0}', item.name);
        item.thumbnailUrl = thumbUrl;
      }
      return item;
    });
  } catch (err) {
    // Only set error if not already set (e.g., from 404 handling)
    if (!error.value) {
      error.value = err instanceof Error ? err.message : 'Failed to load images';
    }
    items.value = [];
  } finally {
    loading.value = false;
  }
};

const parseItem = (item: any): ImageBrowserItem => {
  const schema = props.schema?.model;
  if (!schema) return item;

  const result: ImageBrowserItem = {
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

const handleItemClick = (item: ImageBrowserItem) => {
  if (item.type === 'd') {
    // Navigate to directory
    currentPath.value = item.path || `${currentPath.value}/${item.name}`;
    loadItems();
  } else {
    // Select image
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

const handleDelete = async (item: ImageBrowserItem) => {
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

const getImageUrl = (item: ImageBrowserItem) => {
  if (item.type !== 'f') return '';
  
  if (item.thumbnailUrl) {
    return item.thumbnailUrl;
  }
  
  if (props.transport?.imageUrl) {
    return typeof props.transport.imageUrl === 'function'
      ? props.transport.imageUrl(item.path || currentPath.value, item.name)
      : props.transport.imageUrl.replace('{0}', item.name);
  }
  
  return '';
};

onMounted(() => {
  loadItems();
});
</script>

<template>
  <div class="image-browser">
    <div class="image-browser-header">
      <div class="image-browser-path">
        <button v-if="currentPath !== '/'" @click="handleBack" class="image-browser-back">
          ← Back
        </button>
        <span class="image-browser-path-text">{{ currentPath }}</span>
      </div>
      <div class="image-browser-actions">
        <select v-model="orderBy" class="image-browser-order">
          <option value="name">{{ messages?.orderByName || 'Name' }}</option>
          <option value="size">{{ messages?.orderBySize || 'Size' }}</option>
        </select>
        <button
          @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
          class="image-browser-view-toggle"
          :title="viewMode === 'grid' ? 'List view' : 'Grid view'"
        >
          {{ viewMode === 'grid' ? '☰' : '⊞' }}
        </button>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="messages?.search || 'Search...'"
          class="image-browser-search"
        />
        <label v-if="transport?.upload" class="image-browser-upload-btn">
          {{ messages?.uploadFile || 'Upload' }}
          <input type="file" accept="image/*" @change="handleUpload" style="display: none;" />
        </label>
        <button
          v-if="transport?.create"
          @click="handleCreateFolder"
          class="image-browser-create-btn"
        >
          New Folder
        </button>
      </div>
    </div>

    <div class="image-browser-content">
      <div v-if="loading" class="image-browser-loading">Loading...</div>
      <div v-else-if="error" class="image-browser-error">
        <p><strong>Error:</strong> {{ error }}</p>
        <p v-if="error.includes('404') || error.includes('not found')" class="image-browser-error-hint">
          This is a demo. Configure your server endpoints to enable full functionality.
        </p>
      </div>
      <div v-else-if="filteredItems.length === 0" class="image-browser-empty">
        {{ messages?.emptyFolder || 'This folder is empty' }}
      </div>
      <div v-else class="image-browser-items" :class="`image-browser-items-${viewMode}`">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="image-browser-item"
          :class="{ 'image-browser-item-dir': item.type === 'd' }"
          @click="handleItemClick(item)"
        >
          <div v-if="item.type === 'd'" class="image-browser-item-folder">
            <span class="image-browser-item-icon">📁</span>
            <span class="image-browser-item-name">{{ item.name }}</span>
          </div>
          <div v-else class="image-browser-item-image">
            <div class="image-browser-item-thumbnail">
              <img
                v-if="getImageUrl(item)"
                :src="getImageUrl(item)"
                :alt="item.name"
                @error="(e) => { (e.target as HTMLImageElement).style.display = 'none'; }"
              />
              <div v-else class="image-browser-item-placeholder">📷</div>
            </div>
            <div class="image-browser-item-info">
              <span class="image-browser-item-name">{{ item.name }}</span>
              <span v-if="item.size" class="image-browser-item-size">
                {{ formatSize(item.size) }}
              </span>
            </div>
          </div>
          <button
            v-if="transport?.destroy"
            @click.stop="handleDelete(item)"
            class="image-browser-item-delete"
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
.image-browser {
  width: 100%;
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  background: white;
}

.image-browser-header {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.image-browser-path {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.image-browser-back {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.image-browser-path-text {
  font-family: monospace;
  color: #666;
}

.image-browser-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.image-browser-order,
.image-browser-search {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.image-browser-search {
  flex: 1;
}

.image-browser-view-toggle {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  background: #f5f5f5;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1rem;
}

.image-browser-upload-btn,
.image-browser-create-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid #ddd;
  background: #f5f5f5;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.875rem;
}

.image-browser-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.image-browser-loading,
.image-browser-error,
.image-browser-empty {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.image-browser-error {
  color: #d32f2f;
}

.image-browser-error p {
  margin: 0.5rem 0;
}

.image-browser-error-hint {
  font-size: 0.875rem;
  color: #666;
  font-style: italic;
  margin-top: 0.5rem;
}

.image-browser-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.image-browser-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.image-browser-item {
  position: relative;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.image-browser-item:hover {
  border-color: #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-browser-item-dir {
  background: #f9f9f9;
}

.image-browser-item-folder {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
}

.image-browser-item-icon {
  font-size: 1.5rem;
}

.image-browser-item-image {
  display: flex;
  flex-direction: column;
}

.image-browser-item-thumbnail {
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-browser-item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-browser-item-placeholder {
  font-size: 3rem;
  color: #ccc;
}

.image-browser-item-info {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.image-browser-item-name {
  font-size: 0.875rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-browser-item-size {
  font-size: 0.75rem;
  color: #666;
}

.image-browser-item-delete {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #d32f2f;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-browser-item:hover .image-browser-item-delete {
  opacity: 1;
}

.image-browser-item-delete:hover {
  background: #ffebee;
}

/* List view styles */
.image-browser-items-list .image-browser-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}

.image-browser-items-list .image-browser-item-thumbnail {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.image-browser-items-list .image-browser-item-info {
  flex: 1;
  padding: 0;
}
</style>

