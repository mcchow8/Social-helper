import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import * as firebase from 'firebase';
import { Touchable, CustomButton, CustomModal, replaceAll, timeStampToString } from '../CommonFunctions';
import { uploadTimeTable, Timetable } from './CreateMeetingScreen';
import * as RootNavigation from '../../RootNavigation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
const ViewExistedMeetingScreen = () => {
	const [existedMeeting, setExistedMeeting] = useState([]);
	const [viewMeetingKey, setViewMeetingKey] = useState("");
	const [meetingSaved, setMeetingSaved] = useState(null);
	const [newSelect, setNewSelect] = useState({});
	const [meetingEmail, setMeetingEmail] = useState([]);
	const [editing, setEditing] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	let emialString = firebase.auth().currentUser.email.toString();
	useEffect(() => {
		let email = firebase.auth().currentUser.email;
		email = replaceAll(email, ".", "\\");
		firebase.database().ref('/email-meeting/' + email).on("value", (snapshot) => {
			let temp = [];
			snapshot.forEach((childSnapshot) => {
				temp = [...temp, [childSnapshot.key, childSnapshot.exportVal()]];
			});
			setExistedMeeting(temp);
		});
	}, []);

	useEffect(() => {
		if (viewMeetingKey !== "") {
			firebase.database().ref('/meeting/' + viewMeetingKey).once("value", (snapshot) => {
				let newObj = snapshot.exportVal();
				newObj.creator = replaceAll(newObj.creator, '\\', '.');
				let temp = {};
				setMeetingEmail([]);
				let emailArray = [];
				for (const address in newObj.email) {
					let x = replaceAll(address, '\\', '.');
					temp[x] = true;
					if (x === newObj.creator) {
						emailArray = [x, ...emailArray];
					} else {
						emailArray = [...emailArray, x];
					}
				}
				setMeetingEmail(emailArray);
				newObj.email = temp;
				temp = {};
				for (const num in newObj.selected) {
					let tmp = {};
					for (const address in newObj.selected[num]) {
						tmp[replaceAll(address, '\\', '.')] = true;
					}
					temp[num] = tmp;
				}
				newObj.selected = temp;
				setMeetingSaved(newObj);
				setNewSelect(newObj.selected);
			});
		}
	}, [viewMeetingKey]);
	const ShowExistedMeeting = existedMeeting.length !== 0 ? existedMeeting.map(
		(value, index) => {
			return (
				<View key={index}>
					<Touchable
						useForeground={true}
						onPress={() => { setViewMeetingKey(value[0]); }}
					>
						<View
							style={{ borderWidth: 0.5, borderRadius: 6, borderColor: 'rgba(0,0,0,0.5)', width: Dimensions.get('window').width / 2 - 10, margin: 5, alignItems: 'center', backgroundColor: 'white', overflow: "hidden" }}
						>
							<Text style={{ fontSize: 20, padding: 3 }}>{value[1]["meeting_name"]}</Text>
							<Text style={{ fontSize: 12, paddingBottom: 5 }}>Created at: {timeStampToString(value[1]["createdAt"])}</Text>
							<Touchable onPress={() => { setDeleteModal(value) }} background={['#c8c8c8', true, 0]}>
								<View style={{ position: 'absolute', right: 0 }}>
									<Entypo name="cross" size={24} color="black" />
								</View>
							</Touchable>
						</View>
					</Touchable>
				</View>
			)
		}
	) : null

	const deleteMeeting = async (meeting, mode) => {
		let key = meeting[0]
		let emailObj = {}
		await firebase.database().ref('meeting/' + key + '/email').once("value", (snapshot) => {
			emailObj = snapshot.exportVal();
		});
		let emailCounter = 0
		for (const _ in emailObj) {
			if (emailCounter < 3) {
				emailCounter++;
			} else {
				break
			}
		}
		if (mode === 'me' && emailCounter === 3) {
			let myEmail = firebase.auth.currentUser.email.replaceAll(".", "\\");
			firebase.database().ref('email-meeting/' + myEmail + '/' + key).remove()
			firebase.database().ref('meeting/' + key + '/email/' + myEmail).remove()
			await firebase.database().ref('/meeting/' + key + '/selected').once("value", (snapshot) => {
				snapshot.forEach((childSnapshot) => {
					for (const property in childSnapshot.exportVal()) {
						if (property === myEmail) {
							firebase.database().ref('/meeting/' + key + '/selected/' + childSnapshot.key + '/' + property).remove()
						}
					}
				})
			});
		} else if (mode === "all" || emailCounter === 2) {
			for (const property in emailObj) {
				firebase.database().ref('email-meeting/' + property + '/' + key).remove()
			}
			firebase.database().ref('meeting/' + key).remove()
		}
	}

	return (
		<>
			{
				viewMeetingKey === "" || meetingSaved === null
					?
					<>
						{
							existedMeeting.length > 0
								?
								<ScrollView style={{ marginBottom: 60 }}>
									<View style={{ flexDirection: 'row', width: Dimensions.get('window').width, flexWrap: 'wrap' }}>
										{
											ShowExistedMeeting
										}
									</View>
								</ScrollView>
								:
								<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 60 }}>
									<Text style={{ textAlign: 'center', fontSize: 20 }}>
										{"There are no any meeting yet. Try to create a new one."}
									</Text>
								</View>
						}
						<CustomModal
							modalDisplay={!(deleteModal === false)}
							onRequestClose={() => setDeleteModal(false)}>
							<View style={{ alignItems: 'center', padding: 5 }}>
								<Text style={{ fontSize: 26 }}>{"Delete meeting"}</Text>
								<Text style={{ fontSize: 20, marginTop: 7 }}>
									{
										!(deleteModal === false) && (
											replaceAll(firebase.auth().currentUser.email, '.', '\\') === deleteModal[1]['creator']
												?
												"You are the creator of the meeting, you can delete the meeting or remove yourself from the meeting."
												:
												"You are not the creator of the meeting, you can only remove yourself from the meeting."
										)
									}
								</Text>
								<View style={{ flexDirection: 'row', marginTop: 7 }}>
									{
										!(deleteModal === false) && (
											replaceAll(firebase.auth().currentUser.email, '.', '\\') === deleteModal[1]['creator']
												?
												<CustomButton message="Delete Meeting" onPress={() => { deleteMeeting(deleteModal, "all"); setDeleteModal(false) }} style={styles.deleteModalButton} messageStyle={styles.deleteModalButtonMessage}>
													<MaterialCommunityIcons name="delete-sweep-outline" size={20} color="white" />
												</CustomButton>
												:
												null
										)
									}
									<CustomButton message="Remove Myself" onPress={() => { deleteMeeting(deleteModal, "me"); setDeleteModal(false) }} style={styles.deleteModalButton} messageStyle={styles.deleteModalButtonMessage}>
										<MaterialCommunityIcons name="account-remove-outline" size={20} color="white" />
									</CustomButton>
									<CustomButton message="Cancel" onPress={() => { setDeleteModal(false) }} style={styles.deleteModalButton} messageStyle={styles.deleteModalButtonMessage}>
										<Ionicons name="md-arrow-back" size={20} color="white" />
									</CustomButton>
								</View>
							</View>
						</CustomModal>
						<View style={{ justifyContent: 'center', alignItems: 'center', height: 60, backgroundColor: 'white', borderTopWidth: 1, borderColor: 'lightgrey' }}>
							<CustomButton message="Create New Meeting" onPress={() => { RootNavigation.navigate("CreateMeetingScreen"); }} style={{ height: 40, width: 200, borderRadius: 5, }} messageStyle={{ fontSize: 16 }} touchableStyle={{ borderRadius: 15, }}>
								<MaterialCommunityIcons name="table-plus" size={20} color='white' style={{ justifyContent: 'center', alignSelf: 'center', marginRight: 5 }} />
							</CustomButton>
						</View>
					</>
					:
					<>
						<ScrollView>
							{
								!editing ?
									<View>
										<Text style={styles.title}>Meeting:</Text>
										<Text style={styles.content}>{meetingSaved.meeting_name}</Text>
										<Text style={styles.title}>Creator:</Text>
										<Text style={styles.content}>{meetingSaved.creator}</Text>
										<Text style={styles.title}>Email:</Text>
										<View style={{ ...styles.emailView, flexDirection: 'row', flexWrap: 'wrap' }}>
											{
												meetingEmail.map(
													(value, index, array) => {
														//console.log(meetingEmail);
														return (
															<View key={value} style={{ borderWidth: 0.5, borderRadius: 6, borderColor: 'rgba(0,0,0,0.5)', padding: 5, paddingRight: 20, paddingLeft: 10, alignSelf: "center", alignItems: 'center', justifyContent: 'center', width: Dimensions.get('window').width / 2 - 19, margin: 5, backgroundColor: 'white', flexDirection: 'row' }}>
																<Text style={{ fontSize: 16 }}>{value}</Text>
															</View>
														)
													}
												)
											}
										</View>
									</View>
									:
									null
							}
							{
								Timetable((new Date(-meetingSaved.time_data.start_date)), (new Date(-meetingSaved.time_data.start_time)), (new Date(-meetingSaved.time_data.end_date)), (new Date(-meetingSaved.time_data.end_time)), parseInt(meetingSaved.time_data.time_length), (att) => {
									console.log(att);
									console.log(newSelect);
									if (!newSelect.hasOwnProperty(att)) {
										let smallObj = {};
										smallObj[emialString] = true;
										let obj = {};
										obj[att] = smallObj;
										setNewSelect({ ...newSelect, ...obj });
									} else {
										if (!newSelect[att].hasOwnProperty(emialString)) {
											let smallObj = {};
											smallObj[emialString] = true;
											let obj = {};
											obj[att] = { ...newSelect[att], ...smallObj };
											setNewSelect({ ...newSelect, ...obj });
										} else {
											let flag = 0;
											for (const _ in newSelect[att]) {
												flag++;
												if (flag >= 2) {
													break;
												}
											}
											if (flag < 2) {
												delete newSelect[att];
												setNewSelect({ ...newSelect });
											} else {
												delete newSelect[att][emialString];
												setNewSelect({ ...newSelect });
											}

										}

									}
								}, newSelect, editing, meetingSaved.creator)
							}
						</ScrollView>
						<View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 5, borderColor: 'rgba(0,0,0,0.5)', borderTopWidth: 0.5 }}>
							<CustomButton message="Go back" style={{ ...styles.button, width: 150, marginBottom: 0 }} messageStyle={styles.buttonText} onPress={() => { setViewMeetingKey(""); setEditing(false); }}>
								<AntDesign name="back" size={22} color="white" style={styles.buttonIcon} />
							</CustomButton>
							{
								editing ?
									<CustomButton message="Save" style={{ ...styles.button, width: 150, marginBottom: 0 }} messageStyle={styles.buttonText} onPress={() => {
										uploadTimeTable(viewMeetingKey, newSelect);
										setEditing(false);
									}}>
										<AntDesign name="save" size={22} color="white" style={styles.buttonIcon} />
									</CustomButton>
									:
									<CustomButton message="Edit Meeting" style={{ ...styles.button, width: 150, marginBottom: 0 }} messageStyle={styles.buttonText} onPress={() => { setEditing(true); }}>
										<AntDesign name="edit" size={22} color="white" style={styles.buttonIcon} />
									</CustomButton>
							}
						</View>
					</>
			}
		</>
	);
}
export default ViewExistedMeetingScreen;

