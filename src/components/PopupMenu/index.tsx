import { makeStyles, Menu, MenuItem } from '@material-ui/core';
import React from 'react';

export interface PopupMenuItem {
  label?: React.ReactNode;
  isSubheader?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

interface Props {
  anchorEl: Element | null;
  isOpen: boolean;
  onClose: () => void;
  items: PopupMenuItem[];
}

const PopupMenu = (props: Props) => {
  const classes = useStyles();

  return (
    <Menu anchorEl={props.anchorEl} open={props.isOpen} onClose={props.onClose}>
      {props.items.map((item, index) => {
        return (
          <MenuItem
            key={index}
            className={item.isSubheader ? classes.subheader : undefined}
            button={!item.isSubheader as any}
            disabled={item.isSubheader}
            selected={item.isSelected}
            onClick={
              item.onClick
                ? () => {
                    if (item.onClick) item.onClick();
                    props.onClose();
                  }
                : undefined
            }
          >
            {item.label}
          </MenuItem>
        );
      })}
    </Menu>
  );
};

const useStyles = makeStyles((theme) => ({
  subheader: {
    fontSize: '0.9em',
    background: 'none !important',
  },
}));

export default PopupMenu;
