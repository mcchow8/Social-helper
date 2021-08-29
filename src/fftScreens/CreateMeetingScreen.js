import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Dimensions, Platform } from 'react-native';
import * as firebase from 'firebase';
import { CustomButton, CustomModal, showToast, Touchable, TouchableOrView, timeStampToString, replaceAll } from '../CommonFunctions';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import * as RootNavigation from '../../RootNavigation';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';

export const uploadTimeTable = async (typeOrKey, tableData, startDate, startTime, endDate, endTime, timeLength, validEmail, meetingName) => {
	if (typeOrKey === 'new') {
		let emailObj = {};
		for (let i = 0; i < validEmail.length; i++) {
			emailObj[replaceAll(validEmail[i], ".", "\\")] = true;
		}
		let newTableData = {};
		for (const i in tableData) {
			for (const j in tableData[i]) {
				let temp = {}
				temp[replaceAll(j, ".", "\\")] = true;
				newTableData[i] = temp;
			}
		}
		let myEmail = replaceAll((await firebase.auth().currentUser.email), ".", "\\");
		let data = {
			selected: newTableData,
			email: emailObj,
			meeting_name: meetingName,
			creator: myEmail,
			time_data: {
				start_date: -startDate.getTime(),
				start_time: -startTime.getTime(),
				end_date: -endDate.getTime(),
				end_time: -endTime.getTime(),
				time_length: timeLength
			},
		};
		let newMeetingKey = await firebase.database().ref().child('meeting').push().key;
		let updates = {}
		updates['/meeting/' + newMeetingKey] = data;
		for (let i = 0; i < validEmail.length; i++) {
			updates['/email-meeting/' + replaceAll(validEmail[i], ".", "\\") + '/' + newMeetingKey] = { createdAt: firebase.database.ServerValue.TIMESTAMP, meeting_name: meetingName, creator: myEmail, };
		}
		firebase.database().ref().update(updates).then(_ => {
			showToast("Meeting Created!", 'success');
			RootNavigation.navigate("Find Free Time");
		})
	} else {
		let newTableData = {};
		for (const i in tableData) {
			for (const j in tableData[i]) {
				let temp = {}
				temp[replaceAll(j, ".", "\\")] = true;
				newTableData[i] = { ...newTableData[i], ...temp };
			}
		}
		let updates = {};
		updates['/meeting/' + typeOrKey + "/selected"] = newTableData;
		firebase.database().ref().update(updates).then(_ => {
			showToast("Meeting Updated!", 'success');
			RootNavigation.navigate("Find Free Time");
		})
	}
}


