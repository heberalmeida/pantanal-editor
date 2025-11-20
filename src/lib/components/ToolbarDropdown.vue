<script setup lang="ts">
const props = defineProps<{
  label: string;
  value?: string;
  width?: string;
  options: Array<{ label: string; value: string }>;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  change: [value: string, event: Event];
}>();

const handleChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  emit('change', value, event);
};
</script>

<template>
  <label class="pan-toolbar-dropdown" :style="{ width: width || 'auto' }" :title="label">
    <select
      :value="value"
      :disabled="disabled"
      :aria-label="label"
      @change="handleChange"
      @click.stop
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>



