import { ListItem, makeStyles, Menu } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import React from 'react';

export interface MenuItemObject {
  label?: React.ReactNode;
  isSubheader?: boolean;
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
        return (
          <ListItem
            key={index}
            className={item.isSubheader ? classes.subheader : undefined}
            button={!item.isSubheader as any}
            dense
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
          </ListItem>
        );
      })}
    </Menu>
  );
};

const useStyles = makeStyles((theme) => ({
  menu: {
    '& .MuiList-root': {
      padding: theme.spacing(1),
      minWidth: 150,
    },

    '& .MuiListItem-root': {
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
      borderRadius: theme.shape.borderRadius,
      fontWeight: theme.typography.fontWeightMedium,

      '&:not(:last-child)': {
        marginBottom: theme.spacing(0.5),
      },

      '&:not($subheader)': {
        '&.Mui-selected, &:hover': {
          backgroundColor: grey[100],
        },
      },
    },
  },

  subheader: {
    fontSize: '0.9em',
  },
}));

export default SimpleTextMenu;
