import { List, ListItem, ListItemSecondaryAction, makeStyles } from '@material-ui/core';
import { Icon } from 'react-feather';
import DefaultIconButton from '../Buttons/DefaultIconButton';

interface Props {
  title: string;
  iconButton: {
    icon: Icon;
    onClick: () => void;
  };
}

const FolderGroupTitle = (props: Props) => {
  const classes = useStyles();

  return (
    <List>
      <ListItem className={classes.listItem}>{props.title}</ListItem>
      <ListItemSecondaryAction>
        <DefaultIconButton
          label='Add Folder'
          icon={props.iconButton.icon}
          onClick={props.iconButton.onClick}
        />
      </ListItemSecondaryAction>
    </List>
  );
};

const useStyles = makeStyles((theme) => ({
  listItem: {
    '&.MuiListItem-gutters': {
      padding: `${theme.spacing(1)}px ${theme.spacing(5)}px`,
    },
  },
}));

export default FolderGroupTitle;
