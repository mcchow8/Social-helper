import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TextInput, Dimensions } from 'react-native';
import { Form } from "native-base";
import * as firebase from 'firebase';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Setting a timer']);
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as RootNavigation from '../../RootNavigation';
import { Touchable, showToast, uploadImage, ShowComponentOrMessage } from '../CommonFunctions';
import * as ImageManipulator from 'expo-image-manipulator';
import { Picker } from 'react-native'
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

const PickImages = (prop) => {
	useEffect(() => {
		const asyncPhoto = async () => {
			if (prop.data.route.params !== undefined) {
				if (prop.data.route.params.len > 0) {
					let result = [];
					let i = 0;
					for (const key of Object.keys(prop.data.route.params.images)) {
						if (i < prop.data.route.params.len) {
							let h = 0;
							let w = 0;
							if (prop.data.route.params.images[key].height > 1280 || prop.data.route.params.images[key].width > 1280) {
								if (prop.data.route.params.images[key].height >= prop.data.route.params.images[key].width) {
									h = 1280;
									w = parseInt((prop.data.route.params.images[key].width * 1280) / prop.data.route.params.images[key].height);
								} else {
									w = 1280;
									h = parseInt((prop.data.route.params.images[key].height * 1280) / prop.data.route.params.images[key].width);
								}
							} else {
								h = await prop.data.route.params.images[key].height;
								w = await prop.data.route.params.images[key].width;
							}
							if (h == 0) {
								h = 1;
							}
							if (w == 0) {
								w = 1;
							}
							result = [...result, { ... await ImageManipulator.manipulateAsync(prop.data.route.params.images[key].uri, [{ resize: { width: w, height: h } }], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }), id: i }];
						}
						i++;
					}
					prop.setImgsCallback(result);
				}
			}
		}
		asyncPhoto()
	}, [prop.data.route.params]);
	const loadPickedImages = prop.imageArray.map((item) => {
		return (
			<Touchable key={item.id} title="Pick an image from camera roll" onPress={() => { RootNavigation.navigate("PhotosSelection") }} >
				<Image resizeMode="contain" source={{ uri: item.uri }} style={{ width: Dimensions.get('window').width / 3, height: Dimensions.get('window').width / 3, borderWidth: 1, borderColor: 'rgba(0,0,0,0.4)' }} />
			</Touchable>
		);
	});
	return (
		<ScrollView contentContainerStyle={{ justifyContent: 'flex-start', flexDirection: "row", flexWrap: "wrap" }} style={{}}>
			{loadPickedImages}
			<Touchable title="Pick an image from camera roll" onPress={() => { RootNavigation.navigate("PhotosSelection") }} >
				<View style={{ justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 3, height: Dimensions.get('window').width / 3, margins: 5, paddings: 5, borderWidth: 1, borderStyle: 'dashed', borderColor: '#bfbfbf', backgroundColor: 'white' }}>
					<Ionicons name="md-images" size={40} color="grey" />
					<Text style={{ color: 'grey', fontSize: 20, fontWeight: 'bold' }}>
						Add Images
					</Text>
				</View>
			</Touchable>
		</ScrollView>
	);
}

const writePost = async (postContent, imgs) => {
	let tagsArray = postContent.productName.match(/([^ ]*[a-zA-Z0-9]+[^ ]*)/g);
	let tagsWords = {};
	let updates = {};
	let newPostKey = await firebase.database().ref().child('post').push().key;
	imgs.forEach((img, index) => {
		uploadImage(img.uri, "postsImages/" + firebase.auth().currentUser.uid + "/" + newPostKey + "/" + index.toString() + ".jpg");
	});
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
		post_content: postContent.productDescription,
		product_name: postContent.productName,
		product_price: postContent.productPrice,
		product_category: postContent.productCategoryNumber,
		product_type: postContent.productType,
		post_location: "public",
		post_owner: firebase.auth().currentUser.displayName,
		number_of_like: 0,
		post_owner_uid: firebase.auth().currentUser.uid,
		image_number: imgs.length,
		createdAt: firebase.database.ServerValue.TIMESTAMP,
		tags: tagsWords,
	};
	updates['/post/' + newPostKey] = postData;
	updates['/user-post/' + firebase.auth().currentUser.uid + '/' + newPostKey] = postData;
	firebase.database().ref().update(updates).then(_ => {
		firebase.database().ref('/post/' + newPostKey).once('value').then(
			(snapshot) => {
				firebase.database().ref('/post/' + newPostKey).update({ createdAt: snapshot.val().createdAt * -1 })
				firebase.database().ref('/user-post/' + firebase.auth().currentUser.uid + '/' + newPostKey).update({ createdAt: snapshot.val().createdAt * -1 })
				if (snapshot.val().hasOwnProperty("tags")) {
					let newTag = {};
					let newUpdates = {}
					newTag[newPostKey] = { createdAt: snapshot.val().createdAt * -1 };
					for (let i = 0; i < tagsArray.length; i++) {
						newUpdates['/tags/' + tagsArray[i]] = newTag;
					}
					firebase.database().ref().update(newUpdates);
				}
			}
		);
	})
}