const styles = StyleSheet.create({
	button: {
		height: 40,
		width: 195,
		borderRadius: 5,
		marginBottom: 10,
	},
	buttonText: {
		fontSize: 15,
	},
	buttonIcon: {
		justifyContent: 'center',
		alignSelf: 'center',
		marginRight: 5,
	},
	title: {
		fontSize: 22,
		marginLeft: 8,
	},
	content: {
		width: Dimensions.get('window').width - 10,
		borderWidth: 0.9,
		borderRadius: 3,
		borderColor: 'rgba(0,0,0,0.5)',
		fontSize: 20,
		paddingLeft: 8,
		paddingRight: 8,
		paddingTop: 3,
		paddingBottom: 3,
		marginBottom: 5,
		marginTop: 5,
		marginLeft: 5,
		marginRight: 5,
		textAlignVertical: 'center',
	},
	emailView: {
		borderWidth: 0.9,
		borderRadius: 3,
		borderColor: 'rgba(0,0,0,0.5)',
		marginLeft: 5,
		marginRight: 5,
		marginBottom: 5,
		marginTop: 5,
		padding: 3,
	},
	deleteModalButton: {
		width: 100,
		height: 50,
		borderRadius: 5,
		marginLeft: 2,
		marginTop: 10
	},
	deleteModalButtonMessage: {
		marginLeft: 5
	},
})