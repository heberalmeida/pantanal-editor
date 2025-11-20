import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useEditorEvents } from './useEditorEvents';
import { useImmutables } from './useImmutables';
import type { DeserializationCustom, SerializationCustom } from '../types/editor';
import type { ImmutablesProps } from '../types/immutables';

interface CoreOptions {
  modelValue: string;
  readonly: boolean;
  placeholder?: string;
  onUpdate: (value: string) => void;
  onReady?: () => void;
  deserializationCustom?: DeserializationCustom;
  serializationCustom?: SerializationCustom;
  immutables?: ImmutablesProps;
}

export const useEditorCore = (options: CoreOptions) => {
  const contentRef = ref<HTMLElement | null>(null);
  const html = ref(options.modelValue ?? '');
  const isFocused = ref(false);
  const events = useEditorEvents();

  const canEdit = computed(() => !options.readonly);

  // Initialize immutables support
  const immutables = useImmutables(options.immutables, contentRef);

  const syncFromDom = () => {
    if (!contentRef.value) return;
    let rawHtml = contentRef.value.innerHTML;
    
    // Serialize immutables first
    if (options.immutables) {
      rawHtml = immutables.serializeImmutables(rawHtml);
    }
    
    // Apply custom serialization if provided
    if (options.serializationCustom) {
      rawHtml = options.serializationCustom(rawHtml);
    }
    
    html.value = rawHtml;
    events.emit('change', { html: html.value });
    options.onUpdate(html.value);
  };

  const setHTML = async (value: string) => {
    let processedValue = value;
    
    // Apply custom deserialization if provided
    if (options.deserializationCustom) {
      processedValue = options.deserializationCustom(processedValue);
    }
    
    // Deserialize immutables
    if (options.immutables) {
      processedValue = await immutables.deserializeImmutables(processedValue);
    }
    
    html.value = processedValue;
    if (contentRef.value) {
      contentRef.value.innerHTML = processedValue || '';
      
      // Mark immutables after setting HTML
      await nextTick();
      await immutables.markImmutables();
    }
  };

  const exec = (command: string, value?: string) => {
    if (!canEdit.value || !contentRef.value) return false;
    
    // Ensure the editor has focus before executing command
    contentRef.value.focus();
    
    // Get current selection
    const selection = window.getSelection();
    
    // For commands that need a selection, ensure we have one
    // Note: Some commands work without selection (they apply to the current paragraph/block)
    const needsActiveSelection = ['foreColor', 'backColor'];
    
    if (needsActiveSelection.includes(command)) {
      // For color commands, we need an active selection
      if (!selection || selection.rangeCount === 0 || selection.toString().length === 0) {
        // Create a collapsed range - the command will apply to the current formatting
        const range = document.createRange();
        if (contentRef.value.childNodes.length > 0) {
          const lastNode = contentRef.value.childNodes[contentRef.value.childNodes.length - 1];
          if (lastNode.nodeType === Node.TEXT_NODE) {
            range.setStart(lastNode, lastNode.textContent?.length || 0);
            range.setEnd(lastNode, lastNode.textContent?.length || 0);
          } else {
            range.setStartAfter(lastNode);
            range.setEndAfter(lastNode);
          }
        } else {
          range.setStart(contentRef.value, 0);
          range.setEnd(contentRef.value, 0);
        }
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
    
    // Execute the command
    const result = document.execCommand(command, false, value ?? '');
    
    // Sync and emit events
    syncFromDom();
    events.emit('command', { command: command as any, value });
    
    return result;
  };

  const getSelectionRanges = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    return Array.from({ length: selection.rangeCount }).map((_, index) => selection.getRangeAt(index));
  };

  const emitSelectionChange = () => {
    events.emit('selectionChange', { ranges: getSelectionRanges() });
  };

  const handleInput = () => syncFromDom();

  const handleFocus = () => {
    isFocused.value = true;
  };

  const handleBlur = () => {
    isFocused.value = false;
  };

  onMounted(async () => {
    await nextTick();
    if (!contentRef.value) return;
    
    let initialValue = options.modelValue || '';
    
    // Apply custom deserialization on mount
    if (options.deserializationCustom) {
      initialValue = options.deserializationCustom(initialValue);
    }
    
    // Deserialize immutables
    if (options.immutables) {
      initialValue = await immutables.deserializeImmutables(initialValue);
    }
    
    contentRef.value.innerHTML = initialValue;
    html.value = initialValue;
    
    // Mark immutables after setting initial HTML
    await nextTick();
    await immutables.markImmutables();
    
    options.onReady?.();
  });

  watch(
    () => options.modelValue,
    (value) => {
      if (value === html.value) return;
      setHTML(value ?? '');
    },
  );

  return {
    events,
    contentRef,
    html,
    isFocused,
    canEdit,
    exec,
    setHTML,
    getSelectionRanges,
    emitSelectionChange,
    handleInput,
    handleFocus,
    handleBlur,
    immutables,
  };
};


