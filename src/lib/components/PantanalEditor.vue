<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import Toolbar from './Toolbar.vue';
import EditorCanvas from './EditorCanvas.vue';
import FileBrowser from './FileBrowser.vue';
import ImageBrowser from './ImageBrowser.vue';
import { useEditorCore } from '../composables/useEditorCore';
import { useHistory } from '../composables/useHistory';
import { useSelection } from '../composables/useSelection';
import { useToolbar } from '../composables/useToolbar';
import { useCommands } from '../composables/useCommands';
import { useShortcuts } from '../composables/useShortcuts';
import { usePaste } from '../composables/usePaste';
import { usePlugins, type EditorPlugin } from '../composables/usePlugins';
import type { EditorCommand, DeserializationCustom, SerializationCustom, ToolbarItem } from '../types/editor';
import type { FileBrowserProps } from '../types/fileBrowser';
import type { ImageBrowserProps } from '../types/imageBrowser';
import type { ImmutablesProps } from '../types/immutables';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    readonly?: boolean;
    toolbar?: string[];
    tools?: ToolbarItem[];
    height?: string;
    minHeight?: string;
    keepPasteFormatting?: boolean;
    plugins?: EditorPlugin[];
    deserializationCustom?: DeserializationCustom;
    serializationCustom?: SerializationCustom;
    fileBrowser?: FileBrowserProps;
    imageBrowser?: ImageBrowserProps;
    immutables?: ImmutablesProps;
  }>(),
  {
    modelValue: '',
    placeholder: 'Start writing...',
    readonly: false,
    height: '480px',
    minHeight: '280px',
    keepPasteFormatting: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
  ready: [];
}>();

const core = useEditorCore({
  modelValue: props.modelValue,
  readonly: props.readonly,
  placeholder: props.placeholder,
  deserializationCustom: props.deserializationCustom,
  serializationCustom: props.serializationCustom,
  onUpdate: (value) => {
    emit('update:modelValue', value);
    emit('change', value);
    history.snapshot(value);
  },
  onReady: () => emit('ready'),
});

usePlugins(core.events, props.plugins);

const history = useHistory();

const selection = useSelection(core.emitSelectionChange);
const { toolbarItems } = useToolbar(
  computed(() => props.toolbar),
  computed(() => props.tools)
);
const dropdownValues = computed(() => ({
  fontName: selection.fontName.value,
  fontSize: selection.fontSize.value,
}));

const showFileBrowser = ref(false);
const showImageBrowser = ref(false);
const showLinkModal = ref(false);
const showImageUrlModal = ref(false);
const linkUrl = ref('');
const linkText = ref('');
const linkTarget = ref<'_self' | '_blank'>('_self');
const imageUrl = ref('');
const imageAlt = ref('');
const imageWidth = ref(100);
const selectionSnapshot = ref<Range[] | null>(null);
const linkEditingTarget = ref<HTMLAnchorElement | null>(null);
const imageEditingTarget = ref<HTMLImageElement | null>(null);
const showPreviewModal = ref(false);
const showHtmlModal = ref(false);
const previewContent = computed(() => core.html.value);
const htmlSource = computed(() => core.html.value);
const highlightedHtml = computed(() => {
  const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const highlightLine = (line: string) => {
    let escaped = escapeHtml(line);
    escaped = escaped.replace(/(&lt;\/?)([a-zA-Z0-9:-]+)/g, (_, open, tag) => {
      return `${open}<span class="pan-code-tag">${tag}</span>`;
    });
    escaped = escaped.replace(/([a-zA-Z0-9:-]+)=&quot;([^&]*?)&quot;/g, (_match, attr, val) => {
      return `<span class="pan-code-attr">${attr}</span>=<span class="pan-code-string">&quot;${val}&quot;</span>`;
    });
    return escaped;
  };
  return htmlSource.value
    .split('\n')
    .map((line, index) => {
      const content = highlightLine(line);
      return `<div class="pan-code-line"><span class="pan-code-line-number">${index + 1}</span><span class="pan-code-line-content">${content || '&nbsp;'}</span></div>`;
    })
    .join('');
});
const activeImage = ref<HTMLImageElement | null>(null);
const imageWidthControl = ref(100);
const imageAlignment = ref<'inline' | 'left' | 'center' | 'right'>('inline');
const imageControlsStyle = ref<{ top: string; left: string }>({ top: '0px', left: '0px' });
let currentLayer: HTMLElement | null = null;

