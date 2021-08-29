import React, { useState, useEffect, Fragment } from 'react';
import {
  Link,
  useRouteMatch,
} from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { Container } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import { database, storage } from '../../firebase'
import CreatePost from './createPost'
import Session from 'react-session-api'

import { SeacrhBar } from './search'
import { LaptopWindows } from '@material-ui/icons';


const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  root_fab: {
    '& > *': {
      margin: theme.spacing(1),
      right: 20,
      bottom: 10,
      position: 'fixed',
    },
  },
  mainFeaturedPost: {
    position: 'relative',
    backgroundColor: theme.palette.grey[800],
    color: theme.palette.common.white,
    marginBottom: theme.spacing(4),
    backgroundImage: 'url(https://source.unsplash.com/random)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,.3)',
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  mainFeaturedPostContent: {
    position: 'relative',
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(6),
      paddingRight: 0,
    },
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
}));

export const PostsContainer = (props) => {
  const classes = useStyles();
  return (
    <Container id="card">
      <Grid container spacing={3}>
        {props.postList.map((data, index) =>
          <Grid item xs={12} sm={4}>
            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                {
                  props.imgObj ?
                    props.imgObj.hasOwnProperty(props.idList[index]) ?
                      <img src={props.imgObj[props.idList[index]]} alt="" width="100"></img>
                      :
                      null
                    :
                    <div id={props.idList[index]}></div>
                }
                <h5>{data.product_name}</h5>
                <p>{data.post_content}</p>
                <p>${data.product_price}</p>
                <CardActions>
                  <Link to={`${props.url}/${props.idList[index]}`}><Button size="small" color="primary">Look</Button></Link>
                </CardActions>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  )
}

export default function AuctionHome() {
  let { path, url } = useRouteMatch();
  const classes = useStyles();
  const [post, setPost] = useState({
    imagefile: '',
    information: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const [postInformation, postImage] = await Promise.all([
        fetchPost(),
        fetchImage(),
      ]);

      setPost({
        ...postInformation,
        ...postImage,
      });

    };
    fetchData();
  }, []);

  const fetchPost = async () => {
    return database.ref("/post/").orderByChild("createdAt").limitToFirst(3).once('value')
      .then((snapshot) => {
        return {
          information: snapshot.val(),
        }
      });
  };

  const fetchImage = async () => {
    return database.ref("/post/").orderByChild("createdAt").limitToFirst(3).once('value')
      .then((snapshot) => {
        let content = snapshot.val();
        let king = {};
        for (const test in content) {
          storage.ref().child("postsImages/" + `${content[test]["post_owner_uid"]}` + "/" + `${test}` + "/0.jpg")
            .getDownloadURL().then((url) => {
              document.getElementById(test).innerHTML +=
                `
            <img src="${url}" width="100"></img>
          `
            })
        }
        return {
          imagefile: king,
        }
      });
  };

  const postList = Object.values(post["information"]);
  const idList = Object.keys(post["information"]);
  //console.log(postList)
  //console.log(Session.get("currentuid"))

  return (
    <Fragment>
      <Paper className={classes.mainFeaturedPost} style={{ backgroundImage: `url(https://source.unsplash.com/random)` }}>
        {/* Increase the priority of the hero background image */}
        {<img style={{ display: 'none' }} alt="ERROR" />}
        <div className={classes.overlay} />
        <Grid container>
          <Grid item md={6}>
            <div className={classes.mainFeaturedPostContent}>
              <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                Auction
                </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                Find your favourite here
                </Typography>
              <SeacrhBar />
            </div>
          </Grid>
        </Grid>
      </Paper>
      <PostsContainer postList={postList} idList={idList} url={url} />
      <div className={classes.root_fab}>
        <Fab color="primary" aria-label="add">
            <Link to="/auction/create"><AddIcon /></Link>
        </Fab>
      </div>
    </Fragment>
  );
}