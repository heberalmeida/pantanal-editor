import { computed, unref, type MaybeRef } from 'vue';
import type { ToolbarItem } from '../types/editor';

const FONT_SIZES = [
  { label: 'Small', value: '2', previewStyle: { fontSize: '0.85rem' } },
  { label: 'Normal', value: '3', previewStyle: { fontSize: '1rem' } },
  { label: 'Large', value: '4', previewStyle: { fontSize: '1.25rem' } },
  { label: 'Huge', value: '5', previewStyle: { fontSize: '1.5rem' } },
];

const FONT_FAMILIES = [
  { label: 'Inter', value: 'Inter', previewStyle: { fontFamily: 'Inter, sans-serif' } },
  { label: 'Georgia', value: 'Georgia', previewStyle: { fontFamily: 'Georgia, serif' } },
  { label: 'Courier', value: 'Courier New', previewStyle: { fontFamily: '"Courier New", monospace' } },
  { label: 'Monserrat', value: 'Montserrat', previewStyle: { fontFamily: '"Montserrat", sans-serif' } },
];

const BASE_TOOLBAR: ToolbarItem[] = [
  { id: 'undo', label: 'Undo', icon: 'undo', command: 'undo', kind: 'button' },
  { id: 'redo', label: 'Redo', icon: 'redo', command: 'redo', kind: 'button' },
  { id: 'sep-1', label: 'Separator', kind: 'separator' },
  { id: 'fontName', label: 'Font', icon: 'font', command: 'fontName', kind: 'dropdown', options: FONT_FAMILIES, width: '160px' },
  { id: 'fontSize', label: 'Size', icon: 'font-size', command: 'fontSize', kind: 'dropdown', options: FONT_SIZES, width: '120px' },
  { id: 'bold', label: 'Bold', icon: 'bold', command: 'bold', kind: 'button' },
  { id: 'italic', label: 'Italic', icon: 'italic', command: 'italic', kind: 'button' },
  { id: 'underline', label: 'Underline', icon: 'underline', command: 'underline', kind: 'button' },
  { id: 'strikeThrough', label: 'Strike', icon: 'strikethrough', command: 'strikeThrough', kind: 'button' },
  { id: 'foreColor', label: 'Text color', icon: 'text-color', command: 'foreColor', kind: 'color' },
  { id: 'backColor', label: 'Highlight', icon: 'bg-color', command: 'backColor', kind: 'color' },
  { id: 'insertUnorderedList', label: 'Bullets', icon: 'bullet-list', command: 'insertUnorderedList', kind: 'button' },
  { id: 'insertOrderedList', label: 'Numbered', icon: 'number-list', command: 'insertOrderedList', kind: 'button' },
  { id: 'justifyLeft', label: 'Left', icon: 'align-left', command: 'justifyLeft', kind: 'button' },
  { id: 'justifyCenter', label: 'Center', icon: 'align-center', command: 'justifyCenter', kind: 'button' },
  { id: 'justifyRight', label: 'Right', icon: 'align-right', command: 'justifyRight', kind: 'button' },
  { id: 'justifyFull', label: 'Justify', icon: 'align-justify', command: 'justifyFull', kind: 'button' },
  { id: 'createLink', label: 'Link', icon: 'link', command: 'createLink', kind: 'button' },
  { id: 'insertImage', label: 'Image', icon: 'image', command: 'insertImage', kind: 'button' },
  { id: 'clearFormatting', label: 'Clear', icon: 'clear', command: 'clearFormatting', kind: 'button' },
];

export const useToolbar = (
  enabled?: MaybeRef<string[] | undefined | null>,
  customTools?: MaybeRef<ToolbarItem[] | undefined | null>
) => {
  const items = computed(() => {
    const normalized = unref(enabled);
    const custom = unref(customTools);
    
    let baseItems = BASE_TOOLBAR;
    
    // Filter base toolbar if enabled list is provided
    if (normalized && normalized.length > 0) {
      baseItems = BASE_TOOLBAR.filter(
        (item) => item.kind === 'separator' || normalized.includes(item.id)
      );
    }
    
    // Merge custom tools if provided
    if (custom && custom.length > 0) {
      // Insert custom tools after base tools
      return [...baseItems, ...custom];
    }
    
    return baseItems;
  });

  return {
    toolbarItems: items,
  };
};
