import { IconButton } from '@material-ui/core';
import React, { useRef, useState } from 'react';
import { Icon } from 'react-feather';
import SimpleTextMenu from '../Menus/SimpleTextMenu';

interface Props {
  icon: Icon;
  iconSize?: string | number;
  size?: 'small' | 'medium';
  menuItems: {
    label: string | React.ReactNode;
    onClick: () => void;
  }[];
}

const IconButtonWithMenu = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  return (
    <div ref={ref}>
      <IconButton size={props.size} onClick={() => setIsOpen(true)}>
        <props.icon size={props.iconSize || 16} />
      </IconButton>

      <SimpleTextMenu
        anchorEl={ref.current}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={props.menuItems}
      />
    </div>
  );
};

export default IconButtonWithMenu;
