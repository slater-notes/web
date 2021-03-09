import { useEffect, useState } from 'react';
import Explorer, { Props as ExplorerProps } from '../Explorer';
import Filter from './Filter';

interface Props {
  explorerProps: ExplorerProps;
  withFilter?: boolean;
}

const FilesList = (props: Props) => {
  const [items, setItems] = useState(props.explorerProps.items);
  const [filter, setFilter] = useState('');

  useEffect(
    () => {
      setItems(props.explorerProps.items);
    },
    // eslint-disable-next-line
    [props.explorerProps.items],
  );

  useEffect(
    () => handleFilter(filter),
    // eslint-disable-next-line
    [filter],
  );

  const handleFilter = (input: string) => {
    const filterStr = input.trim().toLocaleLowerCase();

    if (filterStr.length > 0) {
      setItems(
        props.explorerProps.items.filter(
          (item) => item.text.toLocaleLowerCase().indexOf(filterStr) > -1,
        ),
      );
    } else {
      setItems(props.explorerProps.items);
    }
  };

  return (
    <div>
      <Explorer
        {...props.explorerProps}
        items={items}
        childrenAfterTitle={
          props.withFilter ? (
            <Filter onChange={(input) => setFilter(input)} />
          ) : (
            props.explorerProps.childrenAfterTitle
          )
        }
      />
    </div>
  );
};

export default FilesList;
