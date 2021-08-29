import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import * as firebase from 'firebase';
import * as RootNavigation from '../../RootNavigation';
import { TouchableOrView, timeStampToString, ignoreYellowBox } from '../CommonFunctions';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const showMessage = (message, loc) => {
	return (
		<View style={{ marginTop: (message === "loadingAllPostsAtExploreScreen" ? 250 : (message === "loadingMorePosts" ? 0 : 100)), justifyContent: 'center', alignSelf: 'center', height: 130 }} >
			{
				(message === "loadingAllPostsAtExploreScreen" || message === "loadingAllPostsAtPersonalScreen" || message === "loadingMorePosts") && (
					<Image source={require('../../assets/Loading.gif')} style={{ alignSelf: 'center' }} />
				)
			}
			{
				(message === "loadingAllPostsAtExploreScreen" || message === "loadingAllPostsAtPersonalScreen" || message === "loadingMorePosts") && (
					<Text style={{ fontSize: 25, alignSelf: 'center' }}>
						Loading...
					</Text>
				)
			}
			{
				message === "noPost" && loc === "mySelf" && (
					<>
						<Text style={{ fontSize: 25, textAlign: 'center' }}>
							There are no posts yet.
						</Text>
						<Text style={{ fontSize: 25, textAlign: 'center' }}>
							Try to post one?
						</Text>
					</>
				)
			}
			{
				message === "noPost" && loc === "otherUser" && (
					<>
						<Text style={{ fontSize: 25, textAlign: 'center' }}>
							This user did not post anything yet.
						</Text>
					</>
				)
			}
		</View>
	)
};

export const loadPersonalData = (prop) => {
	const [personalData, setPersonalData] = useState(undefined);
	const [loading, setLoading] = useState(false);
	const getPersonalData = async () => {
		if (loading === false) {
			setLoading(true)
			await firebase.database().ref("user/" + prop.link).on('value', (snapshot) => {
				if (snapshot.val().hasOwnProperty("profile_picture")) {
					firebase.storage().ref().child("user_profile_picture/" + prop.link + "/user_profile_picture_200.jpg").getDownloadURL().then((url) => {
						setPersonalData({ ...snapshot.val(), profile_picture: url })
					}).catch(() => {
					});
				} else {
					setPersonalData(snapshot.val());
				}
			});

			setLoading(false)
		}
	}
	useEffect(() => {
		getPersonalData()
	}, []);
	const loadPersonalProfile = () => {
		return (
			<TouchableOrView bool={firebase.auth().currentUser && firebase.auth().currentUser.uid === prop.link} onPress={() => { RootNavigation.navigate('EditUserInfoScreen') }} style={{ flex: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: "white", borderBottomWidth: 1, borderColor: '#dfdfdf' }}>
				<View style={{ flex: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: "white", borderBottomWidth: 1, borderColor: '#dfdfdf' }}>
					<View style={{ flex: 4 }}>
						<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
							<Image source={personalData && personalData.hasOwnProperty("profile_picture") && (typeof (personalData.profile_picture) !== "number") ? { uri: personalData.profile_picture } : require('../../assets/UserProPic.jpg')} style={{ height: 110, width: 110, borderRadius: 500 }} />
						</View>
					</View>
					<View style={{ flex: 8 }}>
						<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', paddingLeft: 10 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<View style={styles.personalDataIcon}>
									<AntDesign name="user" size={18} color="white" />
								</View>
								<Text style={styles.personalDataName}>
									{personalData !== undefined && (personalData.username.userdata)}
								</Text>
							</View>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<View style={styles.personalDataIcon}>
									{personalData !== undefined && personalData.sex.userdata === "M" ? <Ionicons name="md-male" size={18} color="white" /> : <Ionicons name="md-female" size={18} color="white" />}
								</View>
								<Text style={styles.personalDataSex}>
									{personalData !== undefined && personalData.sex.userdata === "M" ? "Male" : "Female"}
								</Text>
							</View>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<View style={styles.personalDataIcon}>
									<MaterialIcons name="description" size={18} color="white" />
								</View>
								<Text style={styles.personalDataSelfDescription}>
									{personalData !== undefined && personalData.self_description.userdata}
								</Text>
							</View>
						</View>
					</View>
					{
						firebase.auth().currentUser && firebase.auth().currentUser.uid === prop.link &&
						<View style={{ position: 'absolute', bottom: 10, right: 10 }}>
							<AntDesign name="edit" size={16} color="black" />
						</View>
					}
				</View>
			</TouchableOrView>
		)
	};
	return (
		<View style={{ flex: 1 }}>
			{!loading && personalData !== undefined && loadPersonalProfile()}
		</View>
	);
}

