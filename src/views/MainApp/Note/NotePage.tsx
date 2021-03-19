import { makeStyles } from '@material-ui/core';
import { debounce } from 'lodash';
import moment from 'moment';
import React from 'react';
import EditableTypography from '../../../components/EditableTypography';
import { useStoreActions } from '../../../stores/mainStore/typedHooks';
import TopBar from './TopBar';
import DraftEditor from '../../../components/Editor';
import { NoteData, NoteItem } from '../../../types/notes';

interface Props {
  noteItem: NoteItem;
  noteData: NoteData;
}

const NotePage = ({ noteItem, noteData }: Props) => {
  const classes = useStyles();

  const [title, setTitle] = React.useState(noteItem.title);
  const [saved, setSaved] = React.useState(true);
  const [lastSaved, setLastSaved] = React.useState(0);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const updateNoteItem = useStoreActions((a) => a.updateNoteItem);
  const updateNoteData = useStoreActions((a) => a.updateNoteData);

  const saveNoteItem = async (title?: string) => {
    if (typeof title === 'string') {
      noteItem.title = title;
    }

    noteItem.updated = moment().unix();

    await updateNoteItem({ id: noteItem.id, noteItem });

    setLastSaved(moment().unix());
    setSaved(true);
  };

  const saveNoteItemDebounced = React.useMemo(
    () => debounce(saveNoteItem, 1000, { leading: false }),
    [],
  );

  return (
    <div
      id={`note-page-${noteItem.id}`}
      className={classes.container}
      style={{ height: '100vh', overflowX: 'auto' }}
    >
      <TopBar note={{ noteItem, noteData }} saved={saved} lastSaved={lastSaved} />

      <div className={classes.content} style={{ opacity: noteItem.isDeleted ? 0.3 : undefined }}>
        <EditableTypography
          ref={inputRef}
          text={title}
          placeholder='Untitled'
          disabled={noteItem.isDeleted}
          className={[classes.title, 'note-page__title-input'].join(' ')}
          typographyProps={{
            variant: 'h4',
            component: 'div',
          }}
          onChange={(value) => {
            setSaved(false);
            setTitle(value);
            saveNoteItemDebounced(value);
          }}
        />

        <DraftEditor
          readOnly={noteItem.isDeleted}
          initialContent={
            noteData.revisions
              ? noteData.revisions.sort((d1, d2) => (d2.time || 0) - (d1.time || 0))[0]?.content
              : undefined
          }
          onChange={() => setSaved(false)}
          handleSave={(content) => {
            noteData.revisions.push({
              version: 1,
              time: moment().valueOf(),
              content,
            });
            saveNoteItem();
            updateNoteData({ id: noteItem.id, noteData });
          }}
        />
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.palette.background.default,
  },

  content: {
    padding: `${theme.spacing(6)}px ${theme.spacing(8)}px`,
  },

  title: {
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightMedium,
    marginBottom: theme.spacing(6),
  },
}));

export default NotePage;
