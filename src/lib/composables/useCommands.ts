import { ref } from 'vue';
import type { EditorCommand } from '../types/editor';
import type { FileBrowserProps } from '../types/fileBrowser';
import type { ImageBrowserProps } from '../types/imageBrowser';

interface UseCommandsOptions {
  exec: (command: string, value?: string) => void;
  fileBrowser?: FileBrowserProps;
  imageBrowser?: ImageBrowserProps;
  onFileSelect?: (url: string) => void;
  onImageSelect?: (url: string) => void;
}

export const useCommands = ({ exec, fileBrowser, imageBrowser, onFileSelect, onImageSelect }: UseCommandsOptions) => {
  const lastLink = ref('');
  const lastImage = ref('');

  const run = (command: EditorCommand, value?: string) => {
    if (command === 'createLink') {
      const url = value ?? prompt('Enter URL', lastLink.value || 'https://');
      if (!url) return;
      lastLink.value = url;
      exec('createLink', url);
      return;
    }

    if (command === 'insertImage') {
      // If imageBrowser is configured, use it (preferred for images)
      if (imageBrowser && onImageSelect) {
        // This will be handled by the ImageBrowser component
        return;
      }
      
      // If fileBrowser is configured, use it
      if (fileBrowser && onFileSelect) {
        // This will be handled by the FileBrowser component
        return;
      }
      
      // Fallback to prompt
      const url = value ?? prompt('Image URL or base64 data', lastImage.value || 'https://');
      if (!url) return;
      lastImage.value = url;
      exec('insertImage', url);
      return;
    }

    if (command === 'clearFormatting') {
      exec('removeFormat');
      exec('unlink');
      return;
    }

    exec(command, value);
  };

  return {
    run,
  };
};



