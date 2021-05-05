import { makeStyles } from '@material-ui/core';
import { debounce, defer } from 'lodash';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import EditableTypography from '../../components/EditableTypography';
import { useStoreActions } from '../../store/typedHooks';
import TopBar from './TopBar';
import Editor from '../../components/Editor';
import { ActiveNote } from '../../types/activeNote';
import { Node } from 'slate';
import getLatestContentFromNoteRevision from '../../utils/getLatestContentFromNoteRevision';
import now from '../../utils/now';
import useScrollDetect from '../../hooks/useScrollDetect';

interface Props {
  note: ActiveNote;
}

const NotePage = ({ note }: Props) => {
  const classes = useStyles();

  const initialContent = useMemo(
    () =>
      getLatestContentFromNoteRevision(note.noteData) || [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
    [],
  );

  const [title, setTitle] = useState(note.noteItem.title);
  const [lastTitleEdit, setLastTitleEdit] = useState(now());
  const [content, setContent] = useState<Node[]>(initialContent);
  const [lastContentEdit, setLastContentEdit] = useState(now());
  const [saved, setSaved] = useState(true);

  const scrollDetect = useScrollDetect();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const updateNoteItem = useStoreActions((a) => a.updateNoteItem);
  const updateNoteData = useStoreActions((a) => a.updateNoteData);

  const saveNoteItem = async (title?: string) => {
    if (typeof title === 'string') {
      note.noteItem.title = title;
    }

    note.noteItem.updated = now();
    await updateNoteItem({ id: note.noteItem.id, noteItem: note.noteItem });
    setSaved(true);
  };

  const saveNoteItemDebounced = useMemo(() => debounce(saveNoteItem, 1000, { leading: false }), []);

  const handleSaveNoteContentDebounced = useMemo(
    () =>
      debounce(
        (content: Node[]) => {
          const json = JSON.stringify(content);

          note.noteData.revisions.push({
            version: 1,
            time: moment().valueOf(),
            content: json,
          });

          saveNoteItem();
          updateNoteData({ id: note.noteItem.id, noteData: note.noteData });
        },
        1000,
        { leading: false },
      ),
    [],
  );

  useEffect(() => {
    // set title if there's newer one incoming
    if (note.noteItem.updated > lastTitleEdit) {
      setTitle(note.noteItem.title);
      setLastTitleEdit(now());
    }

    // set content if there's newer one incoming
    if (note.noteItem.updated > lastContentEdit) {
      const content = getLatestContentFromNoteRevision(note.noteData);
      if (content) {
        setContent(content);
        setLastContentEdit(now());
      }
    }

    defer(() => inputRef.current?.focus());
  }, [note]);

  return (
    <div id={`note-page-${note.noteItem.id}`} className={classes.container}>
      <TopBar note={note} saved={saved} hasShadow={scrollDetect.isScrolled} />

      <div
        ref={scrollDetect.element}
        onScroll={scrollDetect.handleScroll}
        className={classes.content}
        style={{ opacity: note.noteItem.isDeleted ? 0.3 : undefined }}
      >
        <div className={classes.contentInner}>
          <EditableTypography
            ref={inputRef}
            text={title}
            placeholder='Untitled'
            disabled={note.noteItem.isDeleted}
            className={classes.title}
            typographyProps={{
              variant: 'h4',
              component: 'div',
            }}
            onChange={(value) => {
              setTitle(value);
              setLastTitleEdit(now());
              setSaved(false);
              saveNoteItemDebounced(value);
            }}
          />

          <Editor
            readOnly={!!note.noteItem.isDeleted}
            value={content}
            setValue={(content) => {
              setContent(content);
              setLastContentEdit(now());
              setSaved(false);
              handleSaveNoteContentDebounced(content);
            }}
          />
        </div>
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },

  content: {
    flex: 1,
    overflowX: 'auto',
    padding: theme.spacing(1),
    paddingTop: theme.spacing(6),
  },

  contentInner: {
    width: 1000,
    margin: '0 auto',
  },

  title: {
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(6),
  },
}));

export default NotePage;
