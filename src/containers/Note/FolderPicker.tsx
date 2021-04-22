import { Box, makeStyles, useTheme } from '@material-ui/core';
import React from 'react';
import { FolderItem, NoteItem } from '@slater-notes/core';
import { MenuItemObject } from '../../components/Menus/SimpleTextMenu';
import Tag from '../../components/Tag';
import { useStoreActions, useStoreState } from '../../store/typedHooks';
import moment from 'moment';
import { grey } from '@material-ui/core/colors';

interface Props {
  noteItem: NoteItem;
  onChange?: () => void;
}

const FolderPicker = (props: Props) => {
  const theme = useTheme();
  const classes = useStyles();

  const [folder, setFolder] = React.useState<FolderItem | null | undefined>(null);

  const fileCollection = useStoreState((s) => s.fileCollection);
  const updateNoteItem = useStoreActions((s) => s.updateNoteItem);

  const getFolderItemFromId = (id: string): FolderItem | undefined =>
    fileCollection?.folders.find((f) => f.id === id);

  React.useEffect(
    () => {
      setFolder(props.noteItem.parentId ? getFolderItemFromId(props.noteItem.parentId) : null);
    },
    // eslint-disable-next-line
    [props.noteItem.parentId],
  );

  const updateFolder = (payload: FolderItem | null) => {
    setFolder(payload);

    const noteItem = props.noteItem;
    if (payload) {
      noteItem.parentId = payload.id;
    } else {
      delete noteItem.parentId;
    }

    noteItem.updated = moment().unix();

    updateNoteItem({ id: noteItem.id, noteItem });

    if (props.onChange) props.onChange();
  };

  return (
    <React.Fragment>
      {React.useMemo(() => {
        const items: MenuItemObject[] =
          fileCollection && fileCollection.folders.length > 0
            ? fileCollection.folders
                .filter((f) => !f.isDeleted)
                .map((folder) => ({
                  label: folder.title || 'Untitled',
                  isSelected: folder.id === props.noteItem.parentId,
                  onClick: () => {
                    updateFolder(folder);
                  },
                }))
            : [];

        items.unshift({
          label: 'Folders',
          isSubheader: true,
        });

        return (
          <div className={classes.container}>
            <Tag
              className={classes.tag}
              text={
                <Box
                  component='span'
                  fontSize='0.9rem'
                  fontWeight={theme.typography.fontWeightMedium}
                >
                  {folder ? folder.title || 'Untitled' : 'Save to folder...'}
                </Box>
              }
              menuItems={items}
              onDelete={props.noteItem.parentId ? () => updateFolder(null) : undefined}
            />
          </div>
        );
        // eslint-disable-next-line
      }, [fileCollection, props.noteItem, props.noteItem.parentId, folder])}
    </React.Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'inline-block',
  },

  removeFromFolderText: {
    color: theme.palette.error.main,
  },

  tag: {
    background: '0 !important',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    padding: `${theme.spacing(1.25)}px ${theme.spacing(1)}px`,
    height: 'auto',

    '&:hover': {
      borderColor: grey[300],
    },
  },
}));

export default FolderPicker;
