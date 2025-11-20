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
  onRequestLink?: (lastValue: string) => void;
  onRequestImageUrl?: (lastValue: string) => void;
}

export const useCommands = ({
  exec,
  fileBrowser,
  imageBrowser,
  onFileSelect,
  onImageSelect,
  onRequestLink,
  onRequestImageUrl,
}: UseCommandsOptions) => {
  const lastLink = ref('');
  const lastImage = ref('');

  const escapeAttr = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const applyLink = (options: { url: string; text?: string; target?: '_self' | '_blank' }) => {
    const url = options.url?.trim();
    if (!url) return;
    lastLink.value = url;
    exec('createLink', url);

    const selection = window.getSelection();
    const getAnchor = () => {
      if (!selection || selection.rangeCount === 0) return null;
      const range = selection.getRangeAt(0);
      let node: Node | null = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }
      return node instanceof HTMLElement ? node.closest('a') : null;
    };

    const anchor = getAnchor();
    if (anchor) {
      if (options.text) {
        anchor.textContent = options.text;
      }
      if (options.target && options.target === '_blank') {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      } else if (options.target) {
        anchor.setAttribute('target', '_self');
        anchor.removeAttribute('rel');
      }
    }
  };

  const applyImage = (options: { url: string; width?: string; alt?: string }) => {
    const src = options.url?.trim();
    if (!src) return;
    lastImage.value = src;
    if (options.width || options.alt) {
      const attrs = [`src="${escapeAttr(src)}"`];
      if (options.alt) {
        attrs.push(`alt="${escapeAttr(options.alt)}"`);
      }
      const styleParts: string[] = [];
      if (options.width) {
        styleParts.push(`width: ${options.width}`);
      }
      const styleAttr = styleParts.length ? ` style="${escapeAttr(styleParts.join('; '))}"` : '';
      exec('insertHTML', `<img ${attrs.join(' ')}${styleAttr} />`);
    } else {
      exec('insertImage', src);
    }
  };

  const run = (command: EditorCommand, value?: string) => {
    if (command === 'createLink') {
      if (value) {
        applyLink({ url: value });
        return;
      }
      if (onRequestLink) {
        onRequestLink(lastLink.value);
        return;
      }
      const url = prompt('Enter URL', lastLink.value || 'https://');
      if (!url) return;
      applyLink({ url });
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
      
      if (value) {
        applyImage({ url: value });
        return;
      }
      
      if (onRequestImageUrl) {
        onRequestImageUrl(lastImage.value);
        return;
      }
      
      // Fallback to prompt
      const url = prompt('Image URL or base64 data', lastImage.value || 'https://');
      if (!url) return;
      applyImage({ url });
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
    applyLink,
    applyImage,
  };
};
