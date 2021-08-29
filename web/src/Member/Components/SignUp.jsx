import React, {  useState } from "react";
import { Link } from "@reach/router";
import { useHistory } from "react-router-dom";
import { auth, signInWithGoogle, generateUserDocument, database } from "../../firebase";

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';

import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { ValidatorForm, TextValidator, SelectValidator, FileValidator} from 'react-material-ui-form-validator';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  let history = useHistory(); 
  const [open, setOpen] = useState(false);

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const createUserWithEmailAndPasswordHandler = async (event, email, password) => {
    event.preventDefault();
    setOpen(true);
    try{
      const {user} = await auth.createUserWithEmailAndPassword(email, password);
      //generateUserDocument(user, {displayName});
      database.ref('user/' + auth.currentUser.uid).set({
        username: {privacy: false,userdata:displayName},
        self_description:{privacy: false,userdata:"I am cser."},
        sex : {privacy: false,userdata:"M"}
      });
      
    }
    catch(error){
      setError('Error Signing up with email and password');
    }
      
    setEmail("");
    setPassword("");
    setDisplayName("");
    setTimeout(function() { history.push(''); }, 4000)
  };

  const onChangeHandler = event => {
    const { name, value } = event.currentTarget;

    if (name === "userEmail") {
      setEmail(value);
    } else if (name === "userPassword") {
      setPassword(value);
    } else if (name === "displayName") {
      setDisplayName(value);
    }
  };
  
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <ValidatorForm className={classes.form}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextValidator
                autoComplete="fname"
                name="displayName"
                variant="outlined"
                required
                fullWidth
                id="displayName"
                label="Username"
                autoFocus
                validators={['maxStringLength:20', 'minStringLength:1']}
                errorMessages={['The username is too long', 'The username is too short']}
                value={displayName}
                onChange={event => onChangeHandler(event)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextValidator
                type="email"
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="userEmail"
                autoComplete="email"
                validators={['isEmail']}
                errorMessages={['Please input a valid email']}
                value={email}
                onChange={event => onChangeHandler(event)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextValidator
                variant="outlined"
                required
                fullWidth
                name="userPassword"
                label="Password"
                type="password"
                id="userPassword"
                autoComplete="current-password"
                validators={['minStringLength:6']}
                errorMessages={['The password is too short']}
                value={password}
                onChange={event => onChangeHandler(event)}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={event => {
              createUserWithEmailAndPasswordHandler(event, email, password);
            }}
          >
            Sign Up
          </Button>
          <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="success">
              You have signed up! Auto go to home page after 4 seconds
            </Alert>
          </Snackbar>
          <Grid container justify="flex-end">
            <Grid item>
              <Link to="/" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </ValidatorForm>
      </div>
    </Container>
  );
};

export default SignUp;