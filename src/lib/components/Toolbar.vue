<script setup lang="ts">
import type { ToolbarItem, ToolExecContext } from '../types/editor';
import ToolbarButton from './ToolbarButton.vue';
import ToolbarDropdown from './ToolbarDropdown.vue';
import EditorTool from './EditorTool.vue';

const props = defineProps<{
  items: ToolbarItem[];
  activeCommands: Record<string, boolean>;
  disabled?: boolean;
  editorApi?: {
    getHTML: () => string;
    setHTML: (html: string) => void;
    exec: (command: any, value?: string) => void;
    getSelection: () => Selection | null;
  };
}>();

const emit = defineEmits<{
  command: [payload: { id: string; value?: string }];
  toolExecute: [context: ToolExecContext];
}>();

const handleColorChange = (id: string, event: Event) => {
  event.stopPropagation();
  emit('command', { id, value: (event.target as HTMLInputElement).value });
};

const handleDropdownChange = (id: string, value: string, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  emit('command', { id, value });
};

const handleToolExecute = (context: ToolExecContext) => {
  emit('toolExecute', context);
};
</script>

<template>
  <div class="pan-toolbar" role="toolbar">
    <template v-for="item in items" :key="item.id">
      <div v-if="item.kind === 'separator'" class="pan-toolbar-separator" />
      <EditorTool
        v-else-if="item.kind === 'custom' || item.exec"
        :tool="item"
        :active="activeCommands[item.id]"
        :disabled="disabled || item.disabled"
        :editor-api="editorApi"
        @execute="handleToolExecute"
      />
      <ToolbarButton
        v-else-if="item.kind === 'button'"
        :label="item.label"
        :icon="item.icon"
        :active="activeCommands[item.id]"
        :disabled="disabled || item.disabled"
        @click="emit('command', { id: item.id })"
      />
      <ToolbarDropdown
        v-else-if="item.kind === 'dropdown'"
        :label="item.label"
        :options="item.options || []"
        :width="item.width"
        :disabled="disabled || item.disabled"
        @change="(value, event) => handleDropdownChange(item.id, value, event)"
      />
      <label
        v-else-if="item.kind === 'color'"
        class="pan-toolbar-color"
        :title="item.label"
        :aria-label="item.label"
        @click.stop
      >
        <input
          type="color"
          :disabled="disabled || item.disabled"
          @input="handleColorChange(item.id, $event)"
          @click.stop
        />
      </label>
    </template>
  </div>
</template>



