import * as React from 'react';
import { View, Image, ScrollView } from 'react-native';
import { Item, Form, Input, Label } from "native-base";
import * as firebase from 'firebase';
//Constants is used for provides system information.
import Constants from 'expo-constants';
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Setting a timer']);
import * as RootNavigation from '../RootNavigation';
import { showToast, SignUpOrLogin } from './CommonFunctions';
import { MaterialIcons } from '@expo/vector-icons';

//SignUp function that will be called when user click the SignUp button
//email and password that store in the state will be sent.
//If signup fails, error will be alerted.
const CreateUserprofile = (email, password, username, navigation) => {
	/*if signup success, then create userprofile in realtime database*/
	firebase.database().ref('user/' + firebase.auth().currentUser.uid).set({
		username: { privacy: false, userdata: username },
		self_description: { privacy: false, userdata: "I am cser." },
		sex: { privacy: false, userdata: "M" }
	}).then(
		/*if create userprofile in realtime database success, then update userprofile in firebase*/
		firebase.auth().currentUser.updateProfile({
			displayName: username,
		}).then(() => {
			/*if update userprofile in firebase success, return to the auction*/
			showToast('SignUp successfully!', "success")
			//alert("SignUp successfully!");
			RootNavigation.navigate("Explore");
		}).catch((error) => {
			/*Usually there are no error when updating userprofile in firebase, so just print it for debug*/
			//alert("Error while updating User Profile.");
			showToast('Error while updating User Profile!', "warning")
			//alert(error.message);
			console.log(error);
			RootNavigation.navigate("Search");
		})
	).catch(
		(error) => {
			/*Usually there are no error when creating userprofile, so just print it for debug*/
			//alert("Error while updating User Database");
			//alert(error.message);
			showToast('Error while updating User Database!', "warning")
			console.log(error);
			RootNavigation.navigate("Search");
		}
	);
}

const WaitSignuped = (email, password, username) => {
	if (!firebase.auth().currentUser) {
		setTimeout(WaitSignuped, 150, email, password, username)
	} else { CreateUserprofile(email, password, username) };
}

const SignUp = (email, password, username) => {
	firebase.auth().createUserWithEmailAndPassword(email, password).then(
		setTimeout(WaitSignuped, 150, email, password, username)
	).catch(
		(error) => {
			/*error handling of signup proccess*/
			if (error.code === 'auth/email-already-in-use') {
				showToast('The email is already in used. Please try to login or use an other email to signup.', "warning")
			} if (error.code === 'auth/invalid-email') {
				showToast('Invalid email format. Please enter it again.', "warning")
			} else if (error.code === 'auth/weak-password') {
				showToast('The password is too weak. Please try another stronger password.', "warning")
			} else {
				showToast("Network Error. Please try it again.", "warning")
			}
			console.log(error);
		}
	);
};

const SignUpScreen = () => {
	const [password, setPassword] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [username, setUsername] = React.useState("");
	return (
		<ScrollView style={{ flex: 1, marginTop: Constants.statusBarHeight }}>
			<View style={{ flex: 6, flexDirection: 'column', justifyContent: 'center' }}>
				<Image source={require('../assets/Homepage.png')} style={{ height: 250, width: 250, alignSelf: 'center' }} />
			</View>
			<Form style={{ flex: 3 }}>
				<Item floatingLabel style={{ width: '90%', alignSelf: 'center' }}>
					<Label>Username</Label>
					<Input autoCapitalize="none" autoCorrect={false} onChangeText={username => setUsername(username)} />
				</Item>
				<Item floatingLabel style={{ width: '90%', alignSelf: 'center' }}>
					<Label >Email</Label>
					<Input autoCapitalize="none" autoCorrect={false} onChangeText={email => setEmail(email)} />
				</Item>
				<Item floatingLabel style={{ width: '90%', alignSelf: 'center' }}>
					<Label>Password</Label>
					<Input secureTextEntry={true} blurOnSubmit={true} autoCapitalize="none" autoCorrect={false} onChangeText={password => setPassword(password)} />
				</Item>
				<View style={{ marginTop: 15, marginBottom: 15, width: '25%', alignSelf: 'center' }}>
					<MaterialIcons.Button name="person-add" onPress={() => {
						const emailRegex = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i;
						if (username === "" || username.split(" ").join("") === "") {
							showToast('Username should not be empty. Please enter it.', "warning")
						} else if (email === "") {
							showToast('Email should not be empty. Please enter it.', "warning")
						} else if (password === "") {
							showToast('Password should not be empty. Please enter it.', "warning")
						} else if (username.length > 20) {
							showToast('Username should contains not more than 20 characters. Please enter it again.', "warning")
						} else if (email.length > 20) {
							showToast('Email should contains not more than 20 characters. Please enter it again.', "warning")
						} else if (password.length > 20) {
							showToast('Password should contains not more than 20 characters. Please enter it again.', "warning")
						} else if (password.length < 6) {
							showToast('Password should contains at least 6 characters. Please enter it again.', "warning")
						} else if (!emailRegex.test(email)) {
							showToast('Invalid email format. Please enter it again.', "warning")
						} else {
							SignUp(email, password, username)
						}
					}}>
						Sign Up
					</MaterialIcons.Button>
				</View>
			</Form>
			<SignUpOrLogin bool={false} />
		</ScrollView>
	);
}
export default SignUpScreen;