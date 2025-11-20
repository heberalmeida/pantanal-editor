import type { DeserializationCustom } from '../types/editor';

interface UsePasteOptions {
  allowedFormatting: boolean;
  deserializationCustom?: DeserializationCustom;
}

export const usePaste = ({ allowedFormatting, deserializationCustom }: UsePasteOptions) => {
  const handlePaste = (event: ClipboardEvent) => {
    // If formatting is allowed and no custom deserialization, use default browser behavior
    if (allowedFormatting && !deserializationCustom) return;
    
    event.preventDefault();
    
    // Try to get HTML first, fallback to plain text
    const htmlData = event.clipboardData?.getData('text/html') ?? '';
    const textData = event.clipboardData?.getData('text/plain') ?? '';
    
    if (htmlData && (allowedFormatting || deserializationCustom)) {
      // If we have HTML and formatting is allowed or custom deserialization is provided, process it
      let processedHtml = htmlData;
      
      if (deserializationCustom) {
        processedHtml = deserializationCustom(htmlData);
      }
      
      // Insert HTML using a temporary div
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = processedHtml;
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      // Plain text paste
      document.execCommand('insertText', false, textData);
    }
  };

  return {
    handlePaste,
  };
};


