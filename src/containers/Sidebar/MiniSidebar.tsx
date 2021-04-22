import { makeStyles } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { Menu } from 'react-feather';
import { useStoreActions } from '../../store/typedHooks';

const MiniSidebar = () => {
  const classes = useStyles();
  const setSidebarOpen = useStoreActions((a) => a.setSidebarOpen);

  return (
    <div className={classes.container} onClick={() => setSidebarOpen(true)}>
      <div>
        <Menu size={20} />
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 70,
    textAlign: 'center',
    padding: `${theme.spacing(3)}px 0`,
    cursor: 'pointer',

    '&:hover': {
      background: grey[100],
      color: theme.palette.text.primary,
    },

    '& > *': {
      padding: theme.spacing(1.5),
    },
  },
}));

export default MiniSidebar;
