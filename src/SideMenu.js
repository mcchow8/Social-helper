import React, { useState, useEffect } from 'react';
import { Text, View, Image, } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import * as firebase from 'firebase';
import * as RootNavigation from '../RootNavigation';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Touchable, showToast } from './CommonFunctions';
import { AntDesign } from '@expo/vector-icons';

const SideMenuUserInfo = (bool) => {
	const [personalData, setPersonalData] = useState(undefined);
	const getPersonalData = async () => {
		if (bool) {
			await firebase.database().ref("user/" + firebase.auth().currentUser.uid).on('value', (snapshot) => {
				if (snapshot.val().hasOwnProperty("profile_picture")) {
					firebase.storage().ref().child("user_profile_picture/" + firebase.auth().currentUser.uid + "/user_profile_picture_200.jpg").getDownloadURL().then((url) => {
						setPersonalData({ ...snapshot.val(), profile_picture: url })
					}).catch(() => {
					});
				} else {
					setPersonalData(snapshot.val());
				}
			});
		}
	}
	useEffect(() => {
		getPersonalData()
	}, [bool]);
	return (
		<Touchable onPress={() => RootNavigation.navigate('Myself')}>
			<View style={{ height: 100, width: 250, flex: 1, justifyContent: 'space-around', alignItems: 'center', flexDirection: "row" }}>
				<View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }} >
					<Image source={bool && personalData && personalData.hasOwnProperty("profile_picture") && typeof (personalData.profile_picture) !== 'number' ? { uri: personalData.profile_picture } : require('.././assets/UserProPic.jpg')} style={{ height: 90, width: 90, borderRadius: 50 }} />
				</View>
				<View style={{ flex: 7, justifyContent: 'center', alignItems: 'center' }}>
					<Text style={{ fontSize: 18 }}>
						{
							bool
								?
								personalData
									?
									personalData.username.userdata
									:
									firebase.auth().currentUser.displayName
										?
										firebase.auth().currentUser.displayName
										:
										firebase.auth().currentUser.email
								:
								"Anonymous"
						}
					</Text>
				</View>
			</View>
		</Touchable>
	);
}

const logout = (props) => {
	firebase.auth().signOut().then(() => {
		props.navigation.closeDrawer();
		showToast("Sign-out successful.", "success");
	}).catch((error) => {
		showToast(error.message, "warning");
	});
}

const SideMenu = (props) => {
	return (
		<DrawerContentScrollView {...props} >
			<DrawerItem label={() => SideMenuUserInfo(props.bool)} />
			<DrawerItemList {...props} />
			{
				props.bool
					?
					<DrawerItem
						label={() =>
							<View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 38, width: 90, backgroundColor: 'dodgerblue', borderRadius: 5 }}>
								<SimpleLineIcons name="logout" size={20} color='white' />
								<Text style={{ color: 'white', fontSize: 15 }}>
									Logout
								</Text>
							</View>
						}
						style={{ width: 100, height: 60, marginLeft: 90 }}
						onPress={() => logout(props)} />
					:
					<>
						<DrawerItem
							label={() =>
								<View style={{ width: 100, height: 38, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
									<SimpleLineIcons name="login" size={19} color='white' />
									<Text style={{ color: 'white', fontSize: 16 }}>
										Login
									</Text>
								</View>
							}
							onPress={() => RootNavigation.navigate('Login')}
							style={{ width: 120, height: 38, justifyContent: 'center', backgroundColor: 'dodgerblue', borderRadius: 5 }} />
						<DrawerItem
							label={() =>
								<View style={{ width: 100, height: 38, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
									<AntDesign name="adduser" size={21} color="white" />
									<Text style={{ color: 'white', fontSize: 16 }}>
										Sign Up
									</Text>
								</View>
							}
							onPress={() => RootNavigation.navigate('SignUp')}
							style={{ width: 120, height: 38, position: 'absolute', right: 0, bottom: 0, justifyContent: 'center', backgroundColor: 'dodgerblue', borderRadius: 5 }} />
					</>
			}
		</DrawerContentScrollView>
	);
}

export default SideMenu;