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
  disabled?: boolean;
  onClick?: () => void;
}

const DefaultIconButton = (props: Props) => {
  const fillProps = props.fill ? { fill: props.fill } : undefined;

  return (
    <Tooltip title={props.label || ''}>
      <IconButton
        color={props.color}
        disabled={props.disabled}
        style={props.style}
        onClick={props.onClick}
      >
        <props.icon size={props.size || 16} {...fillProps} />
      </IconButton>
    </Tooltip>
  );
};

export default DefaultIconButton;
