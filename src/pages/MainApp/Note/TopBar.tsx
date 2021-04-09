import { makeStyles, useTheme } from '@material-ui/core';
import React, { useState } from 'react';
import { RotateCcw, Star, Trash } from 'react-feather';
import DefaultButton from '../../../components/Buttons/DefaultButton';
import DefaultIconButton from '../../../components/Buttons/DefaultIconButton';
import DefaultDialog from '../../../components/Dialogs/DefaultDialog';
import { useStoreActions, useStoreState } from '../../../stores/mainStore/typedHooks';
import { NoteData, NoteItem } from '../../../types/notes';
import FolderPicker from './FolderPicker';

interface Props {
  note: { noteItem: NoteItem; noteData: NoteData };
  saved: boolean;
  lastSaved: number;
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
        <FolderPicker noteItem={props.note.noteItem} />

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

        {!props.note.noteItem.isDeleted && (
          <React.Fragment>
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
          </React.Fragment>
        )}

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

      <div className={classes.rightItems}>
        {props.saved && props.lastSaved > 0 && <span>✓ Saved</span>}
        {!props.saved && <span>Unsaved</span>}
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${theme.spacing(3)}px ${theme.spacing(8)}px`,
    // color: theme.palette.text.hint,

    '& > * > *': {
      marginRight: theme.spacing(1),
    },
  },

  rightItems: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export default TopBar;
