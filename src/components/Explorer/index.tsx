import {
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListItemTypeMap,
  makeStyles,
  Typography,
  useTheme,
} from '@material-ui/core';
import React from 'react';
import { Icon } from 'react-feather';

export interface Props {
  title?: string;
  titleRightComponent?: React.ReactNode;
  dense?: boolean;
  horizontalSpacing?: number;
  withDividers?: boolean;
  nonClickable?: boolean;
  childrenAfterTitle?: React.ReactNode;
  disableGutter?: boolean;
  items: {
    listItemProps?: ListItemTypeMap<any, any>;
    icon?: Icon;
    text: string;
    textDisplayReplacement?: React.ReactNode;
    sub?: string;
    secondaryAction?: React.ReactNode;
    isActive?: boolean;
    disabled?: boolean;
    onClick?: () => void;
  }[];
}

const Explorer = (props: Props) => {
  const theme = useTheme();
  const classes = useStyles({ horizontalSpacing: props.horizontalSpacing });

  return (
    <div>
      {props.title && (
        <div className={classes.listTitle}>
          <span>{props.title}</span>
          {props.titleRightComponent}
        </div>
      )}

      {props.childrenAfterTitle}

      <List disablePadding>
        {props.withDividers && <Divider />}
        {props.items.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem
              className={classes.listItem}
              selected={item.isActive}
              button={!props.nonClickable as any}
              disableGutters={props.disableGutter}
              disableRipple={!props.nonClickable}
              onClick={item.onClick}
              disabled={item.disabled}
            >
              {item.icon && (
                <ListItemIcon>
                  <item.icon size={theme.typography.fontSize * 1.5} />
                </ListItemIcon>
              )}

              <ListItemText
                primary={item.textDisplayReplacement || item.text}
                secondary={item.sub}
              />

              {item.secondaryAction && (
                <ListItemSecondaryAction>{item.secondaryAction}</ListItemSecondaryAction>
              )}
            </ListItem>
            {props.withDividers && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </div>
  );
};

interface StylesProps {
  horizontalSpacing?: number;
}

const useStyles = makeStyles((theme) => ({
  listItem: (props: StylesProps) => ({
    '&.MuiListItem-gutters': {
      padding: `${theme.spacing(1)}px ${props.horizontalSpacing || theme.spacing(2)}px`,
    },

    '&.MuiListItem-root.Mui-selected, &.MuiListItem-root.Mui-selected:hover': {
      background: 'none',
    },

    '& .MuiListItemText-root': {
      '& .MuiListItemText-primary': {
        fontSize: '0.9rem',
      },
    },

    '& .MuiListItemIcon-root': {
      minWidth: 'auto',
      marginRight: '1rem',
      color: theme.palette.text.primary,
    },
  }),

  listTitle: (props: StylesProps) => ({
    display: 'flex',
    padding: `${theme.spacing(1)}px ${props.horizontalSpacing || theme.spacing(2)}px`,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    justifyContent: 'space-between',
    position: 'relative',
    opacity: 0.6,
  }),

  dense: {
    paddingTop: 2,
    paddingBottom: 2,

    '& .MuiListItemText-root': {
      marginTop: 0,
      marginBottom: 0,
    },
  },
}));

export default Explorer;
