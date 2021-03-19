import React from 'react';
import { convertFromRaw, convertToRaw, Editor, EditorState, RawDraftContentState } from 'draft-js';
import { makeStyles } from '@material-ui/core';
import { debounce } from 'lodash';

import 'draft-js/dist/Draft.css';

interface Props {
  initialContent?: RawDraftContentState;
  readOnly?: boolean;
  handleSave: (content: RawDraftContentState) => void;
  onChange?: () => void;
}

const DraftEditor = (props: Props) => {
  const classes = useStyles();

  const [editorState, setEditorState] = React.useState(() =>
    props.initialContent
      ? EditorState.createWithContent(convertFromRaw(props.initialContent))
      : EditorState.createEmpty(),
  );

  const editor = React.useRef<any>(null);

  const handleSaveDebounced = React.useMemo(
    () => debounce(props.handleSave, 1000, { leading: false }),
    [],
  );

  const focusEditor = () => {
    editor.current?.focus();
  };

  const handleChange = (es: EditorState) => {
    const oldContent = editorState.getCurrentContent();
    const newContent = es.getCurrentContent();

    if (oldContent.getPlainText() !== newContent.getPlainText()) {
      if (props.onChange) props.onChange();
      handleSaveDebounced(convertToRaw(newContent));
    }

    setEditorState(es);
  };

  return (
    <div className={classes.container} onClick={focusEditor}>
      <Editor
        ref={editor}
        editorState={editorState}
        placeholder='Write something here...'
        readOnly={props.readOnly}
        textAlignment='left'
        textDirectionality='LTR'
        onChange={handleChange}
      />
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: 900,
    paddingBottom: 300,
    cursor: 'text',
    color: theme.palette.text.primary,
    fontSize: '1.1rem',
  },
}));

export default DraftEditor;
