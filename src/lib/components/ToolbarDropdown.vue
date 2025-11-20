<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

type DropdownOption = { label: string; value: string; previewStyle?: Record<string, string> };

const props = defineProps<{
  label: string;
  value?: string;
  width?: string;
  options: DropdownOption[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  change: [value: string, event: Event];
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const selectedOption = computed(() => {
  return props.options.find((option) => option.value === props.value) ?? null;
});

const selectedLabel = computed(() => {
  if (selectedOption.value) return selectedOption.value.label;
  if (props.value) return props.value;
  return props.label;
});

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const getPreviewStyle = (
  option?: { value: string; previewStyle?: Record<string, string> },
  fallbackValue?: string
) => {
  if (option) {
    if (option.previewStyle) {
      return option.previewStyle;
    }
    if (option.value) {
      return { fontFamily: option.value };
    }
  }

  if (fallbackValue) {
    return { fontFamily: fallbackValue };
  }
  return {};
};

const handleSelect = (option: DropdownOption, event: MouseEvent) => {
  emit('change', option.value, event);
  isOpen.value = false;
};

const handleOutsideClick = (event: MouseEvent) => {
  if (!dropdownRef.value) return;
  if (dropdownRef.value.contains(event.target as Node)) return;
  isOpen.value = false;
};

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick);
});

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      isOpen.value = false;
    }
  },
);
</script>

<template>
  <div
    class="pan-toolbar-dropdown"
    :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
    :style="{ width: width || 'auto' }"
    ref="dropdownRef"
    :title="label"
  >
    <button
      type="button"
      class="pan-toolbar-dropdown-trigger"
      :aria-haspopup="'listbox'"
      :aria-expanded="isOpen"
      :disabled="disabled"
      @click.stop="toggleDropdown"
    >
      <span class="pan-toolbar-dropdown-label" :style="getPreviewStyle(selectedOption || undefined, value)">
        {{ selectedLabel }}
      </span>
      <span class="pan-toolbar-dropdown-icon" aria-hidden="true" />
    </button>
    <div
      v-if="isOpen"
      class="pan-toolbar-dropdown-menu"
      role="listbox"
      :aria-label="label"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="pan-toolbar-dropdown-option"
        :class="{ 'is-selected': option.value === value }"
        :style="getPreviewStyle(option)"
        role="option"
        :aria-selected="option.value === value"
        @click.stop="handleSelect(option, $event)"
      >
        <span class="pan-toolbar-dropdown-option-label">{{ option.label }}</span>
        <span class="pan-toolbar-dropdown-check" aria-hidden="true">✔</span>
      </button>
    </div>
  </div>
</template>
