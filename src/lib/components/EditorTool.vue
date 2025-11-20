<script setup lang="ts">
import { computed, h, ref } from 'vue';
import type { ToolbarItem, ToolExecContext, EditorCommand } from '../types/editor';
import { getIcon } from '../icons/registry';

const props = defineProps<{
  tool: ToolbarItem;
  active?: boolean;
  disabled?: boolean;
  editorApi?: {
    getHTML: () => string;
    setHTML: (html: string) => void;
    exec: (command: EditorCommand, value?: string) => void;
    getSelection: () => Selection | null;
  };
}>();

const emit = defineEmits<{
  execute: [context: ToolExecContext];
}>();

const isOpen = ref(false);

const createContext = (value?: string): ToolExecContext => {
  if (props.editorApi) {
    return {
      editor: props.editorApi,
      value,
    };
  }
  
  // Fallback to DOM queries
  return {
    editor: {
      getHTML: () => {
        const editor = document.querySelector('.pan-editor-layer') as HTMLElement;
        return editor?.innerHTML || '';
      },
      setHTML: (html: string) => {
        const editor = document.querySelector('.pan-editor-layer') as HTMLElement;
        if (editor) {
          editor.innerHTML = html;
          editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
      },
      exec: (command: string, value?: string) => {
        document.execCommand(command, false, value);
        const editor = document.querySelector('.pan-editor-layer') as HTMLElement;
        if (editor) {
          editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
      },
      getSelection: () => window.getSelection(),
    },
    value,
  };
};

const handleClick = async (e: MouseEvent) => {
  e.stopPropagation();
  if (props.disabled || !props.tool.exec) return;
  
  const context = createContext();
  await props.tool.exec(context);
  emit('execute', context);
};

const handleDropdownChange = async (e: Event) => {
  e.stopPropagation();
  const value = (e.target as HTMLSelectElement).value;
  const context = createContext(value);
  
  if (props.tool.exec) {
    await props.tool.exec(context);
  }
  emit('execute', context);
};

const renderTool = () => {
  // Custom template rendering
  if (props.tool.template) {
    const div = document.createElement('div');
    div.innerHTML = props.tool.template;
    const element = div.firstElementChild as HTMLElement;
    if (element && props.tool.exec) {
      element.addEventListener('click', (e) => {
        e.stopPropagation();
        handleClick(e as any);
      });
    }
    return element;
  }
  
  // Button tool
  if (props.tool.kind === 'button' || (props.tool.kind === 'custom' && !props.tool.items)) {
    return h('button', {
      class: 'pan-toolbar-btn',
      type: 'button',
      'aria-pressed': props.active,
      disabled: props.disabled,
      title: props.tool.tooltip || props.tool.label,
      'aria-label': props.tool.tooltip || props.tool.label,
      onClick: handleClick,
    }, [
      props.tool.icon ? h('span', {
        class: 'pan-toolbar-icon',
        innerHTML: getIcon(props.tool.icon),
        'aria-hidden': 'true',
      }) : null,
      !props.tool.icon ? props.tool.label : null,
    ]);
  }
  
  // Dropdown tool
  if ((props.tool.kind === 'dropdown' || props.tool.kind === 'custom') && props.tool.items) {
    return h('label', {
      class: 'pan-toolbar-dropdown',
      style: props.tool.width ? { width: props.tool.width } : undefined,
      title: props.tool.tooltip || props.tool.label,
    }, [
      h('select', {
        disabled: props.disabled,
        'aria-label': props.tool.tooltip || props.tool.label,
        onChange: handleDropdownChange,
        onClick: (e: MouseEvent) => e.stopPropagation(),
      }, props.tool.items.map(item => 
        h('option', { value: item.value }, item.label)
      )),
    ]);
  }
  
  return null;
};
</script>

<template>
  <component :is="renderTool()" />
</template>