export const Timetable = (startDate, startTime, endDate, endTime, timeLength, callback, tableDataInput, canEdit = true, creator) => {
	let tableHead = [""];
	let tableData = [];
	let widthArr = [80]
	const sDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
	const eDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
	const days = ((eDate.getTime() - sDate.getTime()) / (1000 * 3600 * 24)) + 1;
	const numSlot = Math.floor((endTime.getHours() * 60 + endTime.getMinutes() - startTime.getHours() * 60 - startTime.getMinutes()) / timeLength);
	const myEmail = firebase.auth().currentUser.email;
	for (let i = 0; i < days; i++) {
		tableHead = [...tableHead, timeStampToString(startDate.getTime() + i * 24 * 60 * 60 * 1000, 'dmy')];
		widthArr = [...widthArr, 180]
	}
	for (let i = 0; i < numSlot; i++) {
		let tempTimeStart = new Date(startTime.getTime() + 1000 * 60 * timeLength * (i - 2));
		let tempTimeEnd = new Date(startTime.getTime() + 1000 * 60 * timeLength * (i - 1));
		let tableTitle = timeStampToString(tempTimeStart, 'hm') + " - " + timeStampToString(tempTimeEnd, 'hm');
		let temp = [tableTitle];
		for (let j = 0; j < days; j++) {
			let messageArray = [];
			let flag = true;
			if (tableDataInput.hasOwnProperty(i.toString() + ":" + j.toString())) {
				for (const property in tableDataInput[i.toString() + ":" + j.toString()]) {
					if (tableDataInput[i.toString() + ":" + j.toString()][property]) {
						if (property === myEmail) {
							messageArray = [...messageArray, "Selected"]
						} else {
							messageArray = [...messageArray, property]
						}
						flag = false;
					}
				}
			}
			if (flag) {
				messageArray = [""];
			}
			temp = [...temp, messageArray]
		}
		tableData = [...tableData, temp];
	}
	const element = (data, rowIndex, colIndex) => {
		return (
			<TouchableOrView onPress={() => { callback(rowIndex + ":" + (colIndex - 1)) }} bool={colIndex !== 0 && canEdit}>
				<View style={{ width: widthArr[colIndex] - 1, ...tableStyles.cell }}>
					{
						colIndex !== 0 && data ?
							data.map((t, id) => (
								<Text style={tableStyles.text} key={id}>{t}</Text>
							))
							:
							<Text style={tableStyles.text} >{data}</Text>
					}
				</View>
			</TouchableOrView>
		)
	}
	return (
		<View style={tableStyles.container}>
			<ScrollView horizontal={true}>
				<Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
					<Row data={tableHead} widthArr={widthArr} style={tableStyles.header} textStyle={tableStyles.text} />
					{
						tableData.map((rowData, index) => (
							< TableWrapper key={index} style={[tableStyles.row, index % 2 && { backgroundColor: '#F7F6E7' }]}>
								{
									rowData.map((cellData, cellIndex) => (
										<Cell key={cellIndex} data={element(cellData, index, cellIndex,)} />
									))
								}
							</TableWrapper>
						))
					}
				</Table>
			</ScrollView>
		</View >
	)
}

const TextAndTextInput = (props) => {
	if (props.bool) {
		return (
			<>
				<Text style={styles.text}>{props.text}</Text>
				<TextInput style={styles.textInput} onChangeText={props.onChangeText} defaultValue={props.defaultValue} placeholder="Not filled" keyboardType={props.keyboardType} />
			</>
		);
	} else {
		return (
			<>
				<Text style={styles.text}>{props.text}</Text>
				<Touchable onPress={props.onPress}>
					<View>
						{props.value === ""
							?
							<Text style={{ ...styles.textInput, color: 'lightgrey' }}>
								Not filled
							</Text>
							:
							<Text style={{ ...styles.textInput }}>
								{props.value}
							</Text>}
					</View>
				</Touchable>
			</>
		);
	}
}