const cloneRanges = (ranges: Range[] | null) => ranges?.map((range) => range.cloneRange()) ?? null;

const saveSelectionSnapshot = () => {
  selectionSnapshot.value = cloneRanges(core.getSelectionRanges());
};

const restoreSelectionSnapshot = () => {
  if (!selectionSnapshot.value?.length) return;
  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selectionSnapshot.value.forEach((range) => selection.addRange(range));
};

const detectImageAlignment = (image: HTMLImageElement): 'inline' | 'left' | 'center' | 'right' => {
  if (image.style.float === 'left') return 'left';
  if (image.style.float === 'right') return 'right';
  if (image.style.display === 'block' && image.style.marginLeft === 'auto' && image.style.marginRight === 'auto') {
    return 'center';
  }
  return 'inline';
};

const applyImageAlignment = (image: HTMLImageElement, alignment: 'inline' | 'left' | 'center' | 'right') => {
  image.style.removeProperty('float');
  image.style.removeProperty('display');
  image.style.removeProperty('margin');
  image.style.removeProperty('vertical-align');
  if (alignment === 'left') {
    image.style.float = 'left';
    image.style.display = 'inline-block';
    image.style.margin = '0 1rem 0.75rem 0';
    image.style.verticalAlign = 'top';
  } else if (alignment === 'right') {
    image.style.float = 'right';
    image.style.display = 'inline-block';
    image.style.margin = '0 0 0.75rem 1rem';
    image.style.verticalAlign = 'top';
  } else if (alignment === 'center') {
    image.style.display = 'block';
    image.style.margin = '0 auto 0.75rem';
  } else {
    image.style.display = 'inline-block';
    image.style.verticalAlign = 'top';
  }
};

const updateImageControlsPosition = () => {
  if (!activeImage.value || !editorRef.value) return;
  const imageRect = activeImage.value.getBoundingClientRect();
  const editorRect = editorRef.value.getBoundingClientRect();
  const top = Math.max(0, imageRect.top - editorRect.top - 40);
  const left = Math.max(0, imageRect.left - editorRect.left);
  imageControlsStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
};

const getImageWidthPercent = (image?: HTMLImageElement | null) => {
  if (!image) return 100;
  const styleWidth = image.style.width.trim();
  if (styleWidth.endsWith('%')) {
    const value = parseFloat(styleWidth);
    if (!Number.isNaN(value)) return value;
  }
  if (styleWidth.endsWith('px') && image.parentElement) {
    const px = parseFloat(styleWidth);
    const parentWidth = image.parentElement.clientWidth || 1;
    if (!Number.isNaN(px) && parentWidth > 0) {
      return Math.min(100, Math.max(10, Math.round((px / parentWidth) * 100)));
    }
  }
  const widthPx = image.clientWidth;
  const parentWidth = image.parentElement?.clientWidth || widthPx || 1;
  if (parentWidth > 0) {
    return Math.min(100, Math.max(10, Math.round((widthPx / parentWidth) * 100)));
  }
  return 100;
};

const handleFileSelect = (url: string) => {
  core.exec('insertImage', url);
  showFileBrowser.value = false;
};

const handleImageSelect = (url: string) => {
  core.exec('insertImage', url);
  showImageBrowser.value = false;
};

