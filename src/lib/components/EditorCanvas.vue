<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    readonly?: boolean;
    height?: string;
    minHeight?: string;
  }>(),
  {
    height: '420px',
    minHeight: '280px',
  },
);

defineEmits<{
  input: [];
  focus: [];
  blur: [];
  paste: [event: ClipboardEvent];
}>();

const layer = ref<HTMLDivElement | null>(null);

defineExpose({
  layer,
});
</script>

<template>
  <div
    class="pan-editor-canvas"
    :style="{ height: props.height, minHeight: props.minHeight }"
  >
    <div
      class="pan-editor-layer"
      ref="layer"
      :data-placeholder="placeholder"
      :contenteditable="!readonly"
      spellcheck="true"
      role="textbox"
      aria-multiline="true"
      @input="$emit('input')"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      @paste="$emit('paste', $event)"
    />
  </div>
</template>

