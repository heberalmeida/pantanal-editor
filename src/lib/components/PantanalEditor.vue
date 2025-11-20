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

const showFileBrowser = ref(false);
const showImageBrowser = ref(false);

const handleFileSelect = (url: string) => {
  core.exec('insertImage', url);
  showFileBrowser.value = false;
};

const handleImageSelect = (url: string) => {
  core.exec('insertImage', url);
  showImageBrowser.value = false;
};

const { run } = useCommands({ 
  exec: core.exec,
  fileBrowser: props.fileBrowser,
  imageBrowser: props.imageBrowser,
  onFileSelect: handleFileSelect,
  onImageSelect: handleImageSelect,
});
useShortcuts(run);
const { handlePaste } = usePaste({ 
  allowedFormatting: props.keepPasteFormatting,
  deserializationCustom: props.deserializationCustom,
});

const canvasRef = ref<InstanceType<typeof EditorCanvas> | null>(null);
const editorRef = ref<HTMLElement | null>(null);

const bindLayer = () => {
  const layer = canvasRef.value?.layer || null;
  if (!layer) return;
  core.contentRef.value = layer;
  if (props.modelValue) {
    layer.innerHTML = props.modelValue;
  }
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
  
  // Don't interfere with toolbar interactive elements
  if (isToolbarButton || isToolbarDropdown || isToolbarColor || isSelect) {
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

onMounted(() => {
  history.snapshot(props.modelValue || '');
  bindLayer();
  
  // Focus editor when clicking anywhere in the editor container
  // Use bubbling phase (not capture) to allow buttons to handle clicks first
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.addEventListener('click', handleClick, false);
    }
  });
});

onUnmounted(() => {
  if (editorRef.value) {
    editorRef.value.removeEventListener('click', handleClick, false);
  }
});

watch(
  () => canvasRef.value?.layer,
  () => bindLayer(),
);

watch(
  () => props.modelValue,
  (value) => {
    if (value === core.html.value) return;
    core.setHTML(value || '');
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
  </section>
</template>