const getSelectionLink = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  let node: Node | null = range.startContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }
  return node instanceof HTMLElement ? node.closest('a') : null;
};

const handleRequestLink = (lastValue: string, anchor?: HTMLAnchorElement | null) => {
  if (anchor) {
    selectionSnapshot.value = null;
    linkEditingTarget.value = anchor;
    linkText.value = anchor.textContent || '';
    linkUrl.value = anchor.getAttribute('href') || '';
    linkTarget.value = anchor.getAttribute('target') === '_blank' ? '_blank' : '_self';
  } else {
    saveSelectionSnapshot();
    linkEditingTarget.value = null;
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() ?? '';
    const existingLink = getSelectionLink();
    linkText.value = selectedText || existingLink?.textContent || '';
    linkUrl.value = existingLink?.getAttribute('href') || '';
    linkTarget.value = existingLink?.getAttribute('target') === '_blank' ? '_blank' : '_self';
  }
  showLinkModal.value = true;
};

const handleRequestImageUrl = (lastValue: string, image?: HTMLImageElement | null) => {
  if (image) {
    selectionSnapshot.value = null;
    imageEditingTarget.value = image;
    imageUrl.value = image.getAttribute('src') || '';
    imageAlt.value = image.getAttribute('alt') || '';
    imageWidth.value = getImageWidthPercent(image);
  } else {
    saveSelectionSnapshot();
    imageEditingTarget.value = null;
    imageUrl.value = '';
    imageAlt.value = '';
    imageWidth.value = 100;
  }
  showImageUrlModal.value = true;
};

const { run, applyLink, applyImage } = useCommands({ 
  exec: core.exec,
  fileBrowser: props.fileBrowser,
  imageBrowser: props.imageBrowser,
  onFileSelect: handleFileSelect,
  onImageSelect: handleImageSelect,
  onRequestLink: handleRequestLink,
  onRequestImageUrl: handleRequestImageUrl,
});
useShortcuts(run);
const { handlePaste } = usePaste({ 
  allowedFormatting: props.keepPasteFormatting,
  deserializationCustom: props.deserializationCustom,
});

const canvasRef = ref<InstanceType<typeof EditorCanvas> | null>(null);
const editorRef = ref<HTMLElement | null>(null);

const attachLayerListeners = (layer: HTMLElement | null) => {
  if (currentLayer) {
    currentLayer.removeEventListener('click', handleLayerContentClick, true);
  }
  if (layer) {
    layer.addEventListener('click', handleLayerContentClick, true);
  }
  currentLayer = layer;
};

const bindLayer = () => {
  const layer = canvasRef.value?.layer || null;
  if (!layer) return;
  core.contentRef.value = layer;
  if (props.modelValue) {
    layer.innerHTML = props.modelValue;
  }
  attachLayerListeners(layer);
};

const focusEditor = (preserveSelection = false) => {
  const layer = canvasRef.value?.layer;
  if (layer && !props.readonly) {
    layer.focus();
    
    // Only move cursor to end if there's no existing selection
    if (!preserveSelection) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount === 0) {
        const range = document.createRange();
        range.selectNodeContents(layer);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }
};

const handleClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const layer = canvasRef.value?.layer;
  
  // If clicking directly on the editor layer, don't interfere
  if (target === layer || layer?.contains(target)) {
    return;
  }
  
  // Check if clicking on any interactive toolbar element
  const isToolbarButton = target.closest('.pan-toolbar-btn');
  const isToolbarDropdown = target.closest('.pan-toolbar-dropdown');
  const isToolbarColor = target.closest('.pan-toolbar-color');
  const isSelect = target.closest('select') || target.closest('option');
  const isModal = target.closest('.pan-modal');
  const isModalOverlay = target.closest('.pan-modal-overlay');
  const isImageControls = target.closest('.pan-image-controls');
  if (!isImageControls) {
    activeImage.value = null;
  }
  
  // Don't interfere with toolbar interactive elements
  if (isToolbarButton || isToolbarDropdown || isToolbarColor || isSelect || isModal || isModalOverlay || isImageControls) {
    return;
  }
  
  // If clicking on toolbar area (but not on interactive elements), focus editor
  // Use a short delay to ensure button clicks are processed first
  if (target.closest('.pan-toolbar')) {
    setTimeout(() => {
      focusEditor(true);
    }, 50);
    return;
  }
  
  // For any other click in the editor container, focus editor
  setTimeout(() => {
    focusEditor(true);
  }, 50);
};

const handleLayerContentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const image = target.closest('img');
  if (image instanceof HTMLImageElement) {
    activeImage.value = image;
    imageWidthControl.value = getImageWidthPercent(image);
    imageAlignment.value = detectImageAlignment(image);
    updateImageControlsPosition();
    return;
  }
  activeImage.value = null;
};

const handleDoubleClick = (e: MouseEvent) => {
  const layer = canvasRef.value?.layer;
  if (!layer) return;
  const target = e.target as HTMLElement;
  if (!target || !layer.contains(target)) return;
  if (props.readonly) return;
  
  const image = target.closest('img');
  if (image instanceof HTMLImageElement) {
    e.preventDefault();
    handleRequestImageUrl(image.getAttribute('src') || '', image);
    return;
  }
  
  const link = target.closest('a');
  if (link instanceof HTMLAnchorElement) {
    e.preventDefault();
    handleRequestLink(link.getAttribute('href') || '', link);
  }
};

onMounted(() => {
  history.snapshot(props.modelValue || '');
  bindLayer();
  
  // Focus editor when clicking anywhere in the editor container
  // Use bubbling phase (not capture) to allow buttons to handle clicks first
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.addEventListener('click', handleClick, false);
      editorRef.value.addEventListener('dblclick', handleDoubleClick, false);
    }
  });
  window.addEventListener('scroll', updateImageControlsPosition, true);
  window.addEventListener('resize', updateImageControlsPosition);
});

onUnmounted(() => {
  if (editorRef.value) {
    editorRef.value.removeEventListener('click', handleClick, false);
    editorRef.value.removeEventListener('dblclick', handleDoubleClick, false);
  }
  attachLayerListeners(null);
  window.removeEventListener('scroll', updateImageControlsPosition, true);
  window.removeEventListener('resize', updateImageControlsPosition);
});

watch(
  () => canvasRef.value?.layer,
  () => {
    bindLayer();
    attachLayerListeners(canvasRef.value?.layer || null);
  },
);

watch(
  () => props.modelValue,
  (value) => {
    if (value === core.html.value) return;
    core.setHTML(value || '');
  },
);

watch(
  () => activeImage.value,
  (image) => {
    if (image) {
      imageWidthControl.value = getImageWidthPercent(image);
      imageAlignment.value = detectImageAlignment(image);
      updateImageControlsPosition();
    }
  },
);

watch(
  () => imageWidthControl.value,
  (value) => {
    if (activeImage.value) {
      activeImage.value.style.width = `${value}%`;
      updateImageControlsPosition();
    }
  },
);

const activeCommands = computed<Record<string, boolean>>(() => ({
  bold: selection.bold.value,
  italic: selection.italic.value,
  underline: selection.underline.value,
  strikeThrough: selection.strikeThrough.value,
  insertOrderedList: selection.orderedList.value,
  insertUnorderedList: selection.unorderedList.value,
  justifyCenter: selection.align.value === 'center',
  justifyRight: selection.align.value === 'right',
  justifyFull: selection.align.value === 'justify',
  justifyLeft: selection.align.value === 'left',
}));

const editorApi = computed(() => ({
  getHTML: () => core.contentRef.value?.innerHTML ?? '',
  setHTML: (html: string) => core.setHTML(html),
  exec: (command: EditorCommand, value?: string) => run(command, value),
  getSelection: () => window.getSelection(),
}));

