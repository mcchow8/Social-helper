import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableHighlight, TouchableWithoutFeedback, TouchableNativeFeedback, Dimensions, Platform } from 'react-native';
import { Toast } from "native-base";
import * as firebase from 'firebase';
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Setting a timer']);
import * as RootNavigation from '../RootNavigation';
import Constants from 'expo-constants';

export const ignoreYellowBox = () => {
	YellowBox.ignoreWarnings(['Warning: Can\'t perform a React state update on an unmounted component. ']);
}

export const timeStampToString = (time, type = "all") => {
	const addZero = (time) => {
		return (
			(time < 10 ? "0" : "") + time.toString()
		)
	}
	const datetime = new Date(time);
	if (type === "all") {
		const year = datetime.getFullYear();
		const month = addZero(datetime.getMonth() + 1);
		const date = addZero(datetime.getDate());
		const hour = addZero(datetime.getHours());
		const minute = addZero(datetime.getMinutes());
		return hour + ":" + minute + " " + date + "/" + month + "/" + year;
	} else if (type === "dmy") {
		const year = datetime.getFullYear();
		const month = addZero(datetime.getMonth() + 1);
		const date = addZero(datetime.getDate());
		return date + "/" + month + "/" + year;
	} else if (type === "hm") {
		const hour = addZero(datetime.getHours());
		const minute = addZero(datetime.getMinutes());
		return hour + ":" + minute;
	}
};

export const replaceAll = (oString, oWord = ".", nWord = "\\") => {
	let result = "";
	for (let i = 0; i < oString.length; i++) {
		result += oString[i] === oWord ? nWord : oString[i];
	}
	return result;
}

export const showToast = (textShow, toastType = "warning", buttonTextShow = "OK", time = 3000) => {
	Toast.show({
		text: textShow,
		type: toastType,
		buttonText: buttonTextShow,
		duration: time
	});
}

export const uploadImage = async (uri, path) => {
	const response = await fetch(uri);
	const blob = await response.blob();
	const ref = firebase.storage().ref().child(path);
	return ref.put(blob);
}

export const CustomModal = (props) => {
	return (
		<Modal animationType="fade" transparent={true} visible={props.modalDisplay} onRequestClose={props.onRequestClose}>
			<TouchableWithoutFeedback onPress={props.onRequestClose}>
				<View style={styles.modalBg}>
					<View style={{ ...styles.modalContent, position: props.modalDisplay ? "absolute" : "relative", display: props.modalDisplay ? "flex" : "none", }}>
						{props.children}
					</View>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	)
}

export const CustomButton = (props) => {
	return (
		<Touchable
			onPress={props.onPress}
			useForeground={true}
			background={
				props.background
					?
					TouchableNativeFeedback.Ripple(props.background[0], props.background[1], props.background[2])
					:
					TouchableNativeFeedback.SelectableBackground()}
		>
			<View style={{
				padding: 20,
				overflow: 'hidden',
				...props.style,
				backgroundColor: 'dodgerblue',
				justifyContent: 'center',
				alignSelf: 'center',
				alignItems: 'center',
				flexDirection: 'row',
			}}>
				{props.children}
				<Text style={{ ...props.messageStyle, color: 'white', justifyContent: 'center', alignSelf: 'center' }}>
					{props.message}
				</Text>
			</View>
		</Touchable>
	)
}

export const Touchable = (props) => {
	if (Platform.OS === 'android') {
		return (
			<TouchableNativeFeedback
				useForeground={props.useForeground ? props.useForeground : false}
				onPress={props.onPress}
				style={{
					...props.style,
				}}
				background={
					props.background
						?
						TouchableNativeFeedback.Ripple(props.background[0], props.background[1], props.background[2])
						:
						TouchableNativeFeedback.SelectableBackground()}
			>
				{props.children}
			</TouchableNativeFeedback>
		)
	} else {
		return (
			<TouchableHighlight onPress={props.onPress} underlayColor='none' style={props.style} >
				{props.children}
			</TouchableHighlight>
		)
	}
}

export const TouchableOrView = (props) => {
	if (props.bool) {
		return (
			<Touchable onPress={props.onPress} style={props.style}>
				{props.children}
			</Touchable>
		)
	} else {
		return (
			<View style={props.style}>
				{props.children}
			</View>
		)
	}
}

export const SignUpOrLogin = (props) => {
	return (
		<Touchable onPress={() => { RootNavigation.navigate(props.bool ? 'SignUp' : 'Login'); }} >
			<View style={{ justifyContent: 'center', alignSelf: 'center', borderRadius: 15, padding: 5, backgroundColor: '#cccccc', height: 80, width: 220, flexDirection: 'column' }}>
				{
					props.bool
					&&
					<>
						<Text style={{ fontSize: 16, justifyContent: 'center', alignSelf: 'center' }}>Do not have an account?</Text>
						<Text style={{ fontSize: 16, justifyContent: 'center', alignSelf: 'center' }}>Click here to Sign up!</Text>
					</>
				}
				{
					!props.bool
					&&
					<>
						<Text style={{ fontSize: 16, justifyContent: 'center', alignSelf: 'center' }}>Already got an account?</Text>
						<Text style={{ fontSize: 16, justifyContent: 'center', alignSelf: 'center' }}>Click here to Login!</Text>
					</>
				}
			</View>
		</Touchable>
	)
}

export const ShowComponentOrMessage = (props) => {
	const [loginStage, setloginStage] = useState(firebase.auth().currentUser ? true : false);
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			setloginStage(true);
		} else {
			setloginStage(false);
		}
	});
	return (
		<>
			{loginStage && props.children}
			{
				!loginStage
				&&
				<View style={{ flex: 1, marginTop: Constants.statusBarHeight, justifyContent: 'center', alignItems: 'center' }}>
					<Text style={{ fontSize: 20 }}>
						{props.message}
					</Text>
					<View style={{ marginTop: 15 }} />
					<SignUpOrLogin bool={true} />
					<View style={{ marginTop: 15 }} />
					<SignUpOrLogin bool={false} />
				</View>
			}
		</>
	)
}

const styles = StyleSheet.create({
	modalBg: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0,0,0,0.4)'
	},
	modalContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: 'white',
		top: Dimensions.get('window').height / 2 - 150,
		width: Dimensions.get('window').width * 0.8,
		zIndex: 2,
		padding: 20,
		borderRadius: 5,
	},
});
