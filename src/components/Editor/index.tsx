import { makeStyles } from '@material-ui/core';
import { debounce } from 'lodash';
import React from 'react';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, Editable, withReact } from 'slate-react';
import RenderElement from './RenderElement';
import RenderLeaf from './RenderLeaf';
import HoveringToolbar from './HoveringToolbar';

interface Props {
  initialContent?: string; // JSON
  readOnly: boolean;
  onChange: () => void;
  handleSave: (content: string) => void; // content is JSON
}

const SlateEditor = (props: Props) => {
  const classes = useStyles();
  const editor = React.useMemo(() => withHistory(withReact(createEditor())), []);

  const [value, setValue] = React.useState<Node[]>(
    props.initialContent ? JSON.parse(props.initialContent) : defaultInitialContent,
  );

  const renderElement = React.useCallback(RenderElement, []);
  const renderLeaf = React.useCallback(RenderLeaf, []);

  const handleSaveDebounced = React.useMemo(
    () => debounce(props.handleSave, 2500, { leading: false }),
    [],
  );

  const handleChange = (newValue: Node[]) => {
    setValue(newValue);
    props.onChange();
    handleSaveDebounced(JSON.stringify(newValue));
  };

  return (
    <Slate editor={editor} value={value} onChange={handleChange}>
      <HoveringToolbar />
      <Editable
        className={classes.editor}
        readOnly={props.readOnly}
        placeholder='Write something here...'
        renderElement={renderElement}
        renderLeaf={renderLeaf}
      />
    </Slate>
  );
};

const useStyles = makeStyles((theme) => ({
  editor: {
    maxWidth: 900,
    paddingBottom: 300,
    cursor: 'text',
    color: theme.palette.text.primary,
    fontSize: '1.1rem',
  },
}));

const defaultInitialContent = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

export default SlateEditor;
