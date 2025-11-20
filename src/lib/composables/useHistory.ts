import { ref } from 'vue';

interface HistoryOptions {
  capacity?: number;
}

export const useHistory = ({ capacity = 50 }: HistoryOptions = {}) => {
  const stack = ref<string[]>([]);
  const pointer = ref(-1);

  const snapshot = (value: string) => {
    if (!value) return;
    if (stack.value[pointer.value] === value) return;
    stack.value = stack.value.slice(0, pointer.value + 1);
    stack.value.push(value);
    if (stack.value.length > capacity) {
      stack.value.shift();
    }
    pointer.value = stack.value.length - 1;
  };

  const undo = () => {
    if (pointer.value <= 0) return null;
    pointer.value -= 1;
    return stack.value[pointer.value];
  };

  const redo = () => {
    if (pointer.value >= stack.value.length - 1) return null;
    pointer.value += 1;
    return stack.value[pointer.value];
  };

  return {
    stack,
    pointer,
    snapshot,
    undo,
    redo,
  };
};






