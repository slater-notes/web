import { makeStyles, Paper, Popper } from '@material-ui/core';
import React from 'react';
import { Editor, Range } from 'slate';
import { useSlate } from 'slate-react';
import Toolbar from './Toolbar';

const HoveringToolbar = () => {
  const classes = useStyles();
  const editor = useSlate();

  const [isOpen, setIsOpen] = React.useState(false);
  const [anchor, setAnchor] = React.useState<Anchor | null>(null);

  React.useEffect(() => {
    const { selection } = editor;

    if (!selection || Range.isCollapsed(selection) || Editor.string(editor, selection) === '') {
      setIsOpen(false);
      return;
    }

    const domSelection = globalThis.getSelection();
    const domRange = domSelection?.getRangeAt(0);
    const rect = domRange?.getBoundingClientRect();

    if (rect) {
      setAnchor({
        clientWidth: rect.width,
        clientHeight: rect.height,
        getBoundingClientRect: () => rect,
      });
      setIsOpen(true);
    }
  }, [editor.selection]);

  return (
    <Popper anchorEl={anchor} open={isOpen} className={classes.popper} placement='top' keepMounted>
      <Paper className={classes.paper} elevation={3}>
        <Toolbar />
      </Paper>
    </Popper>
  );
};

const useStyles = makeStyles((theme) => ({
  popper: {
    top: '-8px !important',
  },
  paper: {
    padding: `${theme.spacing(0.5)}px ${theme.spacing(1.5)}px`,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

interface Anchor {
  clientWidth: number;
  clientHeight: number;
  getBoundingClientRect: () => DOMRect;
}

export default HoveringToolbar;
