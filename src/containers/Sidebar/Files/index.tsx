import { Box, makeStyles, useTheme } from '@material-ui/core';
import moment from 'moment';
import React from 'react';
import { NoteItem } from '@slater-notes/core';
import { useStoreActions, useStoreState } from '../../../store/typedHooks';
import DefaultDialog from '../../../components/Dialogs/DefaultDialog';
import { FileText, Star, Trash } from 'react-feather';
import DefaultIconButton from '../../../components/Buttons/DefaultIconButton';
import FilterFiles from './FilterFiles';
import ListGroup, { Item } from './ListGroup';
import NotifBox from '../../../components/NotifBox';

const Files = () => {
  const theme = useTheme();
  const classes = useStyles();

  const [filter, setFilter] = React.useState<string | null>(null);
  const [emptyTrashConfirm, setEmptyTrashConfirm] = React.useState(false);

  const fileCollection = useStoreState((s) => s.fileCollection);
  const activeNote = useStoreState((s) => s.activeNote);
  const activeFolderId = useStoreState((s) => s.activeFolderId);

  const loadNote = useStoreActions((a) => a.loadNote);
  const emptyTrash = useStoreActions((a) => a.emptyTrash);
  const setSidebarOpen = useStoreActions((a) => a.setSidebarOpen);

  // Reset filter when changing folders
  React.useEffect(() => {
    if (activeFolderId !== 'all') {
      setFilter(null);
    }
    // eslint-disable-next-line
  }, [activeFolderId]);

  const getTitle = () => {
    switch (activeFolderId) {
      case 'all':
        return 'All Notes';
      case 'starred':
        return 'Favorites';
      case 'trash':
        return 'Trash';
      default:
        const folder = fileCollection?.folders.find((f) => f.id === activeFolderId);
        return folder?.title || 'Untitled';
    }
  };

  const shouldShowNote = (note: NoteItem) => {
    if (filter && note.title.toLocaleLowerCase().indexOf(filter.trim().toLocaleLowerCase()) < 0) {
      return false;
    } else if (note.isDeleted) {
      return activeFolderId === 'trash';
    } else if (note.isStarred && activeFolderId === 'starred') {
      return true;
    } else if (activeFolderId === 'all') {
      return true;
    } else {
      return note.parentId === activeFolderId;
    }
  };

  const getNoteItems = (): NoteItem[] =>
    fileCollection?.notes
      ? fileCollection.notes
          .filter((n) => shouldShowNote(n))
          .sort((n1, n2) => n2.updated - n1.updated)
      : [];

  const getNotifItem = (noteItemsLength: number): Item | null => {
    if (noteItemsLength > 0) {
      return null;
    }

    switch (activeFolderId) {
      case 'all':
        return {
          key: '0',
          primaryText: filter ? (
            <Box color={theme.palette.text.hint}>Empty result.</Box>
          ) : (
            <NotifBox>
              You don't have any notes yet.
              <br />
              Press the <b>New Note</b> button to add a new note.
            </NotifBox>
          ),
        };
      case 'trash':
        return {
          key: '0',
          primaryText: (
            <NotifBox>
              <>
                When you trash notes, they end up here.
                <br />
                Press the{' '}
                <Trash
                  size={16}
                  fill={theme.palette.primary.contrastText}
                  style={{ margin: `0 ${theme.spacing(1)}px -2px` }}
                />{' '}
                icon above to empty the trash.
              </>
            </NotifBox>
          ),
        };
      case 'starred':
        return {
          key: '0',
          primaryText: (
            <NotifBox>
              <>
                Add notes here by pressing the{' '}
                <Star
                  size={16}
                  fill={theme.palette.primary.contrastText}
                  style={{ margin: `0 ${theme.spacing(1)}px -2px` }}
                />{' '}
                icon.
              </>
            </NotifBox>
          ),
        };
      default:
        return {
          key: '0',
          primaryText: (
            <NotifBox>
              <>
                Press the <b style={{ fontWeight: theme.typography.fontWeightBold }}>New Note</b>{' '}
                button to add a new note in this folder.
              </>
            </NotifBox>
          ),
        };
    }
  };

  const getListItems = (): Item[] => {
    const noteItems: Item[] = getNoteItems().map((item) => ({
      key: item.id,
      icon: FileText,
      isButton: true,
      isActive: activeNote?.noteItem.id === item.id,
      primaryText: item.title || 'Untitled',
      secondaryText: <>Updated {moment.unix(item.updated).fromNow(true)}</>,
      onClick: async () => {
        await loadNote(item);
        setSidebarOpen(false);
      },
    }));

    const notifItem = getNotifItem(noteItems.length);

    if (notifItem) {
      noteItems.unshift(notifItem);
    }

    return noteItems;
  };

  return (
    <div className={classes.container}>
      <div className={classes.titleContainer}>
        <div className={classes.title}>
          <Box fontSize='1.8rem' fontWeight={theme.typography.fontWeightMedium}>
            {getTitle()}
          </Box>
          {activeFolderId === 'trash' && (
            <DefaultIconButton
              icon={Trash}
              size={18}
              disabled={!fileCollection?.notes.find((n) => n.isDeleted)}
              style={{
                marginTop: `-${theme.spacing(0.5)}px`,
              }}
              onClick={() => {
                setEmptyTrashConfirm(true);
              }}
            />
          )}
        </div>

        {activeFolderId === 'all' && <FilterFiles onChange={(value) => setFilter(value)} />}
      </div>

      <ListGroup items={getListItems()} />

      {emptyTrashConfirm && (
        <DefaultDialog
          title='Empty Trash?'
          text='Are you sure you want to empty the trash? Notes in the trash will be deleted permanently.'
          withCancel
          withConfirm
          confirmLabel='Empty Trash'
          confirmButtonStyle={{ color: theme.palette.error.main }}
          onCancel={() => setEmptyTrashConfirm(false)}
          onConfirm={() => {
            setEmptyTrashConfirm(false);
            emptyTrash();
          }}
        />
      )}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  topShadow: {
    width: '100%',
    position: 'absolute',
    zIndex: 2,
    height: 1,
    boxShadow: '0px 3px 10px 0px rgb(0 0 0 / 15%)',
  },

  container: {
    width: '100%',
    overflowY: 'auto',
    backgroundColor: theme.palette.background.default,
  },

  titleContainer: {
    padding: `0 ${theme.spacing(3)}px`,
  },

  title: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${theme.spacing(3)}px 0`,
    marginBottom: theme.spacing(2),
  },
}));

export default Files;
