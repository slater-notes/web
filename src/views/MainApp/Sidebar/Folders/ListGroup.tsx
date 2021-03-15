import {
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  useTheme,
} from '@material-ui/core';
import React from 'react';
import { Icon } from 'react-feather';

export interface Props {
  items: {
    key: string | number;
    icon: Icon;
    text: React.ReactNode;
    sub?: React.ReactNode;
    secondaryAction?: React.ReactNode;
    isActive?: boolean;
    isDisabled?: boolean;
    hasNormalTextColor?: boolean;
    onClick?: () => void;
  }[];
}

const ListGroup = (props: Props) => {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <List disablePadding>
      {props.items.map((item) => (
        <ListItem
          key={item.key}
          button
          disableRipple
          selected={item.isActive}
          onClick={item.onClick}
          className={classes.listItem}
          style={{ color: item.hasNormalTextColor ? theme.palette.text.primary : undefined }}
        >
          <ListItemIcon>
            <item.icon size={theme.typography.fontSize * 1.5} />
          </ListItemIcon>
          <ListItemText primary={item.text} secondary={item.sub} />
          {item.secondaryAction && (
            <ListItemSecondaryAction>{item.secondaryAction}</ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
};

const useStyles = makeStyles((theme) => ({
  listItem: {
    color: theme.palette.text.secondary,
    background: 'none !important',

    '&.MuiListItem-gutters': {
      padding: `${theme.spacing(1)}px ${theme.spacing(5)}px`,
    },

    '&.Mui-selected': {
      color: theme.palette.text.primary,
      boxShadow: `inset 4px 0px 0px ${theme.palette.secondary.main}`,
    },

    '& .MuiListItemText-root': {
      '& .MuiListItemText-primary': {
        fontSize: '0.9rem',
        fontWeight: theme.typography.fontWeightMedium,
      },
    },

    '& .MuiListItemIcon-root': {
      minWidth: 'auto',
      marginRight: theme.spacing(4),
      color: theme.palette.text.primary,
    },
  },
}));

export default ListGroup;
