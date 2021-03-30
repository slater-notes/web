import {
  Box,
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
import moment from 'moment';
import React, { useState } from 'react';
import DefaultButton from '../../../components/Buttons/DefaultButton';
import DefaultDialog from '../../../components/Dialogs/DefaultDialog';
import defaultUserSettings from '../../../stores/mainStore/defaultUserSettings';
import { useStoreActions, useStoreState } from '../../../stores/mainStore/typedHooks';
import ChangeUsername from '../ChangeUsername';

const latestVersion = '0.3.0';
const latestReleaseTime = moment.unix(1617099026);

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
            <ListItemText
              primary={<b>Slater Notes (Pre-Release)</b>}
              secondary={
                <span>
                  Version: <b>{latestVersion}</b>
                  <br />
                  Release Date: <b>{latestReleaseTime.fromNow()}</b> ({latestReleaseTime.format()})
                </span>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              secondary={
                <span>
                  Release Notes:
                  <Box marginTop={`${theme.spacing(2)}px`} marginLeft={`${theme.spacing(2)}px`}>
                    <b>Features:</b>
                    <ul>
                      <li>Using a new, clean and minimal editor</li>
                      <li>Using Inter font instead of Roboto</li>
                    </ul>
                    <b>Fixes:</b>
                    <ul>
                      <li>Fixed issues with cloud sync time display</li>
                    </ul>
                  </Box>
                </span>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              secondary={
                <a href='https://github.com/slater-notes/web' target='_blank' rel='noreferrer'>
                  https://github.com/slater-notes/web
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
