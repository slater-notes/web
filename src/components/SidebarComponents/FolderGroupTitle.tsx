import { makeStyles } from '@material-ui/core';
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
    <div className={classes.container}>
      <div>{props.title}</div>
      <div className={classes.iconButton}>
        <DefaultIconButton
          label='Add Folder'
          icon={props.iconButton.icon}
          onClick={props.iconButton.onClick}
        />
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    padding: `${theme.spacing(1)}px ${theme.spacing(4)}px`,
    fontSize: '0.9rem',
    fontWeight: theme.typography.fontWeightMedium,
    textTransform: 'uppercase',
    justifyContent: 'space-between',
    position: 'relative',
    opacity: 0.6,
  },

  iconButton: {
    position: 'relative',
    top: `-${theme.spacing(1.5)}px`,
    right: `-${theme.spacing(1.5)}px`,
  },
}));

export default FolderGroupTitle;
