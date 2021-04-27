import { makeStyles, TextField, TextFieldProps } from '@material-ui/core';

const SingleLineInput = (props: TextFieldProps) => {
  const { label, input } = useStyles();

  return (
    <div>
      {props.label && (
        <label className={label} htmlFor={props.name}>
          {props.label}
        </label>
      )}
      <TextField id={props.name} {...props} className={input} label={undefined} />
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: theme.typography.fontWeightMedium,
    marginBottom: theme.spacing(1),
  },

  input: {
    width: '100%',
  },
}));

export default SingleLineInput;