const Sell = (prop) => {
	const [postContent, setPostContent] = useState({ productDescription: "", productName: "", productPrice: "", productCategory: 0, productCategoryNumber: 0, productType: "", });
	const productCategoryVlaue = ['Please Select a Category', "Electronic devices", "Clothes", "Books", "CD", "Health products"];
	const [imgs, setImgs] = useState([]);
	return (
		<Form style={{ flex: 1 }}>
			<ScrollView>
				<Text style={{ fontSize: 18, marginLeft: 7, marginTop: 7 }}>Product Name:</Text>
				<TextInput style={{ width: Dimensions.get('window').width, height: 50, textAlignVertical: "top", alignItems: 'flex-start', borderColor: '#8c8c8c', borderWidth: 1, fontSize: 23, padding: 5 }} onChangeText={newProductName => { setPostContent({ ...postContent, productName: newProductName }); }} value={postContent.productName} placeholder="Product Name" />
				{/*<Label>Write something about the products or services you want to sell</Label>*/}
				<Text style={{ fontSize: 18, marginLeft: 7, marginTop: 7 }}>Description:</Text>
				<TextInput multiline numberOfLines={4} style={{ width: Dimensions.get('window').width, textAlignVertical: "top", alignItems: 'flex-start', borderColor: '#8c8c8c', borderWidth: 1, fontSize: 23, padding: 5 }} onChangeText={newDescription => setPostContent({ ...postContent, productDescription: newDescription })} placeholder="Write something about the products or services you want to sell!" value={postContent.productDescription} />
				<PickImages
					data={prop.data}
					setImgsCallback={(imgArray) => {
						setImgs(imgArray)
					}}
					imageArray={imgs}
				/>
				<Text style={{ fontSize: 18, marginLeft: 7, marginTop: 7 }}>Post Type:</Text>
				<View style={{ flexDirection: 'row' }}>
					<View style={{ marginLeft: 7 }} >
						<AntDesign.Button name="gift" size={24} color="black" backgroundColor={postContent.productType === 0 ? "cornflowerblue" : "white"} onPress={() => { setPostContent({ ...postContent, productType: 0 }) }} >
							Product
						</AntDesign.Button>
					</View>
					<View style={{ marginLeft: 10 }}>
						<FontAwesome5.Button name="hands-helping" size={24} color="black" backgroundColor={postContent.productType === 1 ? "cornflowerblue" : "white"} onPress={() => { setPostContent({ ...postContent, productType: 1 }) }}>
							Service
						</FontAwesome5.Button>
					</View>
				</View>
				<Text style={{ fontSize: 18, marginLeft: 7, marginTop: 7 }}>Price:</Text>
				<TextInput style={{ width: Dimensions.get('window').width, height: 50, textAlignVertical: "top", alignItems: 'flex-start', borderColor: '#8c8c8c', borderWidth: 1, fontSize: 23, padding: 5 }} onChangeText={newPrice => setPostContent({ ...postContent, productPrice: newPrice })} placeholder="Price" value={postContent.productPrice} keyboardType="decimal-pad" />
				<Text style={{ fontSize: 18, marginLeft: 7, marginTop: 7 }}>Category:</Text>
				<Picker
					style={{ height: 50, width: Dimensions.get('window').width, backgroundColor: 'white' }}
					mode={'dropdown'}
					onValueChange={(itemValue, itemPosition) => { setPostContent({ ...postContent, productCategory: itemValue, productCategoryNumber: itemPosition }) }}
					selectedValue={postContent.productCategory}
				>
					{productCategoryVlaue
						.filter((value, index) => postContent.productCategory === 0 ? value : index === 0 ? false : value)
						.map((value, index) => (
							<Picker.Item label={value} value={value} key={index} />
						))
					}
				</Picker>
			</ScrollView>
			<View style={{ width: 90, alignSelf: 'center', marginTop: 7 }}>
				<Feather.Button name="send" style={{ alignSelf: 'center' }} onPress={async () => {
					if (postContent.productName === "") {
						showToast("Please enter the product name!", "warning");
					} else if (postContent.productDescription === "") {
						showToast("Please enter the product description!", "warning");
					} else if (imgs.length === 0) {
						showToast("Please select at least one photo!", "warning");
					} else if (postContent.productType === "") {
						showToast("Please select the type!", "warning");
					} else if (postContent.productPrice === "") {
						showToast("Please enter the price!", "warning");
					} if (postContent.productPrice < 0) {
						showToast("The price should higher than or equal to zero!", "warning");
					} else if (postContent.productCategory === 0) {
						showToast("Please select the category!", "warning");
					} else {
						await writePost(postContent, imgs);
						setPostContent({ productDescription: "", productName: "", productPrice: "", productCategory: 0, productType: "", productCategoryNumber: 0 });
						showToast("Posted!", "success");
						setImgs([])
					}
				}} >
					Post
				</Feather.Button>
			</View>
		</Form>
	)
}

const SellScreen = (prop) => {
	return (
		<ShowComponentOrMessage message="Please login to post.">
			<View style={{ flex: 1, marginTop: Constants.statusBarHeight }}>
				<Sell data={prop} />
			</View>
		</ShowComponentOrMessage>
	)
}
export default SellScreen;