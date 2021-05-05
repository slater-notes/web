import { useEffect, useState } from 'react';
import { useStoreState } from '../../store/typedHooks';
import { ActiveNote } from '../../types/activeNote';
import NotePage from './NotePage';

const Note = () => {
  const [notes, setNotes] = useState<ActiveNote[]>([]);

  const activeNote = useStoreState((s) => s.activeNote);

  useEffect(() => {
    if (!activeNote) return;

    const existingNoteIndex = notes.findIndex((n) => n.noteItem.id === activeNote.noteItem.id);

    if (existingNoteIndex > -1) {
      notes[existingNoteIndex] = activeNote;
    } else {
      notes.push(activeNote);
    }

    setNotes(notes);

    // eslint-disable-next-line
  }, [activeNote]);

  return (
    <>
      {notes.map((note) => (
        <div
          key={note.noteItem.id}
          style={{ display: activeNote?.noteItem.id === note.noteItem.id ? 'block' : 'none' }}
        >
          <NotePage note={note} />
        </div>
      ))}
    </>
  );
};

export default Note;
