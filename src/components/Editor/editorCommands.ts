import { Editor, Transforms, Text } from 'slate';

export const isBoldMarkActive = (editor: Editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.bold === true,
    universal: true,
  }) as any;

  return !!match;
};

export const isItalicMarkActive = (editor: Editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.italic === true,
    universal: true,
  }) as any;

  return !!match;
};

export const isUnderlineMarkActive = (editor: Editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.underline === true,
    universal: true,
  }) as any;

  return !!match;
};

export const toggleBoldMark = (editor: Editor) => {
  Transforms.setNodes(
    editor,
    { bold: !isBoldMarkActive(editor) },
    { match: (n) => Text.isText(n), split: true },
  );
};

export const toggleItalicMark = (editor: Editor) => {
  Transforms.setNodes(
    editor,
    { italic: !isItalicMarkActive(editor) },
    { match: (n) => Text.isText(n), split: true },
  );
};

export const toggleUnderlineMark = (editor: Editor) => {
  Transforms.setNodes(
    editor,
    { underline: !isUnderlineMarkActive(editor) },
    { match: (n) => Text.isText(n), split: true },
  );
};

export const clearMarks = (editor: Editor) => {
  Transforms.setNodes(
    editor,
    { bold: false, italic: false, underline: false },
    { match: (n) => Text.isText(n) },
  );
};
