import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TextInput, Dimensions, Platform } from 'react-native';
import { Form, Button, } from "native-base";
import * as firebase from 'firebase';
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Setting a timer']);
import { Ionicons } from '@expo/vector-icons';
import * as RootNavigation from '../RootNavigation';
import { Touchable, showToast, uploadImage, CustomModal } from './CommonFunctions';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const editUserInfo = async (attribute, newUserinfo) => {
	let newObject = {}
	if (attribute === "username") {
		newObject = { username: { privacy: false, userdata: newUserinfo } }
	} else if (attribute === "selfDescription") {
		newObject = { self_description: { privacy: false, userdata: newUserinfo } }
	} else if (attribute === "sex") {
		newObject = { sex: { privacy: false, userdata: newUserinfo } }
	} else if (attribute === "profilePic") {
		newObject = { profile_picture: firebase.database.ServerValue.TIMESTAMP };
	}

	firebase.database().ref('user/' + firebase.auth().currentUser.uid).update(newObject).then(
		() => {
			if (attribute === "username") {
				firebase.auth().currentUser.updateProfile({
					displayName: newUserinfo,
				}).then(() => {
					showToast('User information update successfully!', "success");
				}).catch((error) => {
					showToast('Error while updating User Profile!', "warning");
					console.log(error);
				})
			} else {
				showToast('User information update successfully!', "success");
			}
		}
	).catch(
		(error) => {
			showToast('Error while updating User information!', "warning");
			console.log(error);
		}
	);
}

const EditForm = () => {
	const [newUserinfo, setNewUserinfo] = useState("");
	const [personalData, setPersonalData] = useState(undefined);
	const [modalVisible, setModalVisible] = useState([false, false, false]);
	const [proPicModalVisible, setProPicModalVisible] = useState(false);
	const [proPic, setProPic] = useState(undefined);
	const getPersonalData = async () => {
		await firebase.database().ref("user/" + firebase.auth().currentUser.uid).on('value', (snapshot) => {
			if (snapshot.val().hasOwnProperty("profile_picture")) {
				firebase.storage().ref().child("user_profile_picture/" + firebase.auth().currentUser.uid + "/user_profile_picture_400.jpg").getDownloadURL().then((url) => {
					setPersonalData({ ...snapshot.val(), profile_picture: url })
				}).catch(() => {
				});
			} else {
				setPersonalData(snapshot.val());
			}
		});
	}
	useEffect(() => {
		getPersonalData()
	}, []);
	useEffect(() => {
		(async () => {
			if (Platform.OS !== 'web') {
				const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
				if (status !== 'granted') {
					alert('Sorry, we need camera roll permissions to make this work!');
				}
			}
		})();
	}, []);
	const itemAndModal = (texts, val, i, attribute) => {
		return (
			<View >
				<View style={styles.types}>
					<View style={styles.personalDataIcon}>
						{
							texts === "Username" ?
								<AntDesign name="user" size={18} color="white" /> :
								texts === "Sex" ?
									<MaterialCommunityIcons name="human-male-female" size={18} color="white" /> :
									<MaterialIcons name="description" size={18} color="white" />
						}
					</View>
					<Text style={styles.typesTexts}>{texts}:</Text>
				</View>
				<View style={styles.values}>
					<Touchable
						onPress={() => { setModalVisible([i === 0 ? true : false, i === 1 ? true : false, i === 2 ? true : false]); }}
					>
						<View style={{ flex: 1 }}>
							<Text style={styles.valuesTexts}>
								{personalData !== undefined && (texts !== "Sex" ? val : (val === "M" ? "Male" : "Female"))}
							</Text>
							<View style={{ position: 'absolute', top: 8, right: 10 }}>
								<AntDesign name="edit" size={18} color="black" />
							</View>
						</View>
					</Touchable>
				</View>
				<CustomModal modalDisplay={modalVisible[i]} onRequestClose={() => { setNewUserinfo(""); setModalVisible([false, false, false]); }} >
					<View style={{ alignItems: 'center' }}>
						<View style={styles.types}>
							<View style={styles.personalDataIcon}>
								{
									texts === "Username" ?
										<AntDesign name="user" size={18} color="white" /> :
										texts === "Sex" ?
											<MaterialCommunityIcons name="human-male-female" size={18} color="white" /> :
											<MaterialIcons name="description" size={18} color="white" />
								}
							</View>
							<Text style={styles.typesTexts}>{texts}:</Text>
						</View>
						{texts === "Sex" ?
							<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
								<Touchable
									useForeground={true}
									onPress={() => setNewUserinfo('F')}
								>
									<View
										style={{ overflow: 'hidden', flexDirection: 'row', justifyContent: 'space-around', paddingLeft: 10, paddingRight: 10, backgroundColor: ((personalData.sex.userdata === 'F' && newUserinfo === "") || newUserinfo === "F" ? 'dodgerblue' : 'grey'), borderRadius: 20, alignItems: 'center', width: 100, height: 38 }}
									>
										<Ionicons name="md-female" size={17} color="white" />
										<Text style={{ color: 'white', fontSize: 16 }}>Female</Text>
									</View>
								</Touchable>
								<Touchable
									useForeground={true} onPress={() => setNewUserinfo('M')}>
									<View style={{ overflow: 'hidden', flexDirection: 'row', justifyContent: 'space-around', marginLeft: 40, paddingLeft: 10, paddingRight: 10, backgroundColor: ((personalData.sex.userdata === 'M' && newUserinfo === '') || newUserinfo === "M" ? 'dodgerblue' : 'grey'), borderRadius: 20, alignItems: 'center', width: 100, height: 38 }}>
										<Ionicons name="md-male" size={17} color="white" />
										<Text style={{ color: 'white', fontSize: 16 }}>Male</Text>
									</View>
								</Touchable>
							</View>
							:
							<TextInput style={styles.inputBox} onChangeText={newVal => setNewUserinfo(newVal)} placeholder={personalData !== undefined ? (val + " (Edit to change)") : "Not filled"} onSubmitEditing={async () => {
								if (attribute === "selfDescription") {
									if (newUserinfo === "" || newUserinfo.split(" ").join("") === "") {
										showToast("Please enter your self description!", "warning", 'Try again');
									} else if (newUserinfo.length > 60) {
										showToast("Self description should be within 60 words!", "warning", 'Try again');
									} else {
										await editUserInfo(attribute, newUserinfo);
										await setNewUserinfo("");
										setModalVisible([false, false, false]);
									}
								}
								if (attribute === "username") {
									if (newUserinfo === "" || newUserinfo.split(" ").join("") === "") {
										showToast("Please enter your username!", "warning", 'Try again');
									} else if (newUserinfo.length > 20) {
										showToast("Your username should be within 20 words!", "warning", 'Try again');
									} else {
										await editUserInfo(attribute, newUserinfo);
										await setNewUserinfo("");
										setModalVisible([false, false, false]);
									}
								}
							}} />
						}
					</View>
					<Touchable useForeground={true} onPress={async () => {
						if (attribute === "sex" && (newUserinfo === "M" || newUserinfo === "F")) {
							await editUserInfo(attribute, newUserinfo);
							await setNewUserinfo("");
							setModalVisible([false, false, false]);
						}
						if (attribute === "selfDescription") {
							if (newUserinfo === "" || newUserinfo.split(" ").join("") === "") {
								showToast("Please enter your self description!", "warning", 'Try again');
							} else if (newUserinfo.length > 60) {
								showToast("Self description should be within 60 words!", "warning", 'Try again');
							} else {
								await editUserInfo(attribute, newUserinfo);
								await setNewUserinfo("");
								setModalVisible([false, false, false]);
							}
						}
						if (attribute === "username") {
							if (newUserinfo === "" || newUserinfo.split(" ").join("") === "") {
								showToast("Please enter your username!", "warning", 'Try again');
							} else if (newUserinfo.length > 20) {
								showToast("Your username should be within 20 words!", "warning", 'Try again');
							} else {
								await editUserInfo(attribute, newUserinfo);
								await setNewUserinfo("");
								setModalVisible([false, false, false]);
							}
						}
					}}>
						<View style={{ overflow: 'hidden', flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingLeft: 4, paddingRight: 4, backgroundColor: 'dodgerblue', borderRadius: 5, alignItems: 'center', width: 70, height: 38 }}>
							<Ionicons name="md-save" color='white' size={17} /><Text style={{ color: 'white', fontSize: 16 }}>Save</Text>
						</View>
					</Touchable>
				</CustomModal>
			</View>
		)
	}
	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.cancelled) {
			let reszieResult = [await ImageManipulator.manipulateAsync(result.uri, [{ resize: { width: 400, height: 400 } }], { compress: 1, format: ImageManipulator.SaveFormat.JPEG }), await ImageManipulator.manipulateAsync(result.uri, [{ resize: { width: 200, height: 200 } }], { compress: 1, format: ImageManipulator.SaveFormat.JPEG }), await ImageManipulator.manipulateAsync(result.uri, [{ resize: { width: 60, height: 60 } }], { compress: 1, format: ImageManipulator.SaveFormat.JPEG })];
			setProPic(reszieResult);
			setProPicModalVisible(true);
		} else {
			setProPic(undefined);
			setProPicModalVisible(true);
		}
	};

	return (
		<Form style={{ flex: 1, flexDirection: "column" }}>
			<ScrollView>
				<View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
					<Touchable onPress={() => { setProPic(undefined); setProPicModalVisible(true); }}  >
						<View style={{ flex: 1, padding: 5, }}>
							<Image source={personalData && personalData.hasOwnProperty("profile_picture") && (personalData.profile_picture !== true) ? { uri: personalData.profile_picture } : require('../assets/UserProPic.jpg')} style={{ height: 200, width: 200, borderRadius: 100, }} />
							<View style={{ position: 'absolute', bottom: 5, right: 5 }}>
								<MaterialIcons name="add-a-photo" size={18} color="black" />
							</View>
						</View>
					</Touchable >
				</View>
				<View style={{ flex: 9, justifyContent: 'center', paddingTop: 5, paddingBottom: 50 }}>
					{personalData !== undefined && itemAndModal("Username", personalData.username.userdata, 0, "username")}
					{personalData !== undefined && itemAndModal("Sex", personalData.sex.userdata, 1, "sex")}
					{personalData !== undefined && itemAndModal("Self Description", personalData.self_description.userdata, 2, "selfDescription")}
				</View>
			</ScrollView>
			<CustomModal modalDisplay={proPicModalVisible} onRequestClose={() => { setProPic(undefined); setProPicModalVisible(false); }} >
				<View style={{ alignItems: 'center' }}>
					<View style={styles.types}>
						<Text style={styles.typesTexts}>Set Your Profile Pictrue:</Text>
					</View>
					{proPic === undefined ?
						<Touchable onPress={async () => { setProPicModalVisible(false); await pickImage(); }} >
							<View style={{ justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 3, height: Dimensions.get('window').width / 3, margins: 5, paddings: 5, borderWidth: 1, borderStyle: 'dashed', borderColor: '#bfbfbf', backgroundColor: 'white' }}>
								<MaterialIcons name="add-a-photo" size={40} color="black" />
								<Text style={{ color: 'grey', fontSize: 20, fontWeight: 'bold' }}>
									Pick a Photo
									</Text>
							</View>
						</Touchable>
						:
						<Touchable onPress={async () => { setProPicModalVisible(false); await pickImage(); }} >
							<View style={{ justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 3, height: Dimensions.get('window').width / 3, margins: 5, paddings: 5, borderWidth: 1, borderStyle: 'dashed', borderColor: '#bfbfbf' }}>
								<Image source={{ uri: proPic[0].uri }} style={{ height: '100%', width: '100%' }} />
							</View>
						</Touchable>
					}
				</View>

				<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10 }}>
					<Ionicons.Button name="md-save" style={{ flex: 1 }} onPress={async () => {
						for (let i = 0; i < 3; i++) {
							uploadImage(proPic[i].uri, "user_profile_picture/" + firebase.auth().currentUser.uid + "/user_profile_picture_" + (i === 0 ? "400" : i === 1 ? "200" : "60") + ".jpg");
						}
						await editUserInfo("profilePic", "")
						setProPic(undefined);
						setProPicModalVisible(false);
					}} >
						Save
					</Ionicons.Button>
				</View>
			</CustomModal>
		</Form>
	)
}

const EditUserInfoScreen = (props) => {
	return (
		<EditForm />
	);
}
export default EditUserInfoScreen;

const styles = StyleSheet.create({
	inputBox: {
		width: Dimensions.get('window').width / 1.5,
		borderWidth: 0.9,
		borderRadius: 3,
		borderColor: 'rgba(0,0,0,0.5)',
		fontSize: 18,
		paddingLeft: 5,
		paddingRight: 5,
		paddingTop: 5,
		paddingBottom: 5,
	},
	types: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 10,
		marginBottom: 5,
	},
	values: {
		borderWidth: 0.9,
		borderColor: 'rgba(0,0,0,0.5)',
		marginLeft: 7,
		marginRight: 7,
		marginBottom: 10,
		borderRadius: 3,
	},
	typesTexts: {
		fontSize: 20
	},
	valuesTexts: {
		fontSize: 18,
		paddingLeft: 5,
		paddingRight: 20,
		paddingTop: 5,
		paddingBottom: 5,
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