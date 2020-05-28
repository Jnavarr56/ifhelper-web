import React, { useState, useEffect } from 'react';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import validate from 'validate.js';
import { makeStyles } from '@material-ui/styles';
import {
  Grid,
  Button,
  IconButton,
  TextField,
  Link,
  FormHelperText,
  Checkbox,
  Typography,
  Dialog,
  CircularProgress,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Divider
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';
import { Alert, AlertTitle } from '@material-ui/lab'
import axios from 'axios'

const schema = {
  first_name: {
    presence: { allowEmpty: false, message: 'is required' },
    length: {
      maximum: 32
    }
  },
  last_name: {
    presence: { allowEmpty: false, message: 'is required' },
    length: {
      maximum: 32
    }
  },
  email: {
    presence: { allowEmpty: false, message: 'is required' },
    email: true,
    length: {
      maximum: 64
    }
  },
  password: {
    presence: { allowEmpty: false, message: 'is required' },
    length: {
      maximum: 128
    }
  },
  policy: {
    presence: { allowEmpty: false, message: 'is required' },
    checked: true
  }
};

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.default,
    height: '100%'
  },
  grid: {
    height: '100%'
  },
  quoteContainer: {
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  quote: {
    backgroundColor: theme.palette.neutral,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: 'url(/images/auth.jpg)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },
  quoteInner: {
    textAlign: 'center',
    flexBasis: '600px'
  },
  quoteText: {
    color: theme.palette.white,
    fontWeight: 300
  },
  name: {
    marginTop: theme.spacing(3),
    color: theme.palette.white
  },
  bio: {
    color: theme.palette.white
  },
  contentContainer: {},
  content: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(5),
    paddingBototm: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  logoImage: {
    marginLeft: theme.spacing(4)
  },
  contentBody: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center'
    }
  },
  form: {
    paddingLeft: 100,
    paddingRight: 100,
    paddingBottom: 125,
    flexBasis: 700,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    }
  },
  title: {
    marginTop: theme.spacing(3)
  },
  textField: {
    marginTop: theme.spacing(2)
  },
  policy: {
    marginTop: theme.spacing(1),
    display: 'flex',
    alignItems: 'center'
  },
  policyCheckbox: {
    marginLeft: '-14px'
  },
  signUpButton: {
    margin: theme.spacing(2, 0)
  },
  hideDialogPaper: {
    '& .MuiDialog-paper': {
      backgroundColor: 'transparent',
      boxShadow: 'none'
    }
  },
  alert: {
    '& *': {
      color: 'inherit'
    }
  }
}));

const SignUp = props => {
  const { history } = props;

  const classes = useStyles();

  const [ fetching, setFetching ]  = useState(false);
  const [ registrationResult, setRegistrationResult ]  = useState(null);
  const [ alert, setAlert ]  = useState(null);

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });

  useEffect(() => {
    const errors = validate(formState.values, schema);

    setFormState(formState => ({
      ...formState,
      isValid: errors ? false : true,
      errors: errors || {}
    }));
  }, [formState.values]);

  const handleChange = event => {
    event.persist();

    setFormState(formState => ({
      ...formState,
      values: {
        ...formState.values,
        [event.target.name]:
          event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value
      },
      touched: {
        ...formState.touched,
        [event.target.name]: true
      }
    }));
  };

  const handleBack = () => {
    history.push('/sign-in');
  };

  const handleSignUp = event => {
    event.preventDefault();

    setFetching(true);

    const URL = `${process.env.REACT_APP_API_URL}/registration/sign-up`;
    const payload = formState.values;
    const requestConfig = { withCredentials: true };

    axios.post(URL, payload, requestConfig)
      .then(response => {
        setFetching(false);

        const { new_user } = response.data;
        const { first_name, email } = new_user;

        
        setRegistrationResult({
          title: `Welcome ${first_name}!`,
          text: `Your account was created. We have 
          sent an email with a 
          confirmation link to ${email}. 
          In order to complete the sign-up process, 
          please click the confirmation link.`
        });
      })
      .catch(error => {
        setFetching(false);

        let alertData;

        if (!error.response) {
          alertData = {
            title: "Oops!",
            severity: "error",
            text: "There's a problem. Please try again later."
          };
        } else {
          const { data, status } = error.response;
          const { error_code } = data;
          if (status !== 400 || error_code !== "USER WITH EMAIL ALREADY EXISTS") {
            alertData = {
              title: "Oops!",
              severity: "error",
              text: "There's a problem. Please try again later."
            };
          } else {
            alertData = {
              title: "Email Unavailable",
              severity: "error",
              text: "An account with this email already exists."
            };
          }
        }

        setAlert(alertData);
        
      })
  };

  const hasError = field =>
    formState.touched[field] && formState.errors[field] ? true : false;

  return (
    <>
    {Boolean(alert) && (
      <Alert className={classes.alert} severity={alert.severity} variant="filled" color="error" action={
        <IconButton onClick={() => setAlert(null)}>
          <CloseIcon />
        </IconButton>
      }>
        <AlertTitle >{alert.title}</AlertTitle>
        {alert.text}
      </Alert>
    )}
    <div className={classes.root}>
      <Grid
        className={classes.grid}
        container
      >
        <Grid
          className={classes.quoteContainer}
          item
          lg={5}
        >
          <div className={classes.quote}>
            <div className={classes.quoteInner}>
              <Typography
                className={classes.quoteText}
                variant="h1"
              >
                Hella narwhal Cosby sweater McSweeney's, salvia kitsch before
                they sold out High Life.
              </Typography>
              <div className={classes.person}>
                <Typography
                  className={classes.name}
                  variant="body1"
                >
                  Takamaru Ayako
                </Typography>
                <Typography
                  className={classes.bio}
                  variant="body2"
                >
                  Manager at inVision
                </Typography>
              </div>
            </div>
          </div>
        </Grid>
        <Grid
          className={classes.content}
          item
          lg={7}
          xs={12}
        >
          <div className={classes.content}>
            <div className={classes.contentHeader}>
              <IconButton onClick={handleBack}>
                <ArrowBackIcon />
              </IconButton>
            </div>
            <div className={classes.contentBody}>
              <form
                className={classes.form}
                onSubmit={handleSignUp}
              >
                <Typography
                  className={classes.title}
                  variant="h2"
                >
                  Create new account
                </Typography>
                <Typography
                  color="textSecondary"
                  gutterBottom
                >
                  Use your email to create new account
                </Typography>
                <TextField
                  className={classes.textField}
                  error={hasError('first_name')}
                  fullWidth
                  helperText={
                    hasError('first_name') ? formState.errors.first_name[0] : null
                  }
                  label="First name"
                  name="first_name"
                  onChange={handleChange}
                  type="text"
                  value={formState.values.first_name || ''}
                  variant="outlined"
                />
                <TextField
                  className={classes.textField}
                  error={hasError('last_name')}
                  fullWidth
                  helperText={
                    hasError('last_name') ? formState.errors.last_name[0] : null
                  }
                  label="Last name"
                  name="last_name"
                  onChange={handleChange}
                  type="text"
                  value={formState.values.last_name || ''}
                  variant="outlined"
                />
                <TextField
                  className={classes.textField}
                  error={hasError('email')}
                  fullWidth
                  helperText={
                    hasError('email') ? formState.errors.email[0] : null
                  }
                  label="Email address"
                  name="email"
                  onChange={handleChange}
                  type="text"
                  value={formState.values.email || ''}
                  variant="outlined"
                />
                <TextField
                  className={classes.textField}
                  error={hasError('password')}
                  fullWidth
                  helperText={
                    hasError('password') ? formState.errors.password[0] : null
                  }
                  label="Password"
                  name="password"
                  onChange={handleChange}
                  type="password"
                  value={formState.values.password || ''}
                  variant="outlined"
                />
                <div className={classes.policy}>
                  <Checkbox
                    checked={formState.values.policy || false}
                    className={classes.policyCheckbox}
                    color="primary"
                    name="policy"
                    onChange={handleChange}
                  />
                  <Typography
                    className={classes.policyText}
                    color="textSecondary"
                    variant="body1"
                  >
                    I have read the{' '}
                    <Link
                      color="primary"
                      component={RouterLink}
                      to="#"
                      underline="always"
                      variant="h6"
                    >
                      Terms and Conditions
                    </Link>
                  </Typography>
                </div>
                {hasError('policy') && (
                  <FormHelperText error>
                    {formState.errors.policy[0]}
                  </FormHelperText>
                )}
                <Button
                  className={classes.signUpButton}
                  color="primary"
                  disabled={!formState.isValid}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                >
                  Sign up now
                </Button>
                <Typography
                  color="textSecondary"
                  variant="body1"
                >
                  Have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/sign-in"
                    variant="h6"
                  >
                    Sign in
                  </Link>
                </Typography>
              </form>
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
    <Dialog className={fetching ? classes.hideDialogPaper : ''} open={fetching || Boolean(registrationResult)}>
        {fetching && <CircularProgress variant="indeterminate"/>}
        {Boolean(registrationResult) && (
          <>
            <DialogTitle>{registrationResult.title}</DialogTitle>
            <Divider variant="fullWidth"/>
              <DialogContent>
                <DialogContentText>{registrationResult.text}</DialogContentText>
                <Divider variant="fullWidth"/>
                <DialogActions>
                  <Button variant="contained" color="primary" onClick={() => setRegistrationResult(null)}>
                    Ok
                  </Button>
              </DialogActions>
            </DialogContent>
          </>
        )}
    </Dialog>
    </>
  );
};

SignUp.propTypes = {
  history: PropTypes.object
};

export default withRouter(SignUp);
