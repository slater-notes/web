import { List, ListItem, ListItemText, makeStyles, Typography, useTheme } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import moment from 'moment';
import React, { useMemo } from 'react';
import { NoteItem } from '@slater-notes/core';
import { useStoreActions, useStoreState } from '../../../../stores/mainStore/typedHooks';
import DefaultDialog from '../../../../components/Dialogs/DefaultDialog';
import { Plus, Star, Trash } from 'react-feather';
import DefaultIconButton from '../../../../components/Buttons/DefaultIconButton';
import FilterFiles from './FilterFiles';
import { throttle } from 'lodash';

const Files = () => {
  const theme = useTheme();
  const classes = useStyles();

  const containerRef = React.useRef<HTMLDivElement>(null);

  const [filter, setFilter] = React.useState<string>('');
  const [emptyTrashConfirm, setEmptyTrashConfirm] = React.useState(false);
  const [, setContainerShadow] = React.useState(false);

  const fileCollection = useStoreState((s) => s.fileCollection);
  const activeNote = useStoreState((s) => s.activeNote);
  const activeFolderId = useStoreState((s) => s.activeFolderId);

  const loadNote = useStoreActions((a) => a.loadNote);
  const emptyTrash = useStoreActions((a) => a.emptyTrash);

  const handleContainerScroll = () => {
    if (containerRef.current) {
      setContainerShadow(containerRef.current.scrollTop > 0);
    }
  };

  const handleContainerScrollThrottled = React.useMemo(
    () => throttle(handleContainerScroll, 250),
    [],
  );

  React.useEffect(() => {
    handleContainerScroll();
    globalThis.addEventListener('resize', handleContainerScrollThrottled);
  }, []);

  // Reset filter when changing folders
  React.useEffect(() => {
    if (activeFolderId !== 'all') {
      setFilter('');
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
    }

    if (note.isDeleted) {
      return activeFolderId === 'trash';
    }

    if (note.isStarred && activeFolderId === 'starred') {
      return true;
    }

    if (activeFolderId === 'all') {
      return true;
    }

    return note.parentId === activeFolderId;
  };

  return (
    <React.Fragment>
      <div className={classes.topShadow}></div>
      <div
        ref={containerRef}
        className={classes.container}
        onScroll={handleContainerScrollThrottled}
      >
        {activeFolderId === 'all' && <FilterFiles onChange={(value) => setFilter(value)} />}

        <div className={classes.title}>
          <Typography variant='h4' component='div'>
            {getTitle()}
          </Typography>
          {activeFolderId === 'trash' && (
            <DefaultIconButton
              icon={Trash}
              size={18}
              disabled={!fileCollection?.notes.find((n) => n.isDeleted)}
              onClick={() => {
                setEmptyTrashConfirm(true);
              }}
            />
          )}
        </div>

        {useMemo(
          () => {
            const items: NoteItem[] = fileCollection?.notes
              ? fileCollection.notes
                  .filter((n) => shouldShowNote(n))
                  .sort((n1, n2) => n2.created - n1.created)
              : [];

            return (
              <List disablePadding>
                {activeFolderId === 'starred' && items.length === 0 && (
                  <ListItem className={classes.noteItem}>
                    <ListItemText
                      primary={
                        <span style={{ lineHeight: 2 }}>
                          Add notes here by pressing the{' '}
                          <Star size={16} style={{ margin: `0 ${theme.spacing(1)}px -2px` }} />{' '}
                          icon.
                        </span>
                      }
                    />
                  </ListItem>
                )}

                {activeFolderId === 'trash' && items.length === 0 && (
                  <ListItem className={classes.noteItem}>
                    <ListItemText
                      primary={
                        <span style={{ lineHeight: 2 }}>
                          When you trash notes, they end up here. Press the{' '}
                          <Trash size={16} style={{ margin: `0 ${theme.spacing(1)}px -2px` }} />{' '}
                          icon above to empty the trash.
                        </span>
                      }
                    />
                  </ListItem>
                )}

                {!['all', 'starred', 'trash'].includes(activeFolderId) && items.length === 0 && (
                  <ListItem className={classes.noteItem}>
                    <ListItemText
                      primary={
                        <span style={{ lineHeight: 2 }}>
                          Press the{' '}
                          <Plus size={16} style={{ margin: `0 ${theme.spacing(0.5)}px -2px` }} />
                          <b>New Note</b> button to add a new note in this folder.
                        </span>
                      }
                    />
                  </ListItem>
                )}

                {items.map((note) => (
                  <ListItem
                    key={note.id}
                    button
                    disableRipple
                    className={classes.noteItem}
                    selected={activeNote?.noteItem.id === note.id}
                    onClick={() => loadNote(note)}
                  >
                    <ListItemText
                      primary={note.title || 'Untitled'}
                      secondary={(() => {
                        const folder = fileCollection?.folders.find((f) => f.id === note.parentId);
                        return (
                          <React.Fragment>
                            {['all', 'starred'].includes(activeFolderId) && (
                              <span>
                                {folder
                                  ? `Saved in ${folder.title || 'Untitled'}`
                                  : `Not saved in a folder`}
                              </span>
                            )}
                            <span>{moment.unix(note.updated).fromNow(true)}</span>
                          </React.Fragment>
                        );
                      })()}
                    />
                  </ListItem>
                ))}
              </List>
            );
          },
          // eslint-disable-next-line
          [activeFolderId, fileCollection, activeNote, filter],
        )}

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
    </React.Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  topShadow: {
    position: 'absolute',
    zIndex: 2,
    height: 1,
    boxShadow: '0px 3px 10px 0px rgb(0 0 0 / 15%)',
  },

  container: {
    overflowY: 'auto',
    backgroundColor: theme.palette.background.default,
    padding: `0 ${theme.spacing(2)}px`,
  },

  title: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${theme.spacing(3)}px ${theme.spacing(4)}px`,
    marginBottom: theme.spacing(2),
  },

  noteItem: {
    background: theme.palette.background.paper,
    borderRadius: 6,
    marginBottom: theme.spacing(2),

    '&.MuiListItem-gutters': {
      padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
    },

    '&.Mui-selected, &.Mui-selected:hover': {
      background: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,

      '& .MuiListItemText-root': {
        '& .MuiListItemText-secondary': {
          color: grey[600],
        },
      },
    },

    '& .MuiListItemText-root': {
      '& .MuiListItemText-primary': {
        fontSize: '0.9rem',
        marginBottom: theme.spacing(1),
      },

      '& .MuiListItemText-secondary': {
        '& > *': {
          display: 'flex',
          justifyContent: 'space-between',

          '&:not(:last-child)': {
            marginBottom: theme.spacing(1),
          },
        },
      },
    },
  },
}));

export default Files;
