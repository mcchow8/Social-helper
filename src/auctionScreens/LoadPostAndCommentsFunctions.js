import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TextInput, Dimensions } from 'react-native';
import { postContent } from './LoadPostsFunctions';
import { Form } from "native-base";
import * as firebase from 'firebase';
import { Touchable, timeStampToString, ignoreYellowBox } from '../CommonFunctions';
import * as RootNavigation from '../../RootNavigation';
import { FontAwesome } from '@expo/vector-icons';

const commentForm = (postKey) => {
	const writeComment = (commentContent, postKey) => {
		let commentData = {
			comment_content: commentContent,
			comment_location: "public",
			comment_owner: firebase.auth().currentUser.displayName,
			number_of_like: 0,
			comment_owner_uid: firebase.auth().currentUser.uid,
			createdAt: firebase.database.ServerValue.TIMESTAMP
		};
		let newCommentKey = firebase.database().ref().child('comments/' + postKey + "/").push().key;
		let updates = {};
		updates['comments/' + postKey + "/" + newCommentKey] = commentData;
		firebase.database().ref().update(updates).then(_ => {
			firebase.database().ref('comments/' + postKey + "/" + newCommentKey).once('value').then(
				(snapshot) => {
					firebase.database().ref('comments/' + postKey + "/" + newCommentKey).update({ createdAt: snapshot.val().createdAt * -1 })
				}
			);
		})
	}
	const [commentContent, setCommentContent] = useState("");
	return (
		<View style={{ width: Dimensions.get('window').width, borderColor: 'lightgrey', borderTopWidth: 1, backgroundColor: 'white', padding: 5 }}>
			<Form>
				<View style={{ alignItems: 'center', alignItems: 'stretch', borderRadius: 15, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5, flexDirection: 'row', backgroundColor: 'whitesmoke' }}>
					<TextInput multiline style={{ flex: 9, textAlignVertical: "top", fontSize: 23 }} onChangeText={commentContent => setCommentContent(commentContent)} placeholder="Type to comment..." value={commentContent} />
					<Touchable useForeground={true} onPress={() => { writeComment(commentContent, postKey); setCommentContent(""); }}>
						<View style={{ alignItems: 'center', justifyContent: 'center', overflow: 'hidden', height: 33, width: 33, borderRadius: 50 }}>
							<FontAwesome name="send" size={20} color="black" />
						</View>
					</Touchable>
				</View>
			</Form>
		</View>
	)
}
const LoadPostAndComments = (prop) => {
	ignoreYellowBox();
	const [postComment, setPostComment] = useState([]);
	const [savedPostsLikeObj, setSavedPostsLikeObj] = useState({});
	const [savedPostsLikeNumber, setSavedPostsLikeNumber] = useState(0);
	const getComments = async () => {
		firebase.database().ref("comments/" + prop.route.params[0][0] + "/").on('value', async (snapshot) => {
			let snapshotArray = [];
			snapshot.forEach((childSnapshot) => {
				snapshotArray = [...snapshotArray, [childSnapshot.key, childSnapshot.val()]]
			});
			for (let i = 0; i < snapshotArray.length; i++) {
				await firebase.storage().ref().child("user_profile_picture/" + snapshotArray[i][1].comment_owner_uid + "/user_profile_picture_60.jpg").getDownloadURL().then((url2) => {
					snapshotArray[i][1].profile_picture = url2;
				}).catch(() => {
				});
			}
			setPostComment(snapshotArray);
		});
	}
	useEffect(() => {
		getComments();
		const handle1 = (snapshot) => {
			let temp = {}
			if (snapshot.val().hasOwnProperty("like_id")) {
				temp[prop.route.params[0][0]] = snapshot.val()["like_id"]
			}
			setSavedPostsLikeObj(temp)
		}
		const handle2 = (snapshot) => {
			let temp = {}
			temp[prop.route.params[0][0]] = snapshot.val()
			setSavedPostsLikeNumber(temp)
		}
		firebase.database().ref("post/" + prop.route.params[0][0] + "/").on('value', handle1)
		firebase.database().ref("post/" + prop.route.params[0][0] + "/number_of_like").on('value', handle2)
		return () => {
			firebase.database().ref("post/" + prop.route.params[0][0] + "/").off('value', handle1)
			firebase.database().ref("post/" + prop.route.params[0][0] + "/number_of_like").off('value', handle2)
		}
	}, []);
	const loadComments = postComment.map((item, index, array) => {
		return (
			<View key={item[0]} style={{ margin: 1, height: 'auto', backgroundColor: 'white', borderColor: '#cfcfcf', borderWidth: 0.5, flexDirection: "row" }}>
				<Touchable onPress={() => { { firebase.auth().currentUser && item[1].comment_owner_uid === firebase.auth().currentUser.uid ? RootNavigation.navigate("Myself") : RootNavigation.navigate("OtherUsers", item[1].comment_owner_uid) } }}>
					<View>
						<Image source={item[1].hasOwnProperty("profile_picture") ? { uri: item[1].profile_picture } : require('../../assets/UserProPic.jpg')} style={{ marginLeft: 5, marginTop: 10, marginRight: 5, height: 40, width: 40, borderRadius: 50 }} />
					</View >
				</Touchable>
				<View style={{ marginTop: 5, flex: 1 }}>
					<View style={{ flexDirection: "column", marginRight: 10, justifyContent: "center", backgroundColor: 'whitesmoke', borderRadius: 15 }}>
						<Touchable onPress={() => { firebase.auth().currentUser && item[1].comment_owner_uid === firebase.auth().currentUser.uid ? RootNavigation.navigate("Myself") : RootNavigation.navigate("OtherUsers", item[1].comment_owner_uid) }}>
							<View>
								<Text style={{ marginRight: 10, marginLeft: 10, fontSize: 16, fontWeight: 'bold' }}>
									{item[1].comment_owner}
								</Text>
							</View>
						</Touchable>
						<Text style={{ marginRight: 10, marginLeft: 10, marginBottom: 10, fontSize: 16 }}>
							{item[1].comment_content}
						</Text>
					</View>
					<View>
						<Text style={{ fontSize: 14, color: 'grey' }}>
							{timeStampToString(-item[1].createdAt)}
						</Text>
					</View>
				</View>
			</View>
		)
	})
	const [loginStage, setloginStage] = useState(firebase.auth().currentUser ? true : false);
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			setloginStage(true);
		} else {
			setloginStage(false);
		}
	});
	return (
		<View style={{ flex: 1 }}>
			<ScrollView>
				{postContent(prop.route.params[0], "LoadPostAndComments", savedPostsLikeObj, () => { }, savedPostsLikeNumber, loginStage)}
				{loadComments}
			</ScrollView>
			{firebase.auth().currentUser && commentForm(prop.route.params[0][0])}
		</View>
	);
}

export default LoadPostAndComments;