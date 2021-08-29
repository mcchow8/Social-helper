import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import * as  LoadPostsFunctions from './LoadPostsFunctions';
import { Touchable, ignoreYellowBox } from '../CommonFunctions';
import * as RootNavigation from '../../RootNavigation';
import { FontAwesome5 } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';

const ExploreScreen = ({ navigation }) => {
	ignoreYellowBox();
	return (
		<View style={styles.exploreView}>
			<View style={styles.exploreViewHeader}>
				<View style={styles.exploreViewHeaderTitle}>
					<FontAwesome5 name="search-dollar" style={styles.exploreViewHeaderTitleIcon} />
					<Text style={styles.exploreViewHeaderTitleText}>Auction</Text>
				</View>
				<View style={styles.exploreViewHeaderRightView}>
					<Touchable onPress={() => { RootNavigation.navigate('SearchScreen'); }} background={['#c8c8c8', true, 30]}>
						<View style={styles.exploreViewHeaderRightViewButtons}>
							<FontAwesome name="search" style={styles.exploreViewHeaderRightViewButtonsIcons} />
						</View>
					</Touchable>
					<Touchable onPress={() => { navigation.openDrawer(); }} background={['#c8c8c8', true, 30]}>
						<View style={styles.exploreViewHeaderRightViewButtons}>
							<Octicons name="three-bars" style={styles.exploreViewHeaderRightViewButtonsIcons} />
						</View>
					</Touchable>
				</View>
			</View>
			<View style={styles.exploreViewLoadPost} >
				<LoadPostsFunctions.loadPost link="/post/" loc="explore" />
			</View>
		</View>
	);
}

export default ExploreScreen;

const styles = StyleSheet.create({
	exploreView: {
		marginTop: Constants.statusBarHeight,
		marginBottom: 54
	},
	exploreViewHeader: {
		paddingLeft: 10,
		paddingBottom: 10,
		paddingTop: 10,
		justifyContent: "space-between",
		borderBottomWidth: 1,
		borderColor: '#dfdfdf',
		flexDirection: "row",
		backgroundColor: "white"
	},
	exploreViewHeaderTitle: {
		justifyContent: 'flex-start',
		flexDirection: "row",
		marginLeft: 5
	},
	exploreViewHeaderTitleIcon: {
		marginTop: 5,
		marginRight: 2,
		alignSelf: 'center',
		fontSize: 21
	},
	exploreViewHeaderTitleText: {
		fontSize: 23,
		alignSelf: 'center',
		marginLeft: 5
	},
	exploreViewHeaderRightView: {
		flexDirection: "row"
	},
	exploreViewHeaderRightViewButtons: {
		width: 33,
		height: 33,
		marginRight: 15,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: "#e3e3e3",
		borderRadius: 30
	},
	exploreViewLoadPost: {
		height: Dimensions.get('window').height - 101 - Constants.statusBarHeight
	},
	exploreViewHeaderRightViewButtonsIcons: {
		fontSize: 20,
		color: 'black',
	}
});