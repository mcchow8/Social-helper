import React, { useState} from 'react';
import { useHistory } from "react-router-dom";

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Container from '@material-ui/core/Container'
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import {auth, database, storage} from '../../firebase'
import firebase from "firebase/app";
import Session from 'react-session-api'
import { ValidatorForm, TextValidator, SelectValidator, FileValidator} from 'react-material-ui-form-validator';

const CreatePost = (props) => {
  const [postContent, setPostContent] = useState({
    postName: "",
    postDescription: "",
    productType: 0,
    productPrice: 0,
    productCategory: 0,
    productCategoryNumber: 0,
    postImg:""
  });
  let history = useHistory(); 

  const handleSubmit= (e) => {
    e.preventDefault();
    const FileList = document.getElementById('input').files;
    let newPostKey = database.ref().child('post').push().key;
    let useruid = Session.get("currentuid");
    let username = Session.get("currentusername");

    let tagsArray = postContent.postName.match(/([^ ]*[a-zA-Z0-9]+[^ ]*)/g);
    let tagsWords = {};
    let updates = {};
    let tag = {};
    tag[newPostKey] = { createdAt: true };
    if (tagsArray !== null) {
      for (let i = 0; i < tagsArray.length; i++) {
        tagsWords[tagsArray[i].toLowerCase()] = true;
        updates['/tags/' + tagsArray[i].toLowerCase()] = tag;
        updates['/tag-list/' + tagsArray[i].toLowerCase()] = true;
      }
    }
    let postData = {
      post_content: postContent.postDescription,
      product_name: postContent.postName,
      product_price: postContent.productPrice,
      product_category: postContent.productCategoryNumber,
      product_type: postContent.productType,
      post_location: "public",
      post_owner: username,
      number_of_like: 0,
      post_owner_uid: useruid,
      image_number: FileList.length,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      tags: tagsWords,
    };
    updates['/post/' + newPostKey] = postData;
	  updates['/user-post/' + useruid + '/' + newPostKey] = postData;
    database.ref().update(updates).then(_ => {
      database.ref('/post/' + newPostKey).once('value').then(
        (snapshot) => {
          database.ref('/post/' + newPostKey).update({ createdAt: snapshot.val().createdAt * -1 })
          database.ref('/user-post/' + useruid + '/' + newPostKey).update({ createdAt: snapshot.val().createdAt * -1 })
          if (snapshot.val().hasOwnProperty("tags")) {
            let newTag = {};
            let newUpdates = {}
            newTag[newPostKey] = { createdAt: snapshot.val().createdAt * -1 };
            for (let i = 0; i < tagsArray.length; i++) {
              newUpdates['/tags/' + tagsArray[i]] = newTag;
            }
            database.ref().update(newUpdates);
          }
        }
      );
    })
    for(var i=0; i< FileList.length; i++) {
      storage
      .ref()
      .child("postsImages/" + auth.currentUser.uid + "/" + newPostKey + "/" + i.toString() + ".jpg")
      .put(FileList[i]).then((snapshot) => {
        console.log('Uploaded a blob or file!');
      });
    }
    history.push('/auction/home/' + newPostKey)
  }

  const handlePicture = (e) => {
    const selectedFile = document.getElementById('input').files;
    var d = document.getElementById("fileList");
      if (!selectedFile.length) {
        d.innerHTML = "<p>No files selected!</p>";
      } else {
        var list = document.createElement("ul");
        d.appendChild(list);
        for (var i=0; i < selectedFile.length; i++) {
          var li = document.createElement("li");
          list.appendChild(li);
          
          var img = document.createElement("img");
          img.src = window.URL.createObjectURL(selectedFile[i]);;
          img.height = 400;
          img.onload = function() {
            window.URL.revokeObjectURL(this.src);
          }
          li.appendChild(img);
          
          var info = document.createElement("span");
          info.innerHTML = selectedFile[i].name + ": " + selectedFile[i].size + " bytes";
          li.appendChild(info);
        }
      }
  }

  const handleFailed = () => {
    setTimeout(function(){ history.push("/auction/home"); }, 5000);
  }
  
  return (
    Session.get("currentuid") ?
    <div>
      <ValidatorForm onSubmit={e => { handleSubmit(e) }}>
        <Container>
          <Typography variant="h6" gutterBottom>
          Create Post
          </Typography>

          <Typography variant="h6" gutterBottom id="test">
            Your username: {Session.get("currentusername")}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <TextValidator id="postName" label="Post Name"
              value={postContent.postName}
              validators={['required']}
              errorMessages={['This field is required']}
              fullWidth
              onChange={e => setPostContent({...postContent, postName: e.target.value})}/>
            </Grid>

            <Grid item xs={12} sm={12}>
              <TextValidator id="description" label="Description" variant="outlined" name="description"
              value={postContent.postDescription}
              validators={['required']}
              errorMessages={['This field is required']}
              fullWidth
              onChange={e => setPostContent({...postContent, postDescription: e.target.value})} />
            </Grid>

            <input type="file" id="input" data-target="file-uploader" accept="image/*" multiple="multiple" onChange={(e) => handlePicture(e)}/>
            
            <div id="fileList">
            </div>

            <Grid item xs={12} sm={12}>
              <FormLabel component="legend">Post Type</FormLabel>
              <RadioGroup row aria-label="type" name="type">
                <FormControlLabel value="0" control={<Radio />} label="Product" 
                onChange={e => setPostContent({...postContent, productType:0})}/>
                <FormControlLabel value="1" control={<Radio />} label="Service"
                onChange={e => setPostContent({...postContent, productType:1})} />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} sm={12}>
              <TextValidator id="price" label="HKD$ Price" type="number" fullWidth
              value={postContent.productPrice}
              validators={['minNumber:0', 'required']}
              errorMessages={['Value must be postive or 0', 'This field is required']}
              onChange={e => setPostContent({...postContent, productPrice: e.target.value})}/>
            </Grid>

            <Grid item xs={12} sm={12}>
              <InputLabel id="select-label">Category</InputLabel>
              <SelectValidator
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={postContent.productCategory}
                validators={['required']}
                errorMessages={['This field is required']}
                fullWidth
                onChange={e => setPostContent({...postContent, productCategory: e.target.value})}
              >
                <MenuItem value={1}>Electronic devices</MenuItem>
                <MenuItem value={2}>Clothes</MenuItem>
                <MenuItem value={3}>Books</MenuItem>
                <MenuItem value={4}>CD</MenuItem>
                <MenuItem value={5}>Health Products</MenuItem>
              </SelectValidator>
            </Grid>

            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
            
            <Grid item xs={12} sm={12}>
              <p>After the submission. The page will redirect to your post.</p>
            </Grid>
            
          </Grid>
        </Container>
      </ValidatorForm>
    </div>
    :
    <div onLoad={handleFailed()}>
      <Container>
      <Typography variant="h6" gutterBottom>
            We cannot find your user information. Please log in first.
            The page will direct to Auction Home after 5 seconds.
      </Typography>
      </Container>
    </div>
  );

}
export default CreatePost;
