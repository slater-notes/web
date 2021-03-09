import React, { useState } from 'react';
import { FolderItem } from '@slater-notes/core';
import EditableTypography from '../../../../components/EditableTypography';

interface Props {
  folder: FolderItem;
  onDone: (value: string) => void;
}

const FolderItemEdit = (props: Props) => {
  const [title, setTitle] = useState(props.folder.title);

  return (
    <EditableTypography
      typographyProps={{
        style: { fontSize: 'inherit', letterSpacing: 'inherit', lineHeight: 'inherit' },
      }}
      text={title}
      placeholder='Untitled'
      autoFocus
      onChange={(value) => setTitle(value)}
      onBlur={() => props.onDone(title)}
      onKeyPress={(e) => {
        switch (e.key) {
          case 'Enter':
            props.onDone(title);
            break;
        }
      }}
      onKeyDown={(e) => {
        switch (e.key) {
          case 'Escape':
            props.onDone(props.folder.title);
            break;
        }
      }}
    />
  );
};

export default FolderItemEdit;
