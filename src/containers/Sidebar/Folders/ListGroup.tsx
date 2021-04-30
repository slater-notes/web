import {
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  useTheme,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
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
          <div className={classes.listItemInner}>
            <ListItemIcon>
              <item.icon size={theme.typography.fontSize * 1.5} />
            </ListItemIcon>
            <ListItemText primary={item.text} secondary={item.sub} />
            {item.secondaryAction && (
              <ListItemSecondaryAction>{item.secondaryAction}</ListItemSecondaryAction>
            )}
          </div>
        </ListItem>
      ))}
    </List>
  );
};

const useStyles = makeStyles((theme) => ({
  listItem: {
    background: 'none !important',

    '&.MuiListItem-gutters': {
      padding: `0 ${theme.spacing(2)}px`,
    },

    '&.Mui-selected $listItemInner': {
      backgroundColor: `${grey[200]} !important`,
    },

    '& .MuiListItemText-root': {
      '& .MuiListItemText-primary': {
        fontSize: '0.9rem',
        fontWeight: theme.typography.fontWeightMedium,
      },
    },

    '& .MuiListItemIcon-root': {
      minWidth: 'auto',
      marginRight: theme.spacing(2),
      color: theme.palette.text.primary,
    },
  },

  listItemInner: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    padding: `${theme.spacing(0.8)}px ${theme.spacing(2)}px`,
    borderRadius: theme.shape.borderRadius,
  },
}));

export default ListGroup;
