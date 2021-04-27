import { makeStyles, useTheme } from '@material-ui/core';
import moment from 'moment';
import React, { useMemo } from 'react';
import {
  Book,
  Cloud,
  CloudOff,
  Folder,
  MoreVertical,
  Plus,
  PlusCircle,
  Settings as SettingsIcon,
  Star,
  Trash,
} from 'react-feather';
import { FolderItem } from '@slater-notes/core';
import DefaultButton from '../../../components/Buttons/DefaultButton';
import IconButtonWithMenu from '../../../components/Buttons/IconButtonWithMenu';
import DefaultDialog from '../../../components/Dialogs/DefaultDialog';
import FullDialog from '../../../components/Dialogs/FullDialog';
import { useStoreActions, useStoreState } from '../../../store/typedHooks';
import Settings from '../../Dialogs/Settings';
import FolderItemEdit from './FolderItemEdit';
import ListGroup, { Props as ListGroupProps } from './ListGroup';
import CloudSync from '../../Dialogs/CloudSync';
import { throttle } from 'lodash';
import FolderGroupTitle from '../../../components/SidebarComponents/FolderGroupTitle';

const Folders = () => {
  const theme = useTheme();
  const classes = useStyles();

  const mainContainerRef = React.useRef<HTMLDivElement>(null);

  const [openSettings, setOpenSettings] = React.useState(false);
  const [openCloudSync, setOpenCloudSync] = React.useState(false);
  const [deleteFolderConfirm, setDeleteFolderConfirm] = React.useState<FolderItem | null>(null);
  const [mainContainerShadow, setMainContainerShadow] = React.useState(false);
  const [bottomControlShadow, setBottomControlShadow] = React.useState(false);

  const user = useStoreState((s) => s.user);
  const fileCollection = useStoreState((s) => s.fileCollection);
  const activeFolderId = useStoreState((s) => s.activeFolderId);
  const editingFolderId = useStoreState((s) => s.editingFolderId);

  const setActiveFolderId = useStoreActions((a) => a.setActiveFolderId);
  const setEditingFolderId = useStoreActions((a) => a.setEditingFolderId);
  const createNewNote = useStoreActions((a) => a.createNewNote);
  const createNewFolder = useStoreActions((a) => a.createNewFolder);
  const updateFolder = useStoreActions((a) => a.updateFolder);
  const trashFolder = useStoreActions((a) => a.trashFolder);

  const handleMainContainerScroll = () => {
    if (mainContainerRef.current) {
      setMainContainerShadow(mainContainerRef.current.scrollTop > 0);
      setBottomControlShadow(
        mainContainerRef.current.scrollHeight -
          mainContainerRef.current.clientHeight -
          mainContainerRef.current.scrollTop >
          0,
      );
    }
  };

  const handleMainContainerScrollThrottled = React.useMemo(
    () => throttle(handleMainContainerScroll, 250),
    [],
  );

  React.useEffect(() => {
    handleMainContainerScroll();
    globalThis.addEventListener('resize', handleMainContainerScrollThrottled);
    return () => globalThis.removeEventListener('resize', handleMainContainerScrollThrottled);
  }, []);

  return (
    <div className={classes.container}>
      <div
        ref={mainContainerRef}
        className={[classes.main, mainContainerShadow ? 'has--shadow' : ''].join(' ')}
        onScroll={handleMainContainerScrollThrottled}
      >
        <div className={classes.mainButtonContainer}>
          <DefaultButton
            buttonProps={{
              variant: 'contained',
              color: 'primary',
              fullWidth: true,
              startIcon: <Plus />,
              onClick: () => {
                if (['trash', 'starred'].includes(activeFolderId)) {
                  setActiveFolderId('all');
                  createNewNote({ title: '' });
                } else {
                  createNewNote({ title: '', parentId: activeFolderId });
                }
              },
            }}
            text='New Note'
          />
        </div>

        <div style={{ marginBottom: theme.spacing(5) }}>
          <ListGroup
            items={[
              {
                key: 'all',
                icon: Book,
                text: 'All Notes',
                isActive: activeFolderId === 'all',
                onClick: () => setActiveFolderId('all'),
              },
              {
                key: 'starred',
                icon: Star,
                text: 'Favorites',
                isActive: activeFolderId === 'starred',
                onClick: () => setActiveFolderId('starred'),
              },
              {
                key: 'trash',
                icon: Trash,
                text: 'Trash',
                isActive: activeFolderId === 'trash',
                onClick: () => setActiveFolderId('trash'),
              },
            ]}
          />
        </div>

        <FolderGroupTitle
          title='Folders'
          iconButton={{
            icon: PlusCircle,
            onClick: () => createNewFolder({ title: '', editOnCreate: true }),
          }}
        />

        {useMemo(
          () => {
            const items: ListGroupProps['items'] = fileCollection?.folders
              ? fileCollection.folders
                  .filter((f) => !f.isDeleted)
                  .sort((f1, f2) => f2.created - f1.created)
                  .map((folder) => ({
                    key: folder.id,
                    text:
                      editingFolderId === folder.id ? (
                        <FolderItemEdit
                          folder={folder}
                          onDone={(value) => {
                            folder.updated = moment().unix();
                            folder.title = value.trim();
                            updateFolder({ id: folder.id, folder });
                            setEditingFolderId(null);
                          }}
                        />
                      ) : (
                        folder.title || 'Untitled'
                      ),
                    icon: Folder,
                    secondaryAction: editingFolderId ? null : (
                      <IconButtonWithMenu
                        icon={MoreVertical}
                        menuItems={[
                          {
                            label: 'Rename',
                            onClick: async () => {
                              if (activeFolderId !== folder.id) {
                                await setActiveFolderId(folder.id);
                              }

                              setEditingFolderId(folder.id);
                            },
                          },
                          {
                            label: 'Delete Folder...',
                            onClick: () => {
                              setDeleteFolderConfirm(folder);
                            },
                          },
                        ]}
                      />
                    ),
                    isActive: activeFolderId === folder.id,
                    onClick: () => setActiveFolderId(folder.id),
                  }))
              : [];

            return <ListGroup items={items} />;
          },
          //eslint-disable-next-line
          [fileCollection, activeFolderId, editingFolderId],
        )}

        {deleteFolderConfirm && (
          <DefaultDialog
            title='Delete Folder?'
            text={
              <>
                Are you sure you want to delete <b>{deleteFolderConfirm.title || 'Untitled'}</b>?
                Notes are NOT deleted along with the folder — you must delete notes individually.
              </>
            }
            withCancel
            withConfirm
            confirmLabel='Delete Folder'
            confirmButtonStyle={{ color: theme.palette.error.main }}
            onCancel={() => setDeleteFolderConfirm(null)}
            onConfirm={() => {
              trashFolder(deleteFolderConfirm.id);
              setDeleteFolderConfirm(null);
            }}
          />
        )}
      </div>

      <div className={[classes.bottomControl, bottomControlShadow ? 'has--shadow' : ''].join(' ')}>
        <ListGroup
          items={[
            {
              key: 'cloudsync',
              text: 'Cloud Sync',
              icon: typeof user?.cloudLastSynced === 'number' ? Cloud : CloudOff,
              onClick: () => setOpenCloudSync(true),
            },
            {
              key: 'settings',
              text: 'Settings',
              icon: SettingsIcon,
              onClick: () => setOpenSettings(true),
            },
          ]}
        />
        {openSettings && (
          <FullDialog
            title='Settings'
            onClose={() => setOpenSettings(false)}
            dialogContentProps={{ style: { padding: 0 } }}
          >
            <Settings />
          </FullDialog>
        )}
        {openCloudSync && <CloudSync handleClose={() => setOpenCloudSync(false)} />}
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: theme.palette.background.default,
    overflow: 'hidden',
  },

  main: {
    overflowY: 'auto',
    flex: 1,

    '&.has--shadow': {
      boxShadow: 'inset 0px 20px 10px -10px rgb(0 0 0 / 15%)',
    },
  },

  mainButtonContainer: {
    padding: `${theme.spacing(3)}px ${theme.spacing(3)}px`,
    marginBottom: theme.spacing(2),
  },

  bottomControl: {
    '&.has--shadow': {
      boxShadow: '0px -3px 10px 0px rgb(0 0 0 / 15%)',
    },
  },
}));

export default Folders;
