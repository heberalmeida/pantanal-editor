<script setup lang="ts">
import { computed } from 'vue';
import { getIcon } from '../icons/registry';

const props = defineProps<{
  label: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();

const iconMarkup = computed(() => getIcon(props.icon));

const handleClick = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  emit('click');
};

const handleMouseDown = (e: MouseEvent) => {
  // Prevent button from taking focus
  e.preventDefault();
};
</script>

<template>
  <button
    class="pan-toolbar-btn"
    type="button"
    :aria-pressed="active"
    :disabled="disabled"
    :title="label"
    :aria-label="label"
    @mousedown="handleMouseDown"
    @click="handleClick"
  >
    <span class="pan-toolbar-icon" aria-hidden="true" v-html="iconMarkup" />
  </button>
</template>

