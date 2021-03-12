import { makeStyles } from '@material-ui/core';
import React, { useEffect } from 'react';
import EditorJS, { API, EditorConfig, OutputData } from '@editorjs/editorjs';
import { debounce } from 'lodash';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import Table from 'editorjs-table';
import Image from '@editorjs/image';

const editorTools: { [toolName: string]: any } = {
  paragraph: {
    config: {
      preserveBlank: true,
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: 'Enter a Heading',
      levels: [2, 3, 4],
      defaultLevel: 4,
    },
  },
  list: {
    class: List,
    inlineToolbar: true,
  },
  inlineCode: {
    class: InlineCode,
  },
  marker: {
    class: Marker,
  },
  table: {
    class: Table,
    inlineToolbar: true,
  },
  Image: {
    class: Image,
    config: {
      uploader: {
        uploadByFile: (file: File) => {
          return new Promise((done) => {
            const reader = new FileReader();

            reader.addEventListener('load', () => {
              console.log(reader.result);
              const url = reader.result;
              done({ success: true, file: { url } });
            });

            reader.readAsDataURL(file);
          });
        },
      },
    },
  },
};

interface Props {
  id: string;
  initialData?: OutputData;
  readOnly?: boolean;
  autoFocus?: boolean;
  handleSave: (data: OutputData) => void;
  onChange?: () => void;
}

const Editor = (props: Props) => {
  const classes = useStyles();

  const save = async (api: API) => {
    const data = await api.saver.save();
    props.handleSave(data);
  };

  const handleChangeDebounced = React.useMemo(() => debounce(save, 1000, { leading: false }), []);

  useEffect(() => {
    const config: EditorConfig = {
      holder: 'editor-' + props.id,
      placeholder: 'Write something here...',
      readOnly: props.readOnly,
      tools: editorTools,
      onChange: (api) => {
        if (props.onChange) props.onChange();
        handleChangeDebounced(api);
      },
    };

    if (props.initialData) {
      config.data = props.initialData;
    }

    new EditorJS(config);

    // eslint-disable-next-line
  }, []);

  return (
    <div className={classes.container}>
      <EditorElement id={props.id} />
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    color: theme.palette.text.primary,
    fontSize: 18,

    '& .ce-block__content, .ce-toolbar__content': {
      margin: '0px !important',
    },
  },
}));

const EditorElement = React.memo((props: { id: string }) => <div id={'editor-' + props.id} />);

export default Editor;
