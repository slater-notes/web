import { makeStyles } from '@material-ui/core';
import { useCallback, useMemo } from 'react';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, Editable, withReact } from 'slate-react';
import RenderElement from './RenderElement';
import RenderLeaf from './RenderLeaf';
import HoveringToolbar from './HoveringToolbar';
import keyboardShortcutHandler from './keyboardShortcutHandler';

interface Props {
  value: Node[];
  setValue: (value: Node[]) => void;
  onChange: (value: Node[]) => void;
  readOnly: boolean;
}

const SlateEditor = (props: Props) => {
  const classes = useStyles();
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const renderElement = useCallback(RenderElement, []);
  const renderLeaf = useCallback(RenderLeaf, []);

  const handleChange = (value: Node[]) => {
    // only trigger onChange when content actually changes
    if (JSON.stringify(value) !== JSON.stringify(props.value)) {
      console.log('new content!');
      props.onChange(value);
    }

    props.setValue(value);
  };

  return (
    <Slate editor={editor} value={props.value} onChange={handleChange}>
      <HoveringToolbar />
      <Editable
        className={classes.editor}
        readOnly={props.readOnly}
        placeholder='Write something here...'
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(e) => keyboardShortcutHandler(e, editor)}
      />
    </Slate>
  );
};

const useStyles = makeStyles((theme) => ({
  editor: {
    paddingBottom: 300,
    cursor: 'text',
    color: theme.palette.text.primary,
    fontSize: '1.1rem',
  },
}));

export default SlateEditor;
