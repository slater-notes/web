import { makeStyles } from '@material-ui/core';
import React from 'react';
import { RenderElementProps } from 'slate-react';

const TextElement = (props: RenderElementProps) => {
  const classes = useStyles();

  return (
    <div className={classes.textElement} {...props.attributes}>
      {props.children}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  textElement: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

const RenderElement = (props: RenderElementProps) => {
  switch (props.element.type) {
    default:
      return <TextElement {...props} />;
  }
};

export default RenderElement;