const likeFucntion = (commentOrPost, postKey, postOwnerUid, commentKey) => {
	let uid = firebase.auth().currentUser.uid;
	firebase.database().ref().child('post/' + postKey + ("comment" === commentOrPost ? ("/comments/" + commentKey) : "")).transaction((post) => {
		if (post) {
			if (post.like_id && post.like_id[uid]) {
				post.number_of_like--;
				post.like_id[uid] = null;
			} else {
				post.number_of_like++;
				if (!post.like_id) {
					post.like_id = {};
				}
				post.like_id[uid] = true;
			}
		}
		return post;
	});
	if ("" !== postOwnerUid) {
		firebase.database().ref().child('/user-post/' + postOwnerUid + '/' + postKey + ("comment" === commentOrPost ? ("/comments/" + commentKey) : "")).transaction((post) => {
			if (post) {
				if (post.like_id && post.like_id[uid]) {
					post.number_of_like--;
					post.like_id[uid] = null;
				} else {
					post.number_of_like++;
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


export const postContent = (item, loc, likeObj, callback, likeNo, loginStage) => {
	const categoryList = ["Electronic devices", "Clothes", "Books", "CD", "Health products"];
	const loadImage = item[2] !== undefined && item[2].length >= 1 ?
		item[2].map(
			(value, index) => {
				return (
					<View key={item[0] + index.toString()} style={{ width: Dimensions.get('window').width, height: 300 }}>
						<Image source={{ uri: value }} style={{
							flex: 1, height: undefined, width: undefined, resizeMode: 'contain'
						}} />
					</View>
				)
			}
		) : null
	return (
		<View style={{ margin: 1, height: 'auto', backgroundColor: 'white', borderColor: '#cfcfcf', borderWidth: 0.5 }}>
			<TouchableOrView
				bool={item[1].hasOwnProperty("post_owner_uid") && loc !== "otherUser" && loc !== "mySelf"}
				onPress={() => {
					firebase.auth().currentUser === null || (firebase.auth().currentUser !== null && item[1].post_owner_uid !== firebase.auth().currentUser.uid)
						? RootNavigation.navigate("OtherUsers", item[1].post_owner_uid)
						: RootNavigation.navigate("Myself")
				}}
			>
				<View style={{ paddingLeft: 5, paddingTop: 8, paddingBottom: 8, flexDirection: "row", flex: 1 }}>
					<Image source={item[1].hasOwnProperty("profile_picture") ? { uri: item[1].profile_picture } : require('../../assets/UserProPic.jpg')} style={{ height: 50, width: 50, borderRadius: 50 }} />
					<View style={{ marginLeft: 10, flexDirection: "column", justifyContent: "center" }}>
						<Text style={{ fontSize: 20 }}>
							{item[1].post_owner}
						</Text>
						<Text style={{ fontSize: 13, color: 'grey' }}>
							{timeStampToString(-item[1].createdAt)}
						</Text>
					</View>
				</View>
			</TouchableOrView>
			<TouchableOrView bool={loc !== "LoadPostAndComments"} onPress={() => { RootNavigation.navigate("LoadPostAndComments", [item]) }}>
				<View>
					<View style={{ alignItems: 'center', justifyContent: 'center', }}>
						{
							item[1].hasOwnProperty("product_name")
								?
								<View style={styles.postPorpertiesItemViewName}>
									<Text style={styles.postPorpertiesItem}>
										{item[1].product_name}
									</Text>
								</View>
								:
								null
						}
						<View style={{ flexDirection: "row" }}>
							{
								item[1].hasOwnProperty("product_price")
									?
									<View style={styles.postPorpertiesItemView}>
										<Text style={styles.postPorpertiesItem}>
											${item[1].product_price}
										</Text>

									</View>
									:
									null
							}
							{
								item[1].hasOwnProperty("product_type")
									?
									<View style={styles.postPorpertiesItemView}>
										<Text style={styles.postPorpertiesItem}>

											{item[1].product_type === 0 ? "Product" : "Service"}
										</Text>

									</View>
									:
									null
							}
							{
								item[1].hasOwnProperty("product_category")
									?
									<View style={styles.postPorpertiesItemView}>
										<Text style={styles.postPorpertiesItem}>
											{categoryList[item[1].product_category-1]}
										</Text>
									</View>
									:
									null
							}
						</View>
					</View>
					<Text style={{ marginLeft: 10, marginRight: 10, marginBottom: 10, fontSize: 20 }}>
						{item[1].post_content}
					</Text>
					{item[2] !== undefined ? loadImage : null}
				</View>
			</TouchableOrView>
			<View style={{ borderTopWidth: 0.4, borderColor: 'rgb(209, 209, 209)', flexDirection: "row", flex: 3 }}>
				<View style={{ flex: 1 }}>
					<TouchableOrView
						bool={firebase.auth().currentUser}
						onPress={() => {
							likeFucntion("post", item[0], (item[1].hasOwnProperty("post_owner_uid") ? item[1].post_owner_uid : ""), ""); callback(item[0])
						}}
					>
						<View style={{ paddingBottom: 10, paddingTop: 6, flexDirection: "row", justifyContent: 'center', alignItems: 'center' }}>
							{
								likeObj.hasOwnProperty(item[0]) && firebase.auth().currentUser !== null
									? (
										likeObj[item[0]].hasOwnProperty(firebase.auth().currentUser.uid)
											?
											<>
												<AntDesign name="like1" size={18} color="black" style={{ marginTop: 3, marginRight: 5 }} />
												<Text style={{ fontSize: 16 }}>
													Like
												</Text>
											</>
											:
											<>
												<AntDesign name="like2" size={18} color="black" style={{ marginTop: 2, marginRight: 5 }} />
												<Text style={{ fontSize: 16 }}>
													Like
												</Text>
											</>
									)
									:
									<>
										<AntDesign name="like2" size={18} color="black" style={{ marginTop: 2, marginRight: 5 }} />
										<Text style={{ fontSize: 16 }}>
											Like
										</Text>
									</>
							}
							<Text style={{ fontSize: 16 }}> ( {likeNo[item[0]]} )</Text>
						</View>
					</TouchableOrView>
				</View>
				<View style={{ flex: 1 }}>
					<TouchableOrView bool={loc !== "LoadPostAndComments"} onPress={() => { RootNavigation.navigate("LoadPostAndComments", [item]) }}>
						<View style={{ paddingBottom: 10, paddingTop: 6, flexDirection: "row", justifyContent: 'center', alignItems: 'center', flex: 1 }} >
							<MaterialCommunityIcons name={loc !== "LoadPostAndComments" ? "comment-text-multiple-outline" : "comment-text-multiple"} size={19} color="black" style={{ marginRight: 5, marginTop: 2 }} />
							<Text style={{ textAlign: 'center', fontSize: 16 }}>
								Comment
						</Text>
						</View>
					</TouchableOrView>
				</View>
				{
					((!loginStage) || (loginStage && item[1].hasOwnProperty("post_owner_uid") && item[1].post_owner_uid !== firebase.auth().currentUser.uid)) &&
					<View style={{ flex: 1 }}>
						<TouchableOrView bool={loginStage && item[1].hasOwnProperty("post_owner_uid")}
							onPress={() => {
								RootNavigation.navigate("ChatScreen", [item[1]['post_owner_uid'], item[1].post_owner]);
							}}
						>
							<View style={{ paddingBottom: 10, paddingTop: 6, flexDirection: "row", justifyContent: 'center', alignItems: 'center', flex: 1 }} >
								<MaterialCommunityIcons name="message-outline" size={18} color="black" style={{ marginRight: 5, marginTop: 2 }} />
								<Text style={{ textAlign: 'center', fontSize: 16 }}>
									Chat
									</Text>
							</View>
						</TouchableOrView>
					</View>
				}
			</View>
		</View>
	)
}

export const loadPost = (prop) => {
	ignoreYellowBox();
	const [savedPosts, setSavedPosts] = useState([]);
	const [savedPostsLikeObj, setSavedPostsLikeObj] = useState({});
	const [savedPostsLikeNumber, setSavedPostsLikeNumber] = useState({});
	const [loading, setLoading] = useState(false);
	const [lastPostCreatedAt, setLastPostCreatedAt] = useState("");
	const [runOnce, setRunOnce] = useState(false);
	const loadNewPost = async (firstCreatedAt) => {
		firebase.database().ref(prop.link).orderByChild("createdAt").endAt(firstCreatedAt).on('child_added',
			async (snapshot) => {
				if (snapshot.val().createdAt !== firstCreatedAt) {
					let childList = [snapshot.key, snapshot.val()];
					let tempImageList = [];
					let postToDo = childList[1];
					if (postToDo.hasOwnProperty("image_number")) {
						if (postToDo.image_number > 0) {
							for (let j = 0; j < postToDo.image_number; j++) {
								let img = ""
								await firebase.storage().ref().child("postsImages/" + postToDo.post_owner_uid + "/" + childList[0] + "/" + j.toString() + ".jpg").getDownloadURL().then((url) => {
									img = url
								}).catch(() => {
								});
								tempImageList = (img === "" ? tempImageList : [...tempImageList, img])
							}
						}
						await firebase.storage().ref().child("user_profile_picture/" + postToDo.post_owner_uid + "/user_profile_picture_60.jpg").getDownloadURL().then((url2) => {
							postToDo.profile_picture = url2;
						}).catch(() => {
						});
					}
					setSavedPosts(prevState => [[childList[0], postToDo, tempImageList], ...prevState])
					if (!savedPostsLikeNumber.hasOwnProperty(childList[0])) {
						firebase.database().ref("post/" + childList[0] + "/").on('value', async (snapshot) => {
							let temp = {}
							if (snapshot.val().hasOwnProperty("like_id")) {
								temp[childList[0]] = snapshot.val()["like_id"]
							}
							//console.log("temp", temp)
							setSavedPostsLikeObj(prevState => ({ ...prevState, ...temp }));
						})
						firebase.database().ref("post/" + childList[0] + "/number_of_like").on('value', async (snapshot) => {
							let temp = {}
							temp[childList[0]] = snapshot.val()
							setSavedPostsLikeNumber(prevState => ({ ...prevState, ...temp }));
						})
					}
				}
			}
		);
	}
	const loadMorePost = async () => {
		if (loading === false) {
			setLoading(true)
			await firebase.database().ref(prop.link).orderByChild("createdAt").startAt(lastPostCreatedAt === "" ? null : lastPostCreatedAt).limitToFirst(8).once('value',
				async (snapshot) => {
					let childList = []
					let i = 0;
					let end = 0;
					await snapshot.forEach((childSnapshot) => {
						end = i;
						if (i === 0 && lastPostCreatedAt === "") {
							loadNewPost(childSnapshot.val().createdAt)
						}
						childList = [...childList, [childSnapshot.key, childSnapshot.val()]];
						i++;
					});
					if (i > 0) {
						setLastPostCreatedAt(childList[end][1].createdAt)
					}
					if (end > 0) {
						for (i = 0; i <= end; i++) {
							let postToDo = childList[i][1];
							if (i !== 7) {
								let tempImageList = [];
								if (postToDo.hasOwnProperty("image_number")) {
									if (postToDo.image_number > 0) {
										for (let j = 0; j < postToDo.image_number; j++) {
											let imgUrl = ""
											await firebase.storage().ref().child("postsImages/" + postToDo.post_owner_uid + "/" + childList[i][0] + "/" + j.toString() + ".jpg").getDownloadURL().then((url) => {
												imgUrl = url;
											}).catch(() => {
											});
											tempImageList = imgUrl === "" ? tempImageList : [...tempImageList, imgUrl]
										}
									}
								}
								if (postToDo.hasOwnProperty("post_owner_uid")) {
									await firebase.storage().ref().child("user_profile_picture/" + postToDo.post_owner_uid + "/user_profile_picture_60.jpg").getDownloadURL().then((url2) => {
										postToDo.profile_picture = url2;
									}).catch(() => {
									});
								}
								if (postToDo.hasOwnProperty("post_owner_uid")) {
									await firebase.database().ref("user/" + postToDo.post_owner_uid).once('value',
										(snapshot2) => {
											if (snapshot2.val().username.userdata !== postToDo.post_owner) {
												postToDo.post_owner = snapshot2.val().username.userdata;
											}
										}
									);
								}
								setSavedPosts(prevState => [...prevState, [childList[i][0], postToDo, tempImageList]])
								if (!savedPostsLikeNumber.hasOwnProperty(childList[i][0])) {
									firebase.database().ref("post/" + childList[i][0] + "/").on('value', async (snapshot) => {
										let temp = {}
										if (snapshot.val().hasOwnProperty("like_id")) {
											temp[snapshot.key] = snapshot.val()["like_id"]
										}
										setSavedPostsLikeObj(prevState => ({ ...prevState, ...temp }));
									})
									firebase.database().ref("post/" + childList[i][0] + "/number_of_like").on('value', async (snapshot) => {
										let temp = {}
										temp[snapshot.ref.parent.key] = snapshot.val()
										setSavedPostsLikeNumber(prevState => ({ ...prevState, ...temp }));
									})
								}
							}
						}
					}
				});
			setLoading(false)
		}
	}
	useEffect(() => {
		if (runOnce == false) {
			let load = async () => {
				await loadMorePost()
			}
			load()
			setRunOnce(true)
		}
	}, [runOnce]);
	const [loginStage, setloginStage] = useState(firebase.auth().currentUser ? true : false);
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			setloginStage(true);
		} else {
			setloginStage(false);
		}
	});
	const loadselfPost = savedPosts !== [] ? savedPosts.map(
		(item, index, array) => {
			return (
				<View key={item[0]}>
					{postContent(item, prop.loc, savedPostsLikeObj, () => { }, savedPostsLikeNumber, loginStage)}
				</View>
			)
		}
	) : null
	return (
		<ScrollView style={{ flex: 1 }} onScroll={
			async (e) => {
				let paddingToBottom = 10;
				paddingToBottom += e.nativeEvent.layoutMeasurement.height;
				if (!loading && e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom) {
					await loadMorePost()
				}
			}
		}>
			{savedPosts && loadselfPost}
			{!loading && savedPosts.length === 0 && showMessage('noPost', prop.loc)}
			{loading && savedPosts.length === 0 && showMessage(prop.link === "/post/" ? 'loadingAllPostsAtExploreScreen' : 'loadingAllPostsAtPersonalScreen', "")}
			{loading && savedPosts.length > 0 && showMessage('loadingMorePosts', "")}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	postPorpertiesItem: {
		textAlign: 'center',
	},
	postPorpertiesItemViewName: {
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 5,
		marginRight: 5,
		marginBottom: 5,
		width: Dimensions.get('window').width / 1.07,
		height: 40,
		borderColor: 'grey',
		borderRadius: 40,
		borderWidth: 0.5
	},
	postPorpertiesItemView: {
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 5,
		marginRight: 5,
		width: Dimensions.get('window').width / 3.4,
		height: 40,
		borderColor: 'grey',
		borderRadius: 40,
		borderWidth: 0.5
	},
	personalDataSelfDescription: {
		fontSize: 20
	},
	personalDataSex: {
		fontSize: 18
	},
	personalDataName: {
		fontSize: 22
	},
	personalDataIcon: {
		backgroundColor: 'darkgrey',
		width: 18,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 5,
		marginRight: 5
	},
});
