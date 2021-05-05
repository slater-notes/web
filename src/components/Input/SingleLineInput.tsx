import { makeStyles, TextField, TextFieldProps } from '@material-ui/core';

const SingleLineInput = (props: TextFieldProps) => {
  const { label } = useStyles();

  return (
    <div>
      {props.label && (
        <label className={label} htmlFor={props.name}>
          {props.label}
        </label>
      )}
      <TextField id={props.name} {...props} label={undefined} />
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
}));

export default SingleLineInput;
