import { FormControl, makeStyles, TextField } from '@material-ui/core';
import React from 'react';

interface Props {
  onChange: (input: string) => void;
}

const FilterFiles = (props: Props) => {
  const classes = useStyles();

  return (
    <FormControl fullWidth className={classes.formControl}>
      <TextField
        label='Search Files'
        variant='outlined'
        autoComplete='off'
        size='small'
        onChange={(e) => props.onChange(e.currentTarget.value)}
      />
    </FormControl>
  );
};

const useStyles = makeStyles((theme) => ({
  formControl: {
    display: 'flex',
    marginTop: `-${theme.spacing(3)}px`,
    marginBottom: `${theme.spacing(3)}px`,
  },
}));

export default FilterFiles;
