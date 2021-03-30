import { makeStyles } from '@material-ui/core';
import React from 'react';
import { Bold, Italic, Slash, Underline } from 'react-feather';
import { useSlate } from 'slate-react';
import DefaultIconButton from '../Buttons/DefaultIconButton';
import {
  isBoldMarkActive,
  toggleBoldMark,
  isItalicMarkActive,
  toggleItalicMark,
  isUnderlineMarkActive,
  toggleUnderlineMark,
  clearMarks,
} from './editorCommands';

const Toolbar = () => {
  const editor = useSlate();
  const classes = useStyles();

  const iconFontSize = 16;
  const iconStrokeWidth = 2.5;
  const defaultIconColor = 'inherit';
  const activeIconColor = 'secondary';

  return (
    <div className={classes.container}>
      <div>
        <DefaultIconButton
          label='Bold'
          icon={Bold}
          color={isBoldMarkActive(editor) ? activeIconColor : defaultIconColor}
          strokeWidth={iconStrokeWidth}
          size={iconFontSize}
          onMouseDown={() => toggleBoldMark(editor)}
        />
      </div>
      <div>
        <DefaultIconButton
          label='Italic'
          icon={Italic}
          color={isItalicMarkActive(editor) ? activeIconColor : defaultIconColor}
          strokeWidth={iconStrokeWidth}
          size={iconFontSize}
          onMouseDown={() => toggleItalicMark(editor)}
        />
      </div>
      <div>
        <DefaultIconButton
          label='Underline'
          icon={Underline}
          color={isUnderlineMarkActive(editor) ? activeIconColor : defaultIconColor}
          strokeWidth={iconStrokeWidth}
          size={iconFontSize}
          onMouseDown={() => toggleUnderlineMark(editor)}
        />
      </div>
      <div>
        <DefaultIconButton
          label='Clear Formatting'
          icon={Slash}
          color={defaultIconColor}
          strokeWidth={iconStrokeWidth}
          size={iconFontSize}
          onMouseDown={() => clearMarks(editor)}
        />
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
  },
}));

export default Toolbar;
