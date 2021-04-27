import {
  Button,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  useTheme,
} from '@material-ui/core';
import { useState } from 'react';
import DefaultButton from '../../../components/Buttons/DefaultButton';
import DefaultDialog from '../../../components/Dialogs/DefaultDialog';
import ExternalAnchor from '../../../components/Typography/ExternalAnchor';
import { useStoreState } from '../../../store/typedHooks';
import ChangeUsername from '../ChangeUsername';

const latestVersion = process.env.REACT_APP_VERSION;

const Settings = () => {
  const theme = useTheme();
  const classes = useStyles();

  const [tab, setTab] = useState(0);
  const [changeUsername, setChangeUsername] = useState(false);
  const [changeUsernameSuccess, setChangeUsernameSuccess] = useState(false);

  const user = useStoreState((s) => s.user);

  return (
    <div>
      <Paper square>
        <Tabs
          value={tab}
          indicatorColor='primary'
          textColor='primary'
          onChange={(_e, tab) => setTab(tab)}
        >
          <Tab label='Account' />
          <Tab label='About' />
        </Tabs>
      </Paper>

      <div className={classes.tabContent} style={{ display: tab === 0 ? 'block' : 'none' }}>
        <List subheader={<ListSubheader>Username</ListSubheader>}>
          <ListItem>
            <ListItemText
              primary={user?.username}
              secondary={
                <DefaultButton
                  text='Change Username'
                  buttonProps={{
                    style: { padding: 0, marginTop: theme.spacing(2) },
                    onClick: () => setChangeUsername(true),
                  }}
                />
              }
            />
            <ListItemSecondaryAction>
              <Button
                variant='outlined'
                onClick={(e) => {
                  e.preventDefault();
                  window.location.reload();
                }}
              >
                Logout
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </div>
      <div className={classes.tabContent} style={{ display: tab === 1 ? 'block' : 'none' }}>
        <List>
          <ListItem>
            <ListItemText primary={<b>Slater Notes (v{latestVersion})</b>} />
          </ListItem>
          <ListItem>
            <ListItemText
              secondary={
                <>
                  Slater Notes is still a pre-release project (v0.x.x). Please use at your own risk.
                  <br />
                  <br />
                  To see the latest changes, see:{' '}
                  <ExternalAnchor href='https://github.com/slater-notes/web/releases'>
                    https://github.com/slater-notes/web/releases
                  </ExternalAnchor>
                </>
              }
            />
          </ListItem>
        </List>
      </div>

      {changeUsername && (
        <ChangeUsername
          onDone={(changed) => {
            setChangeUsername(false);

            if (changed) {
              setChangeUsernameSuccess(true);
            }
          }}
        />
      )}
      {changeUsernameSuccess && (
        <DefaultDialog
          title='Username Changed'
          text={
            <span>
              Your account username is now <b>{user?.username}</b>
            </span>
          }
          withCancel
          cancelLabel='Close'
          autoFocusCancelButton
          onCancel={() => setChangeUsernameSuccess(false)}
        />
      )}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  tabContent: {
    padding: theme.spacing(2),
  },
}));

export default Settings;
