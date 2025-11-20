import { onBeforeUnmount } from 'vue';
import type { EditorEventKey, EditorEvents } from '../types/editor';

type Listener<K extends EditorEventKey> = EditorEvents[K];

export interface EditorEventBus {
  emit<K extends EditorEventKey>(event: K, payload: Parameters<EditorEvents[K]>[0]): void;
  on<K extends EditorEventKey>(event: K, handler: Listener<K>): () => void;
}

export const useEditorEvents = (): EditorEventBus => {
  const listeners = new Map<EditorEventKey, Set<Function>>();

  const emit = <K extends EditorEventKey>(event: K, payload: Parameters<EditorEvents[K]>[0]) => {
    const handlers = listeners.get(event);
    handlers?.forEach((handler) => handler(payload));
  };

  const onEvent = <K extends EditorEventKey>(event: K, handler: Listener<K>) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }

    listeners.get(event)?.add(handler);

    const off = () => listeners.get(event)?.delete(handler);
    onBeforeUnmount(off);
    return off;
  };

  return {
    emit,
    on: onEvent,
  };
};






