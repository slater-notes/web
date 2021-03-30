import React from 'react';
import { makeStyles } from '@material-ui/core';
import { RenderLeafProps } from 'slate-react';

const RenderLeaf = (props: RenderLeafProps) => {
  const classes = useStyles();

  const classNames: string[] = [];

  if (props.leaf.bold) classNames.push(classes.isBold);
  if (props.leaf.italic) classNames.push(classes.isItalic);
  if (props.leaf.underline) classNames.push(classes.isUnderline);

  return (
    <span className={classNames.join(' ')} {...props.attributes}>
      {props.children}
    </span>
  );
};

const useStyles = makeStyles({
  isBold: {
    fontWeight: 'bold',
  },

  isItalic: {
    fontStyle: 'italic',
  },

  isUnderline: {
    textDecoration: 'underline',
  },
});

export default RenderLeaf;
