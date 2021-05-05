import { Chip } from '@material-ui/core';
import React, { useRef, useState } from 'react';
import PopupMenu, { PopupMenuItem } from '../PopupMenu';

interface Props {
  text: React.ReactNode;
  menuItems: PopupMenuItem[];
  onDelete?: () => void;
  className?: string;
}

const ChipWithMenu = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  return (
    <div ref={ref} style={{ display: 'inline-block' }}>
      <Chip
        className={props.className}
        label={props.text}
        onClick={() => setIsOpen(true)}
        onDelete={props.onDelete}
      />
      <PopupMenu
        anchorEl={ref.current}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={props.menuItems}
      />
    </div>
  );
};

export default ChipWithMenu;
