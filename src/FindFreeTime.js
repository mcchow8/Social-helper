import * as React from 'react';
import { View, Text } from 'react-native';
import * as firebase from 'firebase';
import { ShowComponentOrMessage, CustomButton } from './CommonFunctions';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as RootNavigation from '../RootNavigation';

const FindFreeTime = () => {
	return (
		<ShowComponentOrMessage message="Please login to use Find Free Time.">
			<View style={{ justifyContent: 'center', alignSelf: 'center', flex: 1 }}>
				<View style={{ flexDirection: 'row' }}>
					<MaterialCommunityIcons name="timetable" size={36} style={{ alignSelf: 'center', }} />
					<View style={{ marginLeft: 15 }} />
					<Text style={{ fontSize: 36, justifyContent: 'center', alignSelf: 'center' }}>Find free time</Text>
				</View>
				<View style={{ marginTop: 15 }} />
				<CustomButton message="Create New Meeting"
					onPress={() => { RootNavigation.navigate("CreateMeetingScreen"); }}
					style={{ height: 60, width: 240, borderRadius: 20, }}
					messageStyle={{ fontSize: 18 }}
				>
					<MaterialCommunityIcons name="table-plus" size={24} color='white' style={{ justifyContent: 'center', alignSelf: 'center', marginRight: 5 }} />
				</CustomButton>
				<View style={{ marginTop: 15 }} />
				<CustomButton
					message="View Existed Meeting"
					onPress={() => { RootNavigation.navigate("ViewExistedMeetingScreen"); }}
					style={{ height: 60, width: 240, borderRadius: 20 }} messageStyle={{ fontSize: 18 }}
				>
					<MaterialCommunityIcons name="table-search" size={24} color='white' style={{ justifyContent: 'center', alignSelf: 'center', marginRight: 5 }} />
				</CustomButton>
			</View>
		</ShowComponentOrMessage>
	);
}
export default FindFreeTime;