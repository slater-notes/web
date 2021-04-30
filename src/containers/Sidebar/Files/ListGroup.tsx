import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  useTheme,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { Icon } from 'react-feather';

export type Props = {
  items: Item[];
};

export type Item = {
  key: string | number;
  primaryText: React.ReactNode;
  secondaryText?: React.ReactNode;
  icon?: Icon;
  isButton?: boolean;
  isActive?: boolean;
  onClick?: () => void;
};

const ListGroup = (props: Props) => {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <List disablePadding>
      {props.items.map((item) => (
        <ListItem
          key={item.key}
          className={classes.listItem}
          button={item.isButton as any}
          selected={item.isActive}
          onClick={item.onClick}
        >
          <div className={classes.listItemInner}>
            {item.icon && (
              <ListItemIcon>
                <item.icon size={theme.typography.fontSize * 1.5} />
              </ListItemIcon>
            )}
            <ListItemText primary={item.primaryText} secondary={item.secondaryText} />
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

    '&:not(:last-child) $listItemInner': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },

    '& .MuiListItemIcon-root': {
      minWidth: 'auto',
      marginRight: theme.spacing(2),
      paddingTop: theme.spacing(1.5),
    },
  },

  listItemInner: {
    display: 'flex',
    flex: 1,
    padding: `${theme.spacing(0.8)}px ${theme.spacing(2)}px`,
    borderRadius: theme.shape.borderRadius,
  },
}));

export default ListGroup;
