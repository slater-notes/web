import {
  Button,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  makeStyles,
  Paper,
  Switch,
  Tab,
  Tabs,
  useTheme,
} from '@material-ui/core';
import { useState } from 'react';
import DefaultButton from '../../../components/Buttons/DefaultButton';
import DefaultDialog from '../../../components/Dialogs/DefaultDialog';
import defaultUserSettings from '../../../config/defaultUserSettings';
import { useStoreActions, useStoreState } from '../../../store/typedHooks';
import ChangeUsername from '../ChangeUsername';

const latestVersion = process.env.REACT_APP_VERSION;

const Settings = () => {
  const theme = useTheme();
  const classes = useStyles();

  const [tab, setTab] = useState(0);
  const [changeUsername, setChangeUsername] = useState(false);
  const [changeUsernameSuccess, setChangeUsernameSuccess] = useState(false);

  const user = useStoreState((s) => s.user);

  const mySettings = useStoreState((s) => s.settings);
  const settings = { ...defaultUserSettings, ...mySettings };

  const updateSettings = useStoreActions((a) => a.updateSettings);

  return (
    <div>
      <Paper square>
        <Tabs
          value={tab}
          indicatorColor='primary'
          textColor='primary'
          onChange={(_e, tab) => setTab(tab)}
        >
          <Tab label='Appearance' />
          <Tab label='Account' />
          <Tab label='About' />
        </Tabs>
      </Paper>

      <div className={classes.tabContent} style={{ display: tab === 0 ? 'block' : 'none' }}>
        <List subheader={<ListSubheader>Sidebar</ListSubheader>}>
          <ListItem>
            <ListItemText
              primary='Show sidebar'
              secondary='Prefer to show the sidebar when it fits within the screen.'
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.alwaysShowSidebar}
                color='primary'
                onChange={(e) => updateSettings({ alwaysShowSidebar: e.target.checked })}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </div>

      <div className={classes.tabContent} style={{ display: tab === 1 ? 'block' : 'none' }}>
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
      <div className={classes.tabContent} style={{ display: tab === 2 ? 'block' : 'none' }}>
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
                  <a
                    href='https://github.com/slater-notes/web/releases'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    https://github.com/slater-notes/web/releases
                  </a>
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
