import *as React from 'react';
/*for creating Navigation container for placing Navigator*/
import { NavigationContainer } from '@react-navigation/native';
/*used for firebase*/
import * as firebase from 'firebase';
import FirebaseLogin from './src/FirebaseLogin';
/*used Drawer Navigator for side menu*/
import { createDrawerNavigator } from '@react-navigation/drawer';
/*used for Auction screen*/
import Auction from './src/Auction';
import FindFreeTime from './src/FindFreeTime';
import AboutScreen from './src/About';
import ChatRoomScreen from './src/ChatRoom';
/*used for login screen*/
import LoginScreen from './src/LoginScreen';
import SearchScreen from './src/auctionScreens/SearchScreen';
import CreateMeetingScreen from './src/fftScreens/CreateMeetingScreen';
import ViewExistedMeetingScreen from './src/fftScreens/ViewExistedMeetingScreen';
import ChatScreen from './src/chatroomScreens/ChatScreen';
/*used for signup screen*/
import SignUpScreen from './src/SignUpScreen';
/*used for side menu*/
import SideMenu from './src/SideMenu';
import EditUserInfoScreen from './src/EditUserInfoScreen';
import MultiPhotosSelection from './src/auctionScreens/MultiPhotosSelection';
import { OtherUsers } from './src/auctionScreens/MyselfScreen';
import LoadPostAndComments from './src/auctionScreens/LoadPostAndCommentsFunctions';
/*used stack Navigator*/
import { createStackNavigator } from '@react-navigation/stack';
/*root navigation is for Navigating in some class which is hard to send props into it.*/
import { navigationRef } from './RootNavigation';
/*ignore the warning of setting a timer.*/
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Animated: `useNativeDriver`']);
YellowBox.ignoreWarnings(['Setting a timer']);
YellowBox.ignoreWarnings(['Warning: Can\'t perform a React state update on an unmounted component. ']);
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Root } from "native-base";
import * as Font from 'expo-font';
/*StackNavigator is for placing the login and signup screen which is not being displayed after logined*/
const RootStack = createStackNavigator();

/*if any screen is needed to be displayed in the sidemenu, it should be placed inside the function belowed. */
const Drawer = createDrawerNavigator();
const MainDrawerScreen = () => {
	return (
		<Drawer.Navigator lazy='false'
			drawerContent={(props) => (
				<SideMenu{...props} bool={firebase.auth().currentUser} />
			)}
			screenOptions={({ route }) => ({
				drawerIcon: ({ focused, color, size }) => {
					let iconColor = (focused ? 'dodgerblue' : 'gray');
					if (route.name === 'Auction') {
						return (<FontAwesome5 name="search-dollar" size={20} color={iconColor} />);
					} else if (route.name === 'About') {
						return (<MaterialCommunityIcons name={!focused ? "information-outline" : "information"} size={24} color={iconColor} />);
					} else if (route.name === 'Find Free Time') {
						return (<MaterialCommunityIcons name="timetable" size={24} color={iconColor} />);
					} else if (route.name === "Chat Room") {
						return (<MaterialCommunityIcons name={!focused ? "message-outline" : "message"} size={24} color={iconColor} />);
					}
				},
			})}
			drawerContentOptions={{
				activeTintColor: 'dodgerblue',
				inactiveTintColor: 'gray',
			}}
		>
			<Drawer.Screen name="Auction" component={Auction} />
			<Drawer.Screen name="Find Free Time" component={FindFreeTime} />
			<Drawer.Screen name="Chat Room" component={ChatRoomScreen} />
			<Drawer.Screen name="About" component={AboutScreen} />
		</Drawer.Navigator>
	);
}

/*this is the function that return the main app structrue of Navigator*/
const App = () => {
	{/* A nested navigation structrue is uesd*/ }
	{/* A Drawer navigation, as a sidemenu is ouside. Auction is function return a bottom-tabs navigation */ }
	{/* Login and SignUp actually are classes that extend React.Component. They are screen of login and signup page. */ }
	React.useEffect(() => {
		(async () => await Font.loadAsync({
			Roboto: require('native-base/Fonts/Roboto.ttf'),
			Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
		}))();
	}, [])
	return (
		<Root>
			<NavigationContainer ref={navigationRef}>
				<RootStack.Navigator  >
					<RootStack.Screen name="MainDrawerScreen" options={{ headerShown: false }} component={MainDrawerScreen} />
					<RootStack.Screen name="Login" component={LoginScreen} />
					<RootStack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Sign Up' }} />
					<RootStack.Screen name="PhotosSelection" component={MultiPhotosSelection} options={{ headerStyle: { height: Constants.statusBarHeight }, headerTintColor: 'rgba(0,0,0,0)' }} />
					<RootStack.Screen name="EditUserInfoScreen" component={EditUserInfoScreen} options={{ title: 'Edit User Information' }} />
					<RootStack.Screen name="OtherUsers" component={OtherUsers} options={{ title: 'User Information' }} />
					<RootStack.Screen name="LoadPostAndComments" component={LoadPostAndComments} options={{ title: 'Post' }} />
					<RootStack.Screen name="SearchScreen" component={SearchScreen} options={{ headerShown: false }} />
					<RootStack.Screen name="CreateMeetingScreen" component={CreateMeetingScreen} options={{ title: 'Create New Meeting' }} />
					<RootStack.Screen name="ViewExistedMeetingScreen" component={ViewExistedMeetingScreen} options={{ title: 'View Existed Meeting' }} />
					<RootStack.Screen name="ChatScreen" component={ChatScreen} options={({ route }) => ({ title: route.params[1] })} />

				</RootStack.Navigator>
			</NavigationContainer>
		</Root>
	);
};
export default App;