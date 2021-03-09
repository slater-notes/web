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
    padding: `${theme.spacing(3)}px ${theme.spacing(2)}px ${theme.spacing(2)}px`,
  },
}));

export default FilterFiles;
