import React from 'react';
import { Grid, Hidden, makeStyles } from '@material-ui/core';

const backgrounds = [
  {
    image: '/backgrounds/liana-mikah-L5cEmk3ucYY-unsplash.jpg',
    author: {
      name: 'Liana Mikah',
      url:
        'https://unsplash.com/@lianamikah?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText',
    },
  },
  {
    image: '/backgrounds/henry-co-UeueyMEWq-w-unsplash.jpg',
    author: {
      name: 'Henry & Co.',
      url:
        'https://unsplash.com/@hngstrm?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText',
    },
  },
];

interface Props {
  background?: number;
  children?: React.ReactNode;
}

const LoginPage = (props: Props) => {
  const classes = useStyles();
  const background = backgrounds[props.background || 0];

  return (
    <Grid container spacing={0} alignItems='stretch' className={classes.container}>
      <Grid item xs={12} lg={4} className={classes.leftContainer}>
        <div>
          <img src='/logo250.png' alt='Slater Notes Logo' width={30} />
        </div>

        {props.children}
      </Grid>
      <Hidden mdDown>
        <Grid
          item
          md={8}
          className={classes.cover}
          style={{ backgroundImage: `url(${background.image})` }}
        >
          <div>
            Photo by{' '}
            <a target='_blank' rel='noreferrer' href={background.author.url}>
              {background.author.name}
            </a>{' '}
            on{' '}
            <a
              target='_blank'
              rel='noreferrer'
              href='https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText'
            >
              Unsplash
            </a>
          </div>
        </Grid>
      </Hidden>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100vh',
  },

  leftContainer: {
    height: '100vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',

    '& > *': {
      padding: `${theme.spacing(4)}px ${theme.spacing(8)}px`,
      maxWidth: 600,
    },
  },

  cover: {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',

    '& > div': {
      fontSize: '1rem',
      color: theme.palette.text.hint,
      padding: theme.spacing(2),
    },

    '& a': {
      color: theme.palette.text.secondary,
    },
  },
}));

export default LoginPage;
