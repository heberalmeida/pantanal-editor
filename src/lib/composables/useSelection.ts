import { onMounted, onUnmounted, ref } from 'vue';

const query = (command: string) => document.queryCommandState(command);

export const useSelection = (emitSelection: () => void) => {
  const bold = ref(false);
  const italic = ref(false);
  const underline = ref(false);
  const strikeThrough = ref(false);
  const orderedList = ref(false);
  const unorderedList = ref(false);
  const align = ref<'left' | 'center' | 'right' | 'justify'>('left');
  const fontName = ref('');
  const fontSize = ref('');

  const normalizeFontName = (value: string | null) =>
    (value || '').replace(/['"]/g, '').trim();

  const readSelectionState = () => {
    bold.value = query('bold');
    italic.value = query('italic');
    underline.value = query('underline');
    strikeThrough.value = query('strikeThrough');
    orderedList.value = query('insertOrderedList');
    unorderedList.value = query('insertUnorderedList');

    if (document.queryCommandState('justifyCenter')) {
      align.value = 'center';
    } else if (document.queryCommandState('justifyRight')) {
      align.value = 'right';
    } else if (document.queryCommandState('justifyFull')) {
      align.value = 'justify';
    } else {
      align.value = 'left';
    }

    fontName.value = normalizeFontName(document.queryCommandValue('fontName'));
    const fontSizeValue = document.queryCommandValue('fontSize');
    fontSize.value = typeof fontSizeValue === 'string' ? fontSizeValue : `${fontSizeValue ?? ''}`;
  };

  const handleSelection = () => {
    readSelectionState();
    emitSelection();
  };

  onMounted(() => {
    document.addEventListener('selectionchange', handleSelection);
  });

  onUnmounted(() => {
    document.removeEventListener('selectionchange', handleSelection);
  });

  return {
    bold,
    italic,
    underline,
    strikeThrough,
    orderedList,
    unorderedList,
    align,
    fontName,
    fontSize,
    refresh: readSelectionState,
  };
};





