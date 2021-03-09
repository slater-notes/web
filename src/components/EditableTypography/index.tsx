import { Typography, TypographyTypeMap } from '@material-ui/core';
import React from 'react';

interface Props {
  text: string;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  typographyProps?: TypographyTypeMap['props'] & { component?: string; style?: any };
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const EditableTypography = React.forwardRef((props: Props, ref: any) => {
  return (
    <Typography className={props.className} {...props.typographyProps}>
      <input
        ref={ref}
        value={props.text}
        placeholder={props.placeholder}
        autoFocus={props.autoFocus}
        disabled={props.disabled}
        style={{
          background: 'none',
          outline: 'none',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          fontFamily: 'inherit',
          letterSpacing: 'inherit',
          lineHeight: 'inherit',
          color: 'inherit',
          border: 0,
          margin: 0,
          padding: 0,
          width: '100%',
        }}
        onChange={(event) => props.onChange(event.currentTarget.value)}
        onBlur={props.onBlur}
        onKeyPress={props.onKeyPress}
        onKeyDown={props.onKeyDown}
      />
    </Typography>
  );
});

export default EditableTypography;
