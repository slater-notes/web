import { Menu, MenuItem } from '@material-ui/core';
import React from 'react';

export interface MenuItemObject {
  label?: string | React.ReactNode;
  replacementLabel?: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
}

interface Props {
  anchorEl: Element | null;
  isOpen: boolean;
  onClose: () => void;
  items: MenuItemObject[];
}

const SimpleTextMenu = (props: Props) => {
  return (
    <Menu anchorEl={props.anchorEl} open={props.isOpen} onClose={props.onClose}>
      {props.items.map((item, index) => {
        if (item.replacementLabel) {
          return (
            <MenuItem key={index} disabled>
              {item.replacementLabel}
            </MenuItem>
          );
        }

        return (
          <MenuItem
            key={index}
            dense
            selected={item.isSelected}
            onClick={() => {
              if (item.onClick) {
                item.onClick();
              }

              props.onClose();
            }}
          >
            {item.label}
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export default SimpleTextMenu;
