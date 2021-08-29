import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, TextInput, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import * as firebase from 'firebase';
import * as RootNavigation from '../../RootNavigation';
import * as  LoadPostsFunctions from './LoadPostsFunctions';
import { Touchable } from '../CommonFunctions';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const SearchScreen = ({ navigation }) => {
	const [seacrhBarRef, setSeacrhBarRef] = useState(null);
	const [allTagsforSearchPreview, setAllTagsforSearchPreview] = useState({});
	const [searchPreviewTag, setSearchPreviewTag] = useState([]);
	const [searchPreviewHeight, setSearchPreviewHeight] = useState(0);
	const [tagsForSearch, setTagsForSearch] = useState([]);
	const [searchResult, setSearchResult] = useState([]);
	const [noSearchResult, setNoSearchResult] = useState(null);
	const [savedPostsLikeObj, setSavedPostsLikeObj] = useState({});
	const [savedPostsLikeNumber, setSavedPostsLikeNumber] = useState({});
	useEffect(() => {
		getAllTags();
	}, []);
	const getAllTags = async () => {
		temp = {}
		await firebase.database().ref("tag-list/").orderByKey().once('value').then(async (snapshot) => {
			snapshot.forEach((childSnapshot) => {
				for (let i = childSnapshot.key.length; i > 0; i--) {
					let x = childSnapshot.key.slice(0, i);
					let temp2 = {};
					temp2[childSnapshot.key] = true;
					temp[x] = { ...temp[x], ...temp2 };
				}
			});
		}).catch(() => {
		});
		setAllTagsforSearchPreview(temp);
	}
	const searchTags = async (textArray) => {
		let processArray = textArray === null || textArray === undefined ? tagsForSearch : textArray
		let temp = []
		for (const y in processArray) {
			await firebase.database().ref("tags/" + processArray[y].toLowerCase()).orderByChild('createdAt').limitToFirst(8).once('value').then(async (snapshot) => {
				snapshot.forEach((childSnapshot) => {
					temp = [...temp, [snapshot.key, childSnapshot.key, childSnapshot.val()]];
				});
			}).catch(() => {
			});
		}
		let temp2 = [];
		for (let i = 0; i < temp.length; i++) {
			let tmp;
			await firebase.database().ref("post/" + temp[i][1]).once('value').then(async (snapshot) => {
				tmp = [snapshot.key, snapshot.val()];
			}).catch(() => {
			});
			let imageArray = [];
			if (tmp[1].hasOwnProperty("image_number")) {
				if (tmp[1].image_number > 0) {
					for (let j = 0; j < tmp[1].image_number; j++) {
						let img = ""
						await firebase.storage().ref().child("postsImages/" + tmp[1].post_owner_uid + "/" + tmp[0] + "/" + j.toString() + ".jpg").getDownloadURL().then((url) => {
							img = url
						}).catch(() => {
						});
						imageArray = (img === "" ? imageArray : [...imageArray, img])
					}
				}
				await firebase.storage().ref().child("user_profile_picture/" + tmp[1].post_owner_uid + "/user_profile_picture_60.jpg").getDownloadURL().then((url2) => {
					tmp[1].profile_picture = url2;
				}).catch(() => {
				});
			}
			temp2 = [...temp2, [...tmp, imageArray]];
			if (tmp[1].hasOwnProperty("like_id")) {
				let tempObj = {};
				tempObj[tmp[0]] = tmp[1]["like_id"];
				setSavedPostsLikeObj(prevState => ({ ...prevState, ...tempObj }));
			}
			let tempObj = {};
			tempObj[tmp[0]] = tmp[1]["number_of_like"];
			setSavedPostsLikeNumber(prevState => ({ ...prevState, ...tempObj }));
		}
		if (temp2.length === 0) {
			setNoSearchResult(true);
			setSearchResult([]);
		} else {
			setNoSearchResult(false);
			setSearchResult(temp2);
		}
	}
	const [loginStage, setloginStage] = useState(firebase.auth().currentUser ? true : false);
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			setloginStage(true);
		} else {
			setloginStage(false);
		}
	});
	const loadSearchPost = searchResult !== [] ? searchResult.map(
		(item, index, array) => {
			return (
				<View key={item[0]}>
					{LoadPostsFunctions.postContent(item, "search", savedPostsLikeObj, (key) => {
						if (savedPostsLikeObj.hasOwnProperty(key)) {
							if (savedPostsLikeObj[key].hasOwnProperty(firebase.auth().currentUser.uid)) {
								let flag = 0;
								for (const _ in savedPostsLikeObj[key]) {
									flag++;
									if (flag >= 2) {
										break;
									}
								}
								if (flag < 2) {
									delete savedPostsLikeObj[key];
									setSavedPostsLikeObj({ ...savedPostsLikeObj });
									let temp = {};
									temp[key] = savedPostsLikeNumber[key] - 1;
									setSavedPostsLikeNumber(prevState => ({ ...prevState, ...temp }));
								} else {
									delete savedPostsLikeObj[key][firebase.auth().currentUser.uid];
									setSavedPostsLikeObj({ ...savedPostsLikeObj });
									let temp = {};
									temp[key] = savedPostsLikeNumber[key] - 1;
									setSavedPostsLikeNumber(prevState => ({ ...prevState, ...temp }));
								}
							} else {
								let temp = {};
								temp[firebase.auth().currentUser.uid] = true;
								let bigTemp = {};
								bigTemp[key] = { ...savedPostsLikeObj[key], ...temp };
								setSavedPostsLikeObj({ ...savedPostsLikeObj, ...bigTemp });
								temp = {};
								temp[key] = savedPostsLikeNumber[key] + 1;
								setSavedPostsLikeNumber(prevState => ({ ...prevState, ...temp }));
							}
						} else {
							let temp = {};
							temp[firebase.auth().currentUser.uid] = true;
							let bigTemp = {};
							bigTemp[key] = temp;
							setSavedPostsLikeObj({ ...savedPostsLikeObj, ...bigTemp });
							temp = {};
							temp[key] = 1;
							setSavedPostsLikeNumber(prevState => ({ ...prevState, ...temp }));
						}
					}, savedPostsLikeNumber, loginStage)}
				</View>
			)
		}
	) : null
	return (
		<View style={{ marginTop: Constants.statusBarHeight, marginBottom: 54 }}>
			<View style={{ paddingLeft: 10, paddingBottom: 10, paddingTop: 10, justifyContent: "space-between", alignItems: 'center', borderBottomWidth: 1, borderColor: '#dfdfdf', flexDirection: "row", backgroundColor: "white" }}>
				<Touchable onPress={() => { navigation.goBack(); }}>
					<View style={{ width: 33, height: 33, justifyContent: 'center', alignItems: 'center', borderRadius: 30 }}>
						<Ionicons name="md-arrow-back" size={24} color="black" backgroundColor="white" />
					</View>
				</Touchable>
				<View style={{ width: Dimensions.get('window').width - 60, height: 40, alignItems: 'center', alignItems: 'stretch', borderRadius: 30, padding: 5, paddingLeft: 12, paddingRight: 12, paddingTop: 5, paddingBottom: 5, flexDirection: 'row', backgroundColor: '#e3e3e3', borderColor: '#8c8c8c', borderWidth: 0.1, marginRight: 10 }}>
					<TextInput style={{ flex: 9, textAlignVertical: "center", alignItems: 'flex-start', fontSize: 20 }}
						ref={ref => { setSeacrhBarRef(ref); }}
						onChangeText={async (newSearchKeywords) => {
							let temp = newSearchKeywords.match(/([^ ]*[a-zA-Z0-9]+[^ ]*)/g);
							if (tagsForSearch !== temp) {
								if (temp === null) {
									setNoSearchResult(null);
									setTagsForSearch([]);
									setSearchPreviewTag([]);
									setSearchPreviewHeight(0);
								} else {
									setNoSearchResult(null);
									setTagsForSearch(temp);
									setSearchPreviewTag(prevState => []);
									let flag = 1;
									for (const x in temp) {
										if (allTagsforSearchPreview.hasOwnProperty(temp[x].toLocaleLowerCase())) {
											for (const y in allTagsforSearchPreview[temp[x].toLocaleLowerCase()]) {
												setSearchPreviewTag(prevState => [...prevState, y]);
												setSearchPreviewHeight(flag * 35);
												flag = flag + 1;
											}
										}
									}
									if (flag === 1) {
										setSearchPreviewHeight(0);
									}
								}
							}
						}}
						onSubmitEditing={() => {
							if (tagsForSearch.length !== "") {
								searchTags();
								setSearchPreviewTag([]);
								setSearchPreviewHeight(0);
								seacrhBarRef.blur();
							}
						}}
						returnKeyType="search"
						placeholder="Search" />
					<Touchable onPress={() => {
						if (tagsForSearch.length !== "") {
							searchTags();
							setSearchPreviewTag([]);
							setSearchPreviewHeight(0);
							seacrhBarRef.blur();
						}
					}}>
						<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
							<FontAwesome name="search" size={24} color="black" />
						</View>
					</Touchable>
				</View>
			</View>
			{
				<View style={{ height: searchPreviewHeight, zIndex: 1999, }}>
					{
						searchPreviewTag.map((value, index) => {
							return (
								<Touchable key={index}
									onPress={() => {
										searchTags([value]);
										setSearchPreviewTag([]);
										setSearchPreviewHeight(0);
										seacrhBarRef.blur();
									}}>
									<View style={{ height: 35, zIndex: 1999, backgroundColor: 'white', borderColor: 'rgba(0,0,0,0.4)', borderBottomWidth: 0.4, paddingLeft: 60, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' }}>
										<Text style={{ fontSize: 18, textAlignVertical: 'center', color: 'rgba(0,0,0,0.75)' }}>
											{value}
										</Text>
										<View style={{ paddingLeft: 10, alignItems: 'center', justifyContent: 'center' }}>
											<FontAwesome name="search" style={{ fontSize: 14, textAlignVertical: 'center', color: 'rgba(0,0,0,0.6)' }} />
										</View>
									</View>
								</Touchable>
							)
						})
					}
				</View>
			}
			<View style={{ height: Dimensions.get('window').height - 61 - Constants.statusBarHeight, marginTop: -searchPreviewHeight }} >
				{
					searchResult.length === 0 && noSearchResult === null &&
					<View style={{ height: Dimensions.get('window').height - 101 - Constants.statusBarHeight, justifyContent: 'center', alignItems: 'center' }}>
						<Text style={{ fontSize: 22, }}>Please enter keywords to search!</Text>
					</View>
				}
				{
					noSearchResult === true &&
					<View style={{ height: Dimensions.get('window').height - 101 - Constants.statusBarHeight, justifyContent: 'center', alignItems: 'center', }}>
						<Text style={{ fontSize: 22, textAlign: 'center' }}>No result found!</Text>
						<Text style={{ fontSize: 22, textAlign: 'center' }}>Please enter another keyword to search!</Text>
					</View>
				}
				{
					searchResult.length !== 0 &&
					<ScrollView>
						{loadSearchPost}
					</ScrollView>
				}
			</View>
		</View>
	);
}
export default SearchScreen;