---
title: EditorCommand Type
description: "Type definitions for editor commands"
---

# EditorCommand

Type definition for all available editor commands.

## Type Definition

```typescript
export type EditorCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'fontSize'
  | 'fontName'
  | 'foreColor'
  | 'backColor'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'justifyLeft'
  | 'justifyCenter'
  | 'justifyRight'
  | 'justifyFull'
  | 'createLink'
  | 'insertImage'
  | 'removeFormat'
  | 'undo'
  | 'redo'
  | 'clearFormatting';
```

## Usage

```typescript
import type { EditorCommand } from '@pantanal/editor';

const command: EditorCommand = 'bold';
editorRef.value?.exec(command);
```

## Available Commands

### Text Formatting
- `bold` - Make text bold
- `italic` - Make text italic
- `underline` - Underline text
- `strikeThrough` - Strikethrough text

### Font
- `fontSize` - Change font size
- `fontName` - Change font family

### Colors
- `foreColor` - Text color
- `backColor` - Background/highlight color

### Lists
- `insertUnorderedList` - Bullet list
- `insertOrderedList` - Numbered list

### Alignment
- `justifyLeft` - Align left
- `justifyCenter` - Align center
- `justifyRight` - Align right
- `justifyFull` - Justify text

### Media
- `createLink` - Insert link
- `insertImage` - Insert image

### Utilities
- `removeFormat` - Remove formatting
- `clearFormatting` - Clear all formatting
- `undo` - Undo last action
- `redo` - Redo last action

## Suggested Links

- [PantanalEditor API](/api/pantanal-editor)
- [ToolbarItem Type](/api/toolbar-item)