const handleToolbarCommand = ({ id, value }: { id: string; value?: string }) => {
  // Ensure editor has focus before executing command
  focusEditor(true);
  
  if (id === 'preview') {
    showPreviewModal.value = true;
    return;
  }

  if (id === 'viewHtml') {
    showHtmlModal.value = true;
    return;
  }

  // Small delay to ensure focus is set before executing
  setTimeout(() => {
    if (id === 'undo') {
      const snapshot = history.undo();
      if (snapshot !== null) {
        core.setHTML(snapshot);
      }
      focusEditor(true);
      return;
    }

    if (id === 'redo') {
      const snapshot = history.redo();
      if (snapshot !== null) {
        core.setHTML(snapshot);
      }
      focusEditor(true);
      return;
    }

    if (id === 'insertImage') {
      if (props.imageBrowser) {
        showImageBrowser.value = true;
        return;
      }
      if (props.fileBrowser) {
        showFileBrowser.value = true;
        return;
      }
    }

    run(id as EditorCommand, value);
    // Immediately refresh selection state so toolbar toggles reflect the change
    selection.refresh();
    core.emitSelectionChange();
    // Ensure focus is maintained after command
    focusEditor(true);
  }, 10);
};

const getHTML = () => core.contentRef.value?.innerHTML ?? '';
const setHTML = (value: string) => core.setHTML(value);
const exec = (command: EditorCommand, value?: string) => run(command, value);
const onEvent = core.events.on;
const makeImmutable = (element: HTMLElement) => core.immutables.makeImmutable(element);
const isImmutable = (element: HTMLElement) => core.immutables.isImmutable(element);

const closeLinkModal = () => {
  showLinkModal.value = false;
  linkEditingTarget.value = null;
  selectionSnapshot.value = null;
};

const submitLinkModal = () => {
  if (!linkUrl.value) return;
  if (linkEditingTarget.value) {
    const anchor = linkEditingTarget.value;
    anchor.setAttribute('href', linkUrl.value.trim());
    if (linkText.value.trim()) {
      anchor.textContent = linkText.value.trim();
    }
    if (linkTarget.value === '_blank') {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    } else {
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
    }
    showLinkModal.value = false;
    linkEditingTarget.value = null;
    return;
  }
  focusEditor(true);
  restoreSelectionSnapshot();
  applyLink({
    url: linkUrl.value.trim(),
    text: linkText.value.trim() || undefined,
    target: linkTarget.value,
  });
  showLinkModal.value = false;
  linkEditingTarget.value = null;
  selectionSnapshot.value = null;
};

const closeImageUrlModal = () => {
  showImageUrlModal.value = false;
  imageEditingTarget.value = null;
  selectionSnapshot.value = null;
};

const submitImageModal = () => {
  if (!imageUrl.value) return;
  const widthValue = `${imageWidth.value}%`;
  if (imageEditingTarget.value) {
    const image = imageEditingTarget.value;
    image.setAttribute('src', imageUrl.value.trim());
    if (imageAlt.value.trim()) {
      image.setAttribute('alt', imageAlt.value.trim());
    } else {
      image.removeAttribute('alt');
    }
    image.style.width = widthValue;
    showImageUrlModal.value = false;
    imageEditingTarget.value = null;
    return;
  }
  focusEditor(true);
  restoreSelectionSnapshot();
  applyImage({
    url: imageUrl.value.trim(),
    alt: imageAlt.value.trim() || undefined,
    width: widthValue,
  });
  showImageUrlModal.value = false;
  imageEditingTarget.value = null;
  selectionSnapshot.value = null;
};

defineExpose({
  getHTML,
  setHTML,
  exec,
  on: onEvent,
  makeImmutable,
  isImmutable,
});
</script>