const CreateMeetingScreen = () => {
	const [meetingName, setMeetingName] = useState("");
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState(new Date());
	const [startTime, setStartTime] = useState(new Date());
	const [endTime, setEndTime] = useState(new Date());
	const [dateTimePickerMode, setDateTimePickerMode] = useState(["date", "start"]);
	const [dateTimePickerShow, setDateTimePickerShow] = useState(false);
	const [dateTimeStatus, setDateTimeStatus] = useState({ startDate: false, endDate: false, endTime: false, startTime: false });
	const [weekday, setWeekday] = useState(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
	const [timeLength, setTimeLength] = useState(-1);
	const [validEmail, setValidEmail] = useState([firebase.auth().currentUser.email]);
	const [emailModalVisible, setEmailModalVisible] = useState(false);
	const [tempEmail, setTempEmail] = useState("");
	const [timetableShow, setTimetableShow] = useState(false);
	const [timetableSelected, setTimetableSelected] = useState({});
	let emialString = firebase.auth().currentUser.email.toString();
	const ShowValidEmail = validEmail !== [] ? validEmail.map(
		(value, index, array) => {
			return (
				<View key={value} style={{ borderWidth: 0.5, borderRadius: 6, borderColor: 'rgba(0,0,0,0.5)', padding: 5, paddingRight: 20, paddingLeft: 10, alignSelf: "center", alignItems: 'center', justifyContent: 'center', width: Dimensions.get('window').width / 2 - 19, margin: 5, backgroundColor: 'white', flexDirection: 'row' }}>
					<Text style={{ fontSize: 16 }}>{value}</Text>
					{
						index !== 0 ?
							<Touchable onPress={() => { setValidEmail([...validEmail.slice(0, index), ...validEmail.slice(index + 1)]) }}>
								<View style={{ position: 'absolute', right: 0 }}>
									<Entypo name="cross" size={24} color="black" />
								</View>
							</Touchable>
							:
							null
					}
				</View>
			)
		}
	) : null
	return (
		<>
			<ScrollView style={{ marginBottom: timetableShow ? 60 : 0 }}>
				<TextAndTextInput text="Meeting Name:" onChangeText={newVal => { setMeetingName(newVal) }} bool={true} />
				<View style={styles.emailView}>
					{validEmail !== [] &&
						<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
							{ShowValidEmail}
						</View>
					}
					{
						Platform.OS === 'android'
							?
							<CustomButton message="Add email" onPress={() => { setEmailModalVisible(true) }} style={{ ...styles.button, marginTop: 10, width: 130 }} messageStyle={{ fontSize: 15 }} >
								<MaterialCommunityIcons name="email-plus" size={24} color="white" style={styles.buttonIcon} />
							</CustomButton>
							:
							<View style={{
								padding: 20,
								overflow: 'hidden', ...styles.button, marginTop: 10, width: 130,
								backgroundColor: 'dodgerblue',
								justifyContent: 'center',
								alignSelf: 'center',
								alignItems: 'center',
								flexDirection: 'row',
							}}  >
								<MaterialCommunityIcons name="email-plus" size={24} color="white" style={styles.buttonIcon} />
								<Text style={{ fontSize: 15, color: 'white', justifyContent: 'center', alignSelf: 'center' }}>
									{"Add email"}
								</Text>
							</View>
					}
				</View>
				<CustomModal modalDisplay={emailModalVisible} onRequestClose={() => { setEmailModalVisible(false); }} >
					<Text style={{ fontSize: 22 }}>Please input email(s):</Text>
					<Text style={{ fontSize: 14 }}>Multiple emails can be separated by a ","</Text>
					<TextInput style={{ width: Dimensions.get('window').width / 1.5, borderWidth: 0.9, borderRadius: 3, borderColor: 'rgba(0,0,0,0.5)', fontSize: 18, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5, marginBottom: 5, marginTop: 5 }} onChangeText={newVal => { setTempEmail(newVal) }} onSubmitEditing={() => {
						if (tempEmail !== "") {
							const emailRegex = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i;
							let temp = tempEmail.split(",");
							let flag = false;
							let temp2 = "";
							for (let i = 0; i < temp.length; i++) {
								if (emailRegex.test(temp[i])) {
									if (!validEmail.includes(temp[i])) {
										setValidEmail([...validEmail, temp[i].toLowerCase()])
									}
								} else {
									flag = true;
									temp2 = temp2 + "," + temp[i];
								}
							}
							setTempEmail(temp2)
							if (flag === true) {
								showToast("There are invalid emails!", "waring");
							} else {
								setEmailModalVisible(false);
							}
						} else {
							showToast("There are no inputs!", "waring");
						}
					}} keyboardType="email-address" placeholder="Not filled" />
					<CustomButton message="Add email" onPress={() => {
						if (tempEmail !== "") {
							const emailRegex = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i;
							let temp = tempEmail.split(",");
							let flag = false;
							let temp2 = "";
							for (let i = 0; i < temp.length; i++) {
								if (emailRegex.test(temp[i])) {
									if (!validEmail.includes(temp[i])) {
										setValidEmail([...validEmail, temp[i].toLowerCase()])
									}
								} else {
									flag = true;
									temp2 = temp2 + "," + temp[i];
								}
							}
							setTempEmail(temp2)
							if (flag === true) {
								showToast("There are invalid emails!", "waring");
							} else {
								setEmailModalVisible(false);
							}
						} else {
							showToast("There are no inputs!", "waring");
						}
					}} style={{ height: 40, width: 120, borderRadius: 15, }} messageStyle={{ fontSize: 14 }}>
						<MaterialCommunityIcons name="email-plus" size={15} color="white" style={styles.buttonIcon} />
					</CustomButton>
				</CustomModal>
				{
					timetableShow ?
						<>

							<CustomButton message="Change inputs" style={{ ...styles.button, width: 150 }} messageStyle={styles.buttonText} onPress={() => { setTimetableShow(false); }}>
								<AntDesign name="back" size={22} color="white" style={styles.buttonIcon} />
							</CustomButton>
							{
								Timetable(startDate, startTime, endDate, endTime, timeLength, (att) => {
									if (!timetableSelected.hasOwnProperty(att)) {
										let smallObj = {};
										smallObj[emialString] = true;
										let obj = {};
										obj[att] = smallObj;
										setTimetableSelected({ ...timetableSelected, ...obj });
									} else {
										if (!timetableSelected[att].hasOwnProperty(emialString)) {
											let smallObj = {};
											smallObj[emialString] = true;
											let obj = { ...timetableSelected[att], ...smallObj };
											setTimetableSelected({ ...timetableSelected, ...obj });
										} else {
											let flag = 0;
											for (const _ in timetableSelected[att]) {
												flag++;
												if (flag >= 2) {
													break;
												}
											}
											if (flag < 2) {
												delete timetableSelected[att];
												setTimetableSelected({ ...timetableSelected });
											} else {
												delete timetableSelected[att][emialString];
												setTimetableSelected({ ...timetableSelected });
											}

										}

									}
								}, timetableSelected)
							}
						</>
						:
						<>
							<TextAndTextInput text="Start Date:" onPress={() => { setDateTimePickerMode(["date", "start"]); setDateTimePickerShow(true); }} bool={false} value={dateTimeStatus.startDate ? timeStampToString(startDate, 'dmy') : ""} />

							<TextAndTextInput text="End Date:" onPress={() => { setDateTimePickerMode(["date", "end"]); setDateTimePickerShow(true); }} bool={false} value={dateTimeStatus.endDate ? timeStampToString(endDate, 'dmy') : ""} />

							<TextAndTextInput text="Start Time:" onPress={() => { setDateTimePickerMode(["time", "start"]); setDateTimePickerShow(true); }} bool={false} value={dateTimeStatus.startTime ? timeStampToString(startTime, 'hm') : ""} />

							<TextAndTextInput text="End Time:" onPress={() => { setDateTimePickerMode(["time", "end"]); setDateTimePickerShow(true); }} bool={false} value={dateTimeStatus.endTime ? timeStampToString(endTime, 'hm') : ""} />

							<TextAndTextInput text="Time Slot Length (in mins):" bool={true} keyboardType="number-pad" onChangeText={(newVal) => { setTimeLength(newVal); }} defaultValue={timeLength === -1 ? null : timeLength} />

							<CustomButton message={"Generate Timetable"} style={{ ...styles.button, width: 240, marginTop: 10, marginBottom: 30 }} messageStyle={{ ...styles.buttonText, fontSize: 20 }} onPress={() => {
								if (dateTimeStatus.startDate === false || dateTimeStatus.endDate === false || dateTimeStatus.endTime === false || dateTimeStatus.startTime === false || timeLength === -1) {
									showToast("Please enter all inputs.");
								} else if (startTime.getTime() === endTime.getTime()) {
									showToast("Start time should not be the same as end time.");
								} else if (timeLength <= 0) {
									showToast("Please enter a larger time length.");
								} else if (timeLength > 1440) {
									showToast("Please enter a smaller time length.");
								} else if (timeLength !== 0 && (new Date(timeLength * 60 * 1000)).getTime() > (endTime.getTime() - startTime.getTime())) {
									showToast("Time length is too large.", "warning");
								} else if (dateTimeStatus.startDate === true && dateTimeStatus.endDate === true && dateTimeStatus.endTime === true && dateTimeStatus.startTime === true && timeLength !== 0) {
									setTimetableShow(true);
								}
							}}>
								<MaterialCommunityIcons name="timetable" size={22} color="white" style={styles.buttonIcon} />
							</CustomButton>
						</>
				}
				{
					dateTimePickerShow && (
						<DateTimePicker
							display={"default"
							}
							style={{ flex: 1, width: 320, backgroundColor: "white" }}
							value={dateTimePickerMode[1] === "start" ? (dateTimePickerMode[0] === "date" ? startDate : startTime) : (dateTimePickerMode[0] === "date" ? endDate : endTime)}
							mode={dateTimePickerMode[0]}
							minuteInterval={30}
							onChange={(event, date) => {
								if (event.type === "set") {
									if (dateTimePickerMode[1] === "start") {
										if (dateTimePickerMode[0] === "date") {
											if (dateTimeStatus.endDate === false || (dateTimeStatus.endDate === true && date <= endDate)) {
												setStartDate(date);
												setDateTimeStatus({ ...dateTimeStatus, startDate: true })
											} else {
												showToast("Date of start must be earlier than date of end!", 'waring')
											}
										} else {
											if (dateTimeStatus.endTime === false || (dateTimeStatus.endTime === true && date <= endTime)) {
												setStartTime(date);
												setDateTimeStatus({ ...dateTimeStatus, startTime: true })
											} else {
												showToast("Time of start must be earlier than time of end!", 'waring')
											}
										}
									} else {
										if (dateTimePickerMode[0] === "date") {
											if (dateTimeStatus.startDate === false || (dateTimeStatus.startDate === true && date >= startDate)) {
												setEndDate(date);
												setDateTimeStatus({ ...dateTimeStatus, endDate: true })
											} else {
												showToast("Date of end must be later than date of start!", 'waring')
											}

										} else {
											if (dateTimeStatus.startTime === false || (dateTimeStatus.startTime === true && date >= startTime)) {
												setEndTime(date);
												setDateTimeStatus({ ...dateTimeStatus, endTime: true })
											} else {
												showToast("Time of end must be later than time of start!", 'waring')
											}
										}
									}
								}
								setDateTimePickerShow(false);
							}
							} />
					)
				}
			</ScrollView>
			{
				timetableShow ?
					<View style={{ width: Dimensions.get('window').width, height: 60, bottom: 0, position: 'absolute', borderTopWidth: 1, borderColor: 'lightgrey' }}>
						<CustomButton message="Create meeeting" style={{ ...styles.button, width: 170, marginTop: 10, marginBottom: 10, }} messageStyle={{ ...styles.buttonText, fontSize: 16 }} onPress={() => {
							if (meetingName === "") {
								showToast("Please input name of the meeting!")
							} else if (meetingName.length > 36) {
								showToast("Please input a shorter name of the meeting!")
							} else if (validEmail.length <= 1) {
								showToast("Please input at least one email!", "warning")
							} else {
								uploadTimeTable("new", timetableSelected, startDate, startTime, endDate, endTime, timeLength, validEmail, meetingName);
							}
						}}>
							<MaterialCommunityIcons name="timetable" size={20} color="white" style={styles.buttonIcon} />
						</CustomButton>
					</View>
					: null
			}
		</>
	);
}
export default CreateMeetingScreen;

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
	text: {
		fontSize: 22,
		marginLeft: 8,
	},
	textInput: {
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
})

const tableStyles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 5,
	},
	header: {
		height: 30,
		backgroundColor: '#537791'
	},
	text: {
		textAlign: 'center',
		textAlignVertical: 'center',
		fontSize: 15
	},
	row: {
		height: 60,
		backgroundColor: '#E7E6E1',
		flexDirection: 'row',
	},
	cell: {
		height: 60,
		backgroundColor: 'transparent',
		alignItems: 'center',
		justifyContent: 'center',
	}
});
