import type { EditorEventBus } from './useEditorEvents';

export type EditorPlugin = (ctx: { events: EditorEventBus }) => void;

export const usePlugins = (events: EditorEventBus, plugins?: EditorPlugin[]) => {
  plugins?.forEach((plugin) => plugin({ events }));
};






