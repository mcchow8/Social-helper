import React, {  useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useRouteMatch
  
} from "react-router-dom";


import Container from "@material-ui/core/Container";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import {auth, database} from '../../firebase'


  

const useStyles = makeStyles((theme) => ({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: '25ch',
      },
    },
  }));



const EditUser = (props) => {
    let { path, url } = useRouteMatch();
    const classes = useStyles();
    const userId = window.location.pathname.split('/')[3]
    const [user, setUser] = useState({
        self_description: {},
        sex: {},
        username: {}
    });
    const [profileUpdate, setProfileUpdate] = useState({
      username: "",
      self_description: "",
      sex: ""
    });
    const [open, setOpen] = useState(false);

    const handleClick = () => {
      setOpen(true);
    };

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
          const [userInfotmation] =await Promise.all([
            fetchUser(),
          ]);
          
          setUser({
            ...userInfotmation,
          });
    
        };
        fetchData();
    },[]);

    const fetchUser = async() => {
        return database.ref("/user/" + userId).once('value')
       .then((snapshot) => {
          return {
            self_description: snapshot.val().self_description,
            sex: snapshot.val().sex,
            username: snapshot.val().username
          }
        });
      };

    const handleSubmit = (e) => {
      e.preventDefault();
      setOpen(true);
      let check = false;
      let realUsername;
      let realDescription;
      let realSex;
      if (profileUpdate.username === "") {
        realUsername = user.username.userdata;
      } else {
        realUsername = profileUpdate.username;
        check = true;
      }
      if (profileUpdate.self_description === "") {
        realDescription = user.self_description.userdata;
      } else {
        realDescription = profileUpdate.self_description;
      }
      if (profileUpdate.sex === "") {
        realSex = user.sex.userdata;
      } else {
        realSex = profileUpdate.sex;
      }
      let profileData = {
        username: { privacy: false, userdata: realUsername },
        self_description: { privacy: false, userdata: realDescription },
        sex: { privacy: false, userdata: realSex }
      };
      console.log('profileData', profileData)
      database.ref('user/' + userId).update(profileData)
      .then(() => {
        if(check === true) {
          auth.currentUser.updateProfile({
            displayName: realUsername
          })
        }
      })
      setTimeout(function() { window.location.reload(); }, 4000)
    }

    return (
      <div>
        <form className={classes.root} autoComplete="off" onSubmit={(e) => handleSubmit(e)}>
          <Container>
            <Typography variant="h6">
              Edit User
            </Typography>

            <Typography>
              The orignial data are shown on each input box as placeholder.
              <p>Caution: You can leave blank if you don't want to change.</p>
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={12}>
                <TextField variant="filled" id="name" label="Username" placeholder={user.username.userdata} fullWidth
                onChange={e => setProfileUpdate({...profileUpdate, username: e.target.value})}/>
              </Grid>

              <Grid item xs={12} sm={12}>
                <TextField variant="filled" id="description" label="Description" placeholder={user.self_description.userdata} fullWidth
                onChange={e => setProfileUpdate({...profileUpdate, self_description: e.target.value})}/>
              </Grid>

              <Grid item xs={12} sm={12}>
              <InputLabel id="select-label">Gender</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={user.sex.userdata}
                onChange={e => setProfileUpdate({...profileUpdate, sex: e.target.value})}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value='Female'>Female</MenuItem>
              </Select>
            </Grid>

              <Button variant="contained" color="primary" type="submit">
              Submit
              </Button>

              <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success">
                  Your request is successful! Auto refresh page after 4 seconds
                </Alert>
              </Snackbar>

            </Grid>
          </Container>       
        </form>
      </div>
    )
    
}

export default EditUser;