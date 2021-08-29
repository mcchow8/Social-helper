import React, { useState, useEffect } from "react";
import {
  Link,
} from "react-router-dom";
import Grid from '@material-ui/core/Grid';
import { Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import { timeStampToString } from '../../common';

import { database, storage } from '../../firebase'
import firebase from "firebase/app";
import Session from 'react-session-api'

const useStyles = makeStyles((theme) => ({
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
  margin: {
    margin: theme.spacing(1),
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
}));

const ReadPost = (props) => {
  const classes = useStyles();
  const postId = window.location.pathname.split('/')[3]
  const [post, setPost] = useState({
    imagefile: '',
    information: '',
    comment: '',
  });
  const [postNewComment, setPostNewComment] = useState({
    commentContent: " "
  });
  const [postLike, setPostLike] = useState(false);
  const [postHaveComment, setPostHaveComment] = useState(true)
  const [open, setOpen] = useState(false);
  let current = Session.get("currentuid");

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const handleSuccessClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [postInformation, postImage, postComment] = await Promise.all([
        fetchPost(),
        fetchImage(),
        fetchComment()
      ]);
      setPost({
        ...postInformation,
        ...postImage,
        ...postComment
      });


    };
    fetchData();
  }, []);

  const fetchPost = async () => {
    return database.ref("/post/" + postId).once('value')
      .then((snapshot) => {
        return {
          information: snapshot.val(),
        }
      });
  };

  const fetchImage = async () => {
    return database.ref("/post/" + postId).once('value')
      .then((snapshot) => {
        let content = snapshot.val();
        let king = {};
        for (let i = 0; i < content.image_number; i++) {
          storage.ref().child("postsImages/" + `${content["post_owner_uid"]}` + "/" + `${postId}` + "/" + `${i}` + ".jpg")
            .getDownloadURL().then((url) => {
              document.getElementById("test").innerHTML +=
                `
                  <img src="${url}" width="50%" alt="Load image failed. Please refresh page"></img>
                `
            })
        }
        return {
          imagefile: king,
        }
      });
  };

  const fetchComment = async () => {
    return database.ref("/comments/" + postId).once('value')
      .then((snapshot) => {
        if (snapshot.val() == null) {
          setPostHaveComment(false)
          return { comment: '' }
        } else {
          return {
            comment: snapshot.val(),
          }
        }
      });
  };

  let postComment;
  if (post["comment"] != null) {
    postComment = Object.values(post["comment"]);
  }
  let postContent = post["information"];

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(true);
    let updates = {};
    let useruid = Session.get("currentuid");
    let username = Session.get("currentusername");
    let newPostKey = database.ref().child('comments/' + postId).push().key;
    let commentData = {
      comment_content: postNewComment.commentContent,
      comment_location: "public",
      comment_owner: username,
      number_of_like: 0,
      post_owner_uid: useruid,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    updates['/comments/' + postId + '/' + newPostKey] = commentData;
    database.ref().update(updates).then(_ => {
      database.ref('/comments/' + postId + '/' + newPostKey).once('value').then(
        (snapshot) => {
          database.ref('/comments/' + postId + '/' + newPostKey).update({ createdAt: snapshot.val().createdAt * -1 })
        }
      );
    })
    setTimeout(function () { window.location.reload(); }, 4000)
  }

  const handleClick = (e) => {
    let uid = Session.get("currentuid")
    database.ref().child('post/' + postId).transaction((post) => {
      if (post) {
        if (post.like_id && post.like_id[uid]) {
          post.number_of_like--;
          post.like_id[uid] = null;
          setPostLike(false)
        } else {
          post.number_of_like++;
          setPostLike(true)
          if (!post.like_id) {
            post.like_id = {};
          }
          post.like_id[uid] = true;
        }
      }
      return post;
    });
    if ("" !== postContent.post_owner_uid) {
      database.ref().child('/user-post/' + postContent.post_owner_uid + '/' + postId).transaction((post) => {
        if (post) {
          if (post.like_id && post.like_id[uid]) {
            post.number_of_like--;
            post.like_id[uid] = null;
            setPostLike(false)
          } else {
            post.number_of_like++;
            setPostLike(true)
            if (!post.like_id) {
              post.like_id = {};
            }
            post.like_id[uid] = true;
          }
        }
        return post;
      });
    }

  }

  return (
    <div>
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <div id="test"></div>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card className={classes.root}>
              <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  Product Name
                        </Typography>
                <Typography variant="h5" component="h2">
                  {postContent.product_name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card className={classes.root}>
              <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  Post Type
                        </Typography>
                <Typography variant="h5" component="h2">


                  {postContent.product_type ? "Service" : "Product"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card className={classes.root}>
              <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  Price
                        </Typography>
                <Typography variant="h5" component="h2">
                  HKD${postContent.product_price}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Card className={classes.root}>
              <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  Description
                        </Typography>
                <Typography variant="h5" component="h2">
                  {postContent.post_content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Card className={classes.root}>
              <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  Product Type
                        </Typography>
                <Typography variant="h5" component="h2">
                  {postContent.product_category === 0 ? "Electronic devices" :
                    postContent.product_category === 1 ? "Clothes" :
                      postContent.product_category === 2 ? "Books" :
                        postContent.product_category === 3 ? "CD" : "Health Products"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card className={classes.root}>
              <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  Product Owner
                        </Typography>
                <Typography variant="h5" component="h2">
                  {postContent.post_owner}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card className={classes.root}>
              <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  Like
                        </Typography>
                <Typography variant="h5" component="h2">
                  {postLike === true ? postContent.number_of_like + 1 : postContent.number_of_like}
                  <Button onClick={(e) => handleClick(e)}><ThumbUpAltIcon /></Button>
                </Typography>

              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card className={classes.root}>
              <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  Post created time
                        </Typography>
                <Typography variant="h5" component="h2">
                  {timeStampToString(-postContent.createdAt)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          

          <Grid item xs={12} sm={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                Let's have a chat with the owner
                </Typography>
                {
                  Session.get("currentuid")  && postContent.post_owner_uid &&
                  <Link to={"/chat/" + postContent.post_owner_uid}>
                    <Button variant="outlined" size="large" color="primary" className={classes.margin}>
                      Chat
                    </Button>
                  </Link>
                }
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={12}>
            <Card>
              <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  Comment
                </Typography>
                {postHaveComment === false ? "Comment empty. Let's add the new one!" :
                  postComment.map((data, index) =>
                    <div id={index}>
                      Username: <span>{data.comment_owner}</span>  //  Post Time: <span>{timeStampToString(-data.createdAt)}</span>
                      <br />
                      <p>{data.comment_content}</p>
                    </div>
                  )}
              </CardContent>
              <Container>
              { Session.get("currentuid") ? 
                <form onSubmit={e => { handleSubmit(e) }}>
                  <TextField id="commentName" label="Comment" variant="outlined" fullWidth name="comment"
                    onChange={e => setPostNewComment({ ...postNewComment, commentContent: e.target.value })} />
                    <Button variant="contained" color="primary" type="submit">
                      Submit
                    </Button>
                    <Snackbar open={open} autoHideDuration={6000} onClose={handleSuccessClose}>
                      <Alert onClose={handleSuccessClose} severity="success">
                        Your request is successful! Auto refresh page after 4 seconds
                      </Alert>
                    </Snackbar>
                </form>
                :
                <div>
                </div>
                }
              </Container>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>

  )
}

export default ReadPost;