import { IconButton, Tooltip } from '@material-ui/core';
import React from 'react';
import { Icon } from 'react-feather';

interface Props {
  label?: string;
  style?: React.CSSProperties;
  icon: Icon;
  size?: string | number;
  color?: 'default' | 'inherit' | 'primary' | 'secondary';
  fill?: string;
  strokeWidth?: number;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
}

const DefaultIconButton = (props: Props) => {
  const fillProps = props.fill ? { fill: props.fill } : undefined;

  return (
    <Tooltip title={props.label || ''}>
      <IconButton
        color={props.color || 'inherit'}
        disabled={props.disabled}
        style={props.style}
        onClick={props.onClick}
        onMouseDown={props.onMouseDown}
      >
        <props.icon size={props.size || 16} {...fillProps} strokeWidth={props.strokeWidth || 2} />
      </IconButton>
    </Tooltip>
  );
};

export default DefaultIconButton;
