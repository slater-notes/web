import { Chip } from '@material-ui/core';
import React, { useRef, useState } from 'react';
import SimpleTextMenu, { MenuItemObject } from '../Menus/SimpleTextMenu';

interface Props {
  text: React.ReactNode;
  color?: 'primary' | 'secondary';
  menuItems?: MenuItemObject[];
  onDelete?: () => void;
}

const Tag = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  return (
    <div ref={ref} style={{ display: 'inline-block' }}>
      <Chip
        label={props.text}
        color={props.color}
        onClick={
          props.menuItems
            ? () => {
                setIsOpen(true);
              }
            : undefined
        }
        onDelete={props.onDelete}
      />
      {props.menuItems && (
        <SimpleTextMenu
          anchorEl={ref.current}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          items={props.menuItems}
        />
      )}
    </div>
  );
};

export default Tag;