<template>
  <section class="pan-editor" :data-readonly="readonly" ref="editorRef">
    <Toolbar
      :items="toolbarItems"
      :active-commands="activeCommands"
      :disabled="readonly"
      :editor-api="editorApi"
      :dropdown-values="dropdownValues"
      @command="handleToolbarCommand"
      @tool-execute="() => {}"
    />
    <EditorCanvas
      ref="canvasRef"
      :placeholder="placeholder"
      :readonly="readonly"
      :height="height"
      :min-height="minHeight"
      @input="core.handleInput"
      @focus="core.handleFocus"
      @blur="core.handleBlur"
      @paste="handlePaste"
    />
    <div
      v-if="activeImage"
      class="pan-image-controls"
      :style="imageControlsStyle"
    >
      <div class="pan-image-controls-row">
        <span class="pan-image-controls-label">Width</span>
        <input
          type="range"
          min="10"
          max="100"
          v-model.number="imageWidthControl"
        />
        <span class="pan-image-percentage">{{ imageWidthControl }}%</span>
      </div>
      <div class="pan-image-controls-row">
        <span class="pan-image-controls-label">Align</span>
        <div class="pan-image-align-buttons">
          <button
            type="button"
            class="pan-image-align-btn"
            :aria-pressed="imageAlignment === 'inline'"
            @click="setActiveImageAlignment('inline')"
          >
            Inline
          </button>
          <button
            type="button"
            class="pan-image-align-btn"
            :aria-pressed="imageAlignment === 'left'"
            @click="setActiveImageAlignment('left')"
          >
            Left
          </button>
          <button
            type="button"
            class="pan-image-align-btn"
            :aria-pressed="imageAlignment === 'center'"
            @click="setActiveImageAlignment('center')"
          >
            Center
          </button>
          <button
            type="button"
            class="pan-image-align-btn"
            :aria-pressed="imageAlignment === 'right'"
            @click="setActiveImageAlignment('right')"
          >
            Right
          </button>
        </div>
      </div>
    </div>
    <div v-if="showFileBrowser && fileBrowser" class="file-browser-overlay" @click.self="showFileBrowser = false">
      <div class="file-browser-modal">
        <div class="file-browser-modal-header">
          <h3>Select File</h3>
          <button @click="showFileBrowser = false" class="file-browser-close">×</button>
        </div>
        <FileBrowser
          v-bind="fileBrowser"
          @select="(item) => {
            if (fileBrowser.transport?.fileUrl) {
              const url = typeof fileBrowser.transport.fileUrl === 'function'
                ? fileBrowser.transport.fileUrl(item.path || '', item.name)
                : fileBrowser.transport.fileUrl.replace('{0}', item.name);
              handleFileSelect(url);
            } else {
              handleFileSelect(item.name);
            }
          }"
          @cancel="showFileBrowser = false"
        />
      </div>
    </div>
    <div v-if="showImageBrowser && imageBrowser" class="file-browser-overlay" @click.self="showImageBrowser = false">
      <div class="file-browser-modal">
        <div class="file-browser-modal-header">
          <h3>Select Image</h3>
          <button @click="showImageBrowser = false" class="file-browser-close">×</button>
        </div>
        <ImageBrowser
          v-bind="imageBrowser"
          @select="(item) => {
            if (imageBrowser.transport?.imageUrl) {
              const url = typeof imageBrowser.transport.imageUrl === 'function'
                ? imageBrowser.transport.imageUrl(item.path || '', item.name)
                : imageBrowser.transport.imageUrl.replace('{0}', item.name);
              handleImageSelect(url);
            } else {
              handleImageSelect(item.name);
            }
          }"
          @cancel="showImageBrowser = false"
        />
      </div>
    </div>
    <div v-if="showLinkModal" class="pan-modal-overlay" @click.self="closeLinkModal">
      <form class="pan-modal" @submit.prevent="submitLinkModal">
        <div class="pan-modal-header">
          <h3>Insert Link</h3>
          <button type="button" class="pan-modal-close" @click="closeLinkModal" aria-label="Close">×</button>
        </div>
        <div class="pan-modal-body">
          <label class="pan-input-label">
            Link text
            <input
              class="pan-input"
              type="text"
              v-model="linkText"
              placeholder="Text to display"
            />
          </label>
          <label class="pan-input-label">
            URL
            <input
              class="pan-input"
              type="text"
              v-model="linkUrl"
              placeholder="https://example.com"
              required
            />
          </label>
          <label class="pan-input-label">
            Open link in
            <select class="pan-input" v-model="linkTarget">
              <option value="_self">Same tab</option>
              <option value="_blank">New tab</option>
            </select>
          </label>
        </div>
        <div class="pan-modal-actions">
          <button type="button" class="pan-btn" @click="closeLinkModal">Cancel</button>
          <button type="submit" class="pan-btn pan-btn-primary">Apply Link</button>
        </div>
      </form>
    </div>
    <div v-if="showImageUrlModal" class="pan-modal-overlay" @click.self="closeImageUrlModal">
      <form class="pan-modal" @submit.prevent="submitImageModal">
        <div class="pan-modal-header">
          <h3>Insert Image</h3>
          <button type="button" class="pan-modal-close" @click="closeImageUrlModal" aria-label="Close">×</button>
        </div>
        <div class="pan-modal-body">
          <label class="pan-input-label">
            Image URL
            <input
              class="pan-input"
              type="text"
              v-model="imageUrl"
              placeholder="https://example.com/image.png"
              required
            />
          </label>
          <label class="pan-input-label">
            Alt text
            <input
              class="pan-input"
              type="text"
              v-model="imageAlt"
              placeholder="Describe the image"
            />
          </label>
          <label class="pan-input-label">
            Display width ({{ imageWidth }}%)
            <div class="pan-width-control">
              <input
                type="range"
                min="10"
                max="100"
                v-model.number="imageWidth"
              />
              <input
                type="number"
                min="10"
                max="100"
                v-model.number="imageWidth"
              />
            </div>
          </label>
        </div>
        <div class="pan-modal-actions">
          <button type="button" class="pan-btn" @click="closeImageUrlModal">Cancel</button>
          <button type="submit" class="pan-btn pan-btn-primary">Insert Image</button>
        </div>
      </form>
    </div>
    <div v-if="showPreviewModal" class="pan-modal-overlay" @click.self="showPreviewModal = false">
      <div class="pan-modal pan-preview-modal">
        <div class="pan-modal-header">
          <h3>Content Preview</h3>
          <button type="button" class="pan-modal-close" @click="showPreviewModal = false" aria-label="Close">×</button>
        </div>
        <div class="pan-preview-content" v-html="previewContent"></div>
        <div class="pan-modal-actions">
          <button type="button" class="pan-btn pan-btn-primary" @click="showPreviewModal = false">Close Preview</button>
        </div>
      </div>
    </div>
    <div v-if="showHtmlModal" class="pan-modal-overlay" @click.self="showHtmlModal = false">
      <div class="pan-modal pan-html-modal">
        <div class="pan-modal-header">
          <h3>HTML Source</h3>
          <button type="button" class="pan-modal-close" @click="showHtmlModal = false" aria-label="Close">×</button>
        </div>
        <div class="pan-modal-body">
          <div class="pan-html-code" v-html="highlightedHtml"></div>
        </div>
        <div class="pan-modal-actions">
          <button type="button" class="pan-btn pan-btn-primary" @click="showHtmlModal = false">Close</button>
        </div>
      </div>
    </div>
  </section>
</template>
const setActiveImageAlignment = (alignment: 'inline' | 'left' | 'center' | 'right') => {
  if (!activeImage.value) return;
  imageAlignment.value = alignment;
  applyImageAlignment(activeImage.value, alignment);
  updateImageControlsPosition();
};
