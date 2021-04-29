import { FormControl, makeStyles } from '@material-ui/core';
import SingleLineInput from '../../../components/Input/SingleLineInput';

interface Props {
  onChange: (input: string | null) => void;
}

const FilterFiles = (props: Props) => {
  const classes = useStyles();

  return (
    <FormControl fullWidth className={classes.formControl}>
      <SingleLineInput
        placeholder='Search for notes'
        variant='outlined'
        autoComplete='off'
        size='small'
        onChange={(e) => {
          const { value } = e.currentTarget;
          props.onChange(value === '' ? null : value);
        }}
      />
    </FormControl>
  );
};

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginTop: `-${theme.spacing(3)}px`,
    marginBottom: `${theme.spacing(3)}px`,
  },
}));

export default FilterFiles;
