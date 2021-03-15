import { makeStyles, Menu, MenuItem } from '@material-ui/core';
import React from 'react';

export interface MenuItemObject {
  label?: React.ReactNode;
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
  const classes = useStyles();

  return (
    <Menu
      className={classes.menu}
      anchorEl={props.anchorEl}
      open={props.isOpen}
      onClose={props.onClose}
    >
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

const useStyles = makeStyles((theme) => ({
  menu: {
    '& .MuiListItem-root': {
      fontWeight: theme.typography.fontWeightMedium,
    },
  },
}));

export default SimpleTextMenu;
