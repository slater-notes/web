import { makeStyles } from '@material-ui/core';
import { defer } from 'lodash';
import { useEffect, useState } from 'react';
import { useStoreState } from '../../store/typedHooks';
import { ActiveNote } from '../../types/activeNote';
import NotePage from './NotePage';

const Note = () => {
  const classes = useStyles();

  const [notes, setNotes] = useState<ActiveNote[]>([]);

  const activeNote = useStoreState((s) => s.activeNote);

  const focusTitleInput = () => {
    if (activeNote?.noteItem.title.trim().length === 0) {
      document
        .querySelector<HTMLInputElement>(
          `#note-page-${activeNote.noteItem.id} .note-page__title-input input`,
        )
        ?.focus();
    }
  };

  useEffect(() => {
    if (!activeNote) return;

    const existingNoteIndex = notes.findIndex((n) => n.noteItem.id === activeNote.noteItem.id);

    if (existingNoteIndex > -1) {
      notes[existingNoteIndex] = activeNote;
    } else {
      notes.push(activeNote);
    }

    setNotes(notes);

    defer(() => focusTitleInput());

    // eslint-disable-next-line
  }, [activeNote]);

  return (
    <div className={classes.container}>
      {notes.map((note) => (
        <div
          key={note.noteItem.id}
          style={{ display: activeNote?.noteItem.id === note.noteItem.id ? 'block' : 'none' }}
        >
          <NotePage note={note} />
        </div>
      ))}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100vh',
    overflowX: 'auto',
  },
}));

export default Note;
