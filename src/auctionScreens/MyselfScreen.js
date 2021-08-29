import React from 'react';
import { View, Text } from 'react-native';
import * as firebase from 'firebase';
import Constants from 'expo-constants';
import * as  LoadPostsFunctions from './LoadPostsFunctions';
import { ShowComponentOrMessage, ignoreYellowBox } from '../CommonFunctions';

export const OtherUsers = (prop) => {
	return (
		MyselfScreen(prop)
	);
}

const MyselfScreen = (prop) => {
	ignoreYellowBox();
	if (!prop.route.params) {
		return (
			<ShowComponentOrMessage message="Please login to show your profile.">
				<View style={{ flex: 1 }}>
					<View style={{ flex: 2, marginTop: Constants.statusBarHeight }}>
						<LoadPostsFunctions.loadPersonalData link={firebase.auth().currentUser ? firebase.auth().currentUser.uid : null} loc="mySelf" />
					</View>
					<View style={{ flex: 8 }}>
						<LoadPostsFunctions.loadPost link={firebase.auth().currentUser ? "user-post/" + firebase.auth().currentUser.uid : null} loc="mySelf" />
					</View>
				</View>
			</ShowComponentOrMessage>
		)
	} else {
		return (
			<>
				{
					<View style={{ flex: 1 }}>
						<View style={{ flex: 2 }}>
							<LoadPostsFunctions.loadPersonalData link={prop.route.params} loc="otherUser" />
						</View>
						<View style={{ flex: 8 }}>
							<LoadPostsFunctions.loadPost link={"user-post/" + prop.route.params} loc="otherUser" />
						</View>
					</View>
				}
			</>
		)
	}
}
export default MyselfScreen;