import { defer } from 'lodash';
import React from 'react';
import { useStoreActions, useStoreState } from '../../../stores/mainStore/typedHooks';
import { NoteData, NoteItem } from '../../../types/notes';
import NotePage from './NotePage';

const Note = () => {
  const [notes, setNotes] = React.useState<{ noteItem: NoteItem; noteData: NoteData }[]>([]);

  const activeNote = useStoreState((s) => s.activeNote);

  const setSidebarOpen = useStoreActions((a) => a.setSidebarOpen);

  React.useEffect(() => {
    if (!activeNote) return;

    if (notes.findIndex((n) => n.noteItem.id === activeNote?.noteItem.id) < 0) {
      notes.push(activeNote);
      setNotes(notes);
    }

    defer(() => {
      setSidebarOpen(false);

      if (activeNote.noteItem.title.trim().length === 0) {
        document
          .querySelector<HTMLInputElement>(
            `#note-page-${activeNote.noteItem.id} .note-page__title-input input`,
          )
          ?.focus();
      }
    });

    // eslint-disable-next-line
  }, [activeNote?.noteItem.id]);

  return (
    <React.Fragment>
      {notes.map((note) => (
        <div
          key={note.noteItem.id}
          style={{ display: activeNote?.noteItem.id === note.noteItem.id ? 'block' : 'none' }}
        >
          <NotePage noteItem={note.noteItem} noteData={note.noteData} />
        </div>
      ))}
    </React.Fragment>
  );
};

export default Note;
