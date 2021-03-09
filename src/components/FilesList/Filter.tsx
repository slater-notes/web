import { FormControl, makeStyles, TextField } from '@material-ui/core';
import React from 'react';

interface Props {
  onChange?: (input: string) => void;
}

const Filter = (props: Props) => {
  const classes = useStyles();

  return (
    <FormControl fullWidth className={classes.formControl}>
      <TextField
        label='Filter files'
        variant='outlined'
        size='small'
        autoComplete='off'
        onChange={(e) => props.onChange && props.onChange(e.currentTarget.value)}
      />
    </FormControl>
  );
};

const useStyles = makeStyles({
  formControl: {
    display: 'flex',
    marginTop: '1rem',
    marginBottom: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
});

export default Filter;
