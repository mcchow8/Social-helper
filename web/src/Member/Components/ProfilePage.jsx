import React, { useContext, Fragment, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { UserContext } from "../providers/UserProvider";
import {auth, database, storage} from "../../firebase";
import Session from 'react-session-api'
import {
  Link,
  useRouteMatch,
} from "react-router-dom";

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { Container } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import {timeStampToString} from '../../common';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});


const ProfilePage = () => {
  let { path, url } = useRouteMatch();
  const classes = useStyles();
  const user = useContext(UserContext);
  const [photoURL] = user;
  const [havePost, setHavePost] = useState(true);
  let history = useHistory(); 
  const [open, setOpen] = useState(false);
  let uid = auth.currentUser.uid;
  Session.set("currentuid", uid);
  Session.set("currentusername", photoURL.username);

  const [post, setPost] = useState({
    imagefile: '',
    information: '',
  });

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [postInformation, postImage] = await Promise.all([
        fetchPost(),
      ]);

      setPost({
        ...postInformation,
        ...postImage,
      });

    };
    fetchData();
  }, []);

  const fetchPost = async () => {
    return database.ref("user-post/" + uid).orderByChild("createdAt").once('value')
      .then((snapshot) => {
        if(snapshot.val() == null) {
          setHavePost(false)
          return {information:''}
        } else {
          return {
            information: snapshot.val(),
          }
        }
      });
  };

  const handleSignOut = () => {
    auth.signOut()
    setOpen(true);
    setTimeout(function() { history.push(''); }, 4000)
  }


  let postList;
  let idList;
  if(post["information"] != null) {
    postList = Object.values(post["information"]);
    idList = Object.keys(post["information"]);
  }

  return (
    <Fragment>
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card className={classes.root}>
              <CardContent>
                <Typography variant="h3" component="h3">
                    Your Profile
                </Typography>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  Username
                </Typography>
                <Typography variant="h5" component="h2">
                  {photoURL.username}
                </Typography>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  Self Description
                </Typography>
                <Typography variant="h5" component="h2">
                {photoURL.self_description}
                </Typography>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  Email
                </Typography>
                <Typography variant="h5" component="h2">
                  {photoURL.email}
                </Typography>
              </CardContent>
              <Button variant="contained" color="primary" onClick = {() => {handleSignOut()}}>
                Sign Out
              </Button>
              <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success">
                  You have signed out! Auto refresh page after 4 seconds
                </Alert>
              </Snackbar> 
              <Link to={`/users/edit/${uid}`}>
              <Button variant="contained" color="primary">
                Edit Profile
              </Button>
              </Link>
              <br />
            </Card>
          </Grid>
        
          <Grid item xs={12} sm={6}>
            <Card className={classes.root}>
              <Typography variant="h3" component="h3">
                  Your post
              </Typography>
              <ul>
                {havePost === false ? "No post here. Let's go to create new post!" :
                  postList.map((data, index) => 
                    <li>
                      Post Name: <span>{data.product_name}</span>
                      <br />
                      Post Time: <span>{timeStampToString(-data.createdAt)}</span> // Like: <span>{data.number_of_like}</span> 
                      <br />
                      <Link to={`/auction/home/${idList[index]}`}><Button color="primary">View Post</Button></Link>
                      <Divider />
                    </li>
                  )}
              </ul>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Fragment>

  ) 
};

export default ProfilePage;

