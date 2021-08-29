import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ExploreScreen from './auctionScreens/ExploreScreen';
import SellScreen from './auctionScreens/SellScreen';
import MyselfScreen from './auctionScreens/MyselfScreen';
import * as firebase from 'firebase';
import { FontAwesome5 } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/*for Auction*/
const Auction = createBottomTabNavigator();

const Auctions = () => {
  return (
    <Auction.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconColor = (focused ? 'dodgerblue' : 'gray');
        if (route.name === 'Myself') {
          return (<AntDesign name="user" size={24} color={iconColor} />);
        } else if (route.name === 'Sell') {
          return (<MaterialCommunityIcons name="post-outline" size={35} color={iconColor} style={{ marginBottom: 7 }} />);
        } else if (route.name === 'Explore') {
          return (<FontAwesome5 name="search-dollar" size={20} color={iconColor} />);
        }
      },
    })}
      tabBarOptions={{
        activeTintColor: 'dodgerblue',
        inactiveTintColor: 'gray',
      }}
    >
      <Auction.Screen name="Explore" component={ExploreScreen} />
      <Auction.Screen name="Sell" component={SellScreen} />
      <Auction.Screen name="Myself" component={MyselfScreen} />
    </Auction.Navigator>
  );
}
export default Auctions;