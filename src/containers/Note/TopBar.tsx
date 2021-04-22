import { Box, makeStyles, useTheme } from '@material-ui/core';
import React, { PropsWithChildren, useState } from 'react';
import { RotateCcw, Star, Trash } from 'react-feather';
import DefaultButton from '../../components/Buttons/DefaultButton';
import DefaultIconButton from '../../components/Buttons/DefaultIconButton';
import DefaultDialog from '../../components/Dialogs/DefaultDialog';
import { useStoreActions, useStoreState } from '../../store/typedHooks';
import { ActiveNote } from '../../types/activeNote';
import FolderPicker from './FolderPicker';

interface Props {
  note: ActiveNote;
  saved: boolean;
}

const TopBar = (props: Props) => {
  const theme = useTheme();
  const classes = useStyles();

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fileCollection = useStoreState((s) => s.fileCollection);
  const activeFolderId = useStoreState((s) => s.activeFolderId);

  const updateNoteItem = useStoreActions((a) => a.updateNoteItem);
  const setActiveNote = useStoreActions((a) => a.setActiveNote);
  const setActiveFolderId = useStoreActions((a) => a.setActiveFolderId);

  return (
    <div className={classes.container}>
      <div>
        {!props.note.noteItem.isDeleted && <FolderPicker noteItem={props.note.noteItem} />}

        {props.note.noteItem.isDeleted && (
          <DefaultButton
            text={
              <span>
                <RotateCcw size={16} style={{ margin: `0 ${theme.spacing(1)}px -3px 0` }} /> Restore
                Note
              </span>
            }
            buttonProps={{
              variant: 'contained',
              color: 'primary',
              onClick: () => {
                // If this note belongs to a folder that no longer exist, remove the `parentId`
                if (
                  props.note.noteItem.parentId &&
                  !fileCollection?.folders.find(
                    (f) => f.id === props.note.noteItem.parentId && !f.isDeleted,
                  )
                ) {
                  delete props.note.noteItem.parentId;
                }

                delete props.note.noteItem.isDeleted;
                updateNoteItem({ id: props.note.noteItem.id, noteItem: props.note.noteItem });

                setActiveFolderId(
                  props.note.noteItem.parentId && props.note.noteItem.parentId !== activeFolderId
                    ? props.note.noteItem.parentId
                    : 'all',
                );
              },
            }}
          />
        )}
      </div>

      <div className={classes.rightItems}>
        {!props.note.noteItem.isDeleted && (
          <>
            {props.saved ? <StatusText>✓ Saved</StatusText> : <StatusText>Unsaved</StatusText>}

            <DefaultIconButton
              label={props.note.noteItem.isStarred ? 'Remove from Favorites' : 'Add to Favorites'}
              icon={Star}
              size={20}
              fill={props.note.noteItem.isStarred ? theme.palette.secondary.main : undefined}
              style={{
                color: props.note.noteItem.isStarred ? theme.palette.secondary.main : undefined,
              }}
              onClick={() => {
                const noteItem = props.note.noteItem;
                noteItem.isStarred = !noteItem.isStarred;
                updateNoteItem({ id: props.note.noteItem.id, noteItem });
              }}
            />

            <DefaultIconButton
              label='Move to Trash'
              icon={Trash}
              size={20}
              onClick={() => setDeleteConfirm(true)}
            />
          </>
        )}
      </div>

      {deleteConfirm && (
        <DefaultDialog
          title='Move Note to Trash?'
          text={`Are you sure you want to move this note to the trash folder? You can still recover this note after.`}
          withCancel
          withConfirm
          confirmLabel='Trash Note'
          confirmButtonStyle={{ color: theme.palette.error.main }}
          onCancel={() => setDeleteConfirm(false)}
          onConfirm={() => {
            setDeleteConfirm(false);

            const noteItem = props.note.noteItem;
            noteItem.isDeleted = true;
            setActiveNote(null);
            updateNoteItem({ id: props.note.noteItem.id, noteItem });
          }}
        />
      )}
    </div>
  );
};

const StatusText = (props: PropsWithChildren<{}>) => (
  <Box padding={1.5} marginRight={1}>
    {props.children}
  </Box>
);

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing(3)}px ${theme.spacing(8)}px`,

    '& > * > *': {
      marginRight: theme.spacing(1),
    },
  },

  rightItems: {
    display: 'flex',
    alignItems: 'center',
  },

  status: {},
}));

export default TopBar;
