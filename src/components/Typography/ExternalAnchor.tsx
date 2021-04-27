import { useTheme } from '@material-ui/core';
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  href: string;
}>;

const ExternalAnchor = (props: Props) => {
  const theme = useTheme();

  return (
    <a
      href={props.href}
      target='_blank'
      rel='noopener noreferrer'
      style={{ color: theme.palette.secondary.main }}
    >
      {props.children}
    </a>
  );
};

export default ExternalAnchor;
