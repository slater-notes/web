import { head } from 'lodash';
import { Node } from 'slate';
import { NoteData } from '../types/notes';

const getLatestContentFromNoteRevision = (noteData: NoteData): Node[] | null => {
  const data = head(noteData.revisions.sort((d1, d2) => d2.time - d1.time));
  return data && typeof data.content === 'string' ? JSON.parse(data.content) : null;
};

export default getLatestContentFromNoteRevision;
