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
import React, { useState } from 'react';
import DefaultButton from '../../../components/Buttons/DefaultButton';
import DefaultDialog from '../../../components/Dialogs/DefaultDialog';
import defaultUserSettings from '../../../stores/mainStore/defaultUserSettings';
import { useStoreActions, useStoreState } from '../../../stores/mainStore/typedHooks';
import ChangeUsername from '../ChangeUsername';

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
              secondaryTypographyProps={{ component: 'div' }}
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
            <ListItemText
              primary='Slater Notes (Unstable)'
              secondary={
                <span>
                  Version: 0.1.0
                  <br />
                  Build Date: 2021-01-06T00:00:00.00Z (6 days ago)
                </span>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              secondary={
                <a
                  href='https://github.com/slaternotes/slaternotes-web'
                  target='_blank'
                  rel='noreferrer'
                >
                  https://github.com/slaternotes/slaternotes-web
                </a>
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
