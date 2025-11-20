import { onMounted, onUnmounted } from 'vue';
import type { EditorCommand } from '../types/editor';

type ShortcutMap = Record<string, EditorCommand>;

const defaultShortcuts: ShortcutMap = {
  'ctrl+b': 'bold',
  'meta+b': 'bold',
  'ctrl+i': 'italic',
  'meta+i': 'italic',
  'ctrl+u': 'underline',
  'meta+u': 'underline',
  'ctrl+shift+x': 'strikeThrough',
  'meta+shift+x': 'strikeThrough',
  'ctrl+z': 'undo',
  'meta+z': 'undo',
  'ctrl+shift+z': 'redo',
  'meta+shift+z': 'redo',
  'ctrl+shift+l': 'insertUnorderedList',
  'meta+shift+l': 'insertUnorderedList',
};

export const useShortcuts = (runCommand: (command: EditorCommand) => void) => {
  const handler = (event: KeyboardEvent) => {
    const segments = [];
    if (event.metaKey) segments.push('meta');
    if (event.ctrlKey) segments.push('ctrl');
    if (event.shiftKey) segments.push('shift');
    segments.push(event.key.toLowerCase());
    const key = segments.join('+');

    const command = defaultShortcuts[key];
    if (command) {
      event.preventDefault();
      runCommand(command);
    }
  };

  onMounted(() => {
    document.addEventListener('keydown', handler);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handler);
  });
};






