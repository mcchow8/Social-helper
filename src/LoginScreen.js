import * as React from 'react';
import { View, Image, ScrollView } from 'react-native';
import { Item, Form, Input, Label } from "native-base";
import * as firebase from 'firebase';
//Constants is used for provides system information.
import Constants from 'expo-constants';
import { SignUpOrLogin, showToast, ignoreYellowBox } from './CommonFunctions';
import * as RootNavigation from '../RootNavigation';
import { SimpleLineIcons } from '@expo/vector-icons';

//Login function that will be called when user click the Login button
//email and password that store in the state will be sent.
//If login fails, error will be alerted.
//Only the reason of invalid email format will be shown.
//Other reasons will not be listed as a security measure.
const Login = (email, password) => {
	firebase.auth().signInWithEmailAndPassword(email, password).then(user => {
		//console.log(user);
		showToast('Login successfully!', "success");
		RootNavigation.navigate("Explore");
	}).catch(
		(error) => {
			if (error.code === 'auth/invalid-email') {
				showToast('Invalid email format. Please enter it again!', "warning");
			} else {
				showToast('Wrong email or password. Please enter it again!', "warning");
			}
			//console.log(error);
		}
	);
};

const LoginScreen = () => {
	ignoreYellowBox();
	const [password, setPassword] = React.useState("");
	const [email, setEmail] = React.useState("");
	return (
		<ScrollView style={{ flex: 1, marginTop: Constants.statusBarHeight }}>
			<View style={{ flex: 6, flexDirection: 'column', justifyContent: 'center' }}>
				<Image source={require('../assets/Homepage.png')} style={{ height: 250, width: 250, alignSelf: 'center' }} />
			</View>
			<Form style={{ flex: 3 }}>
				<Item floatingLabel style={{ width: '90%', alignSelf: 'center' }}>
					<Label >Email</Label>
					<Input autoCapitalize="none" autoCorrect={false} onChangeText={text => setEmail(text)} />
				</Item>
				<Item floatingLabel style={{ width: '90%', alignSelf: 'center' }}>
					<Label>Password</Label>
					<Input secureTextEntry={true} autoCapitalize="none" autoCorrect={false} onChangeText={text => setPassword(text)} />
				</Item>
				<View style={{ marginTop: 15, marginBottom: 15, width: '22%', alignSelf: 'center' }}>
					<SimpleLineIcons.Button name="login" onPress={() => Login(email, password)}>
						Login
					</SimpleLineIcons.Button>
				</View>
			</Form>
			<SignUpOrLogin bool={true} />
		</ScrollView>
	);
};
export default LoginScreen;