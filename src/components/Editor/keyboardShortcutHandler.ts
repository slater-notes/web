import React from 'react';
import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { toggleBoldMark } from './editorCommands';

const keyboardShortcutHandler = (e: React.KeyboardEvent, editor: Editor) => {
  if (isHotkey('mod+b', e as any)) {
    toggleBoldMark(editor);
    return;
  }
};

export default keyboardShortcutHandler;
