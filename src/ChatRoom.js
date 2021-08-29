import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import * as firebase from 'firebase';
import * as RootNavigation from '../RootNavigation';
import { ShowComponentOrMessage, timeStampToString, Touchable, replaceAll } from './CommonFunctions';
import Constants from 'expo-constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ChatListItem = (props) => {
    return (
        <Touchable onPress={() => {
            RootNavigation.navigate("ChatScreen", [props.item[0], props.userName]);
        }}>
            <View style={styles.chatListItemView}>
                <View style={styles.chatListItemImageView}>
                    <Image source={props.proPic !== null ? { uri: props.proPic } : require('../assets/UserProPic.jpg')} style={styles.chatListItemViewImage} />
                </View>
                <View style={styles.chatListItemNameAndContent}>
                    <Text style={styles.chatListName}>{props.userName}</Text>
                    <View style={styles.chatListContentView}>
                        <Text style={styles.chatListContent}>
                            {
                                (
                                    props.item[1] && props.item[1].sender_uid === firebase.auth().currentUser.uid
                                        ?
                                        "You: "
                                        :
                                        ""
                                )
                                +
                                (
                                    props.item[1] && props.item[1].content.length >= 13
                                        ?
                                        replaceAll(props.item[1].content.slice(0, 10), "\n", " ") + '...'
                                        :
                                        replaceAll(props.item[1].content, "\n", " ")
                                )
                            }
                        </Text>
                    </View>
                </View>
                <View style={styles.chatListItemViewTime}>
                    <Text style={styles.chatListItemTime}>{timeStampToString(props.item[1].time)}</Text>
                </View>
            </View>
        </Touchable>
    );
}

const ChatList = (props) => {
    const [chatListArray, setChatListArray] = useState([]);
    const [runOnce, setRunOnce] = useState(false);
    const [chatListProfilePictureObj, setChatListProfilePictureObj] = useState({});
    const [chatListUserNameObj, setChatListUserNameObj] = useState({});
    useEffect(() => {
        if (runOnce === false) {
            getChatList();
            setRunOnce(true);
        }
    }, []);
    const getChatList = () => {
        firebase.database().ref("user-chat-list/" + firebase.auth().currentUser.uid).orderByChild('time').on('value', (snapshot) => {
            let temp = [];
            snapshot.forEach((childSnapshot) => {
                temp = [...temp, [childSnapshot.key, childSnapshot.val()]];
                //setChatListArray((prepvState) => [...prepvState, [childSnapshot.key, childSnapshot.val()]]);
                if (!chatListProfilePictureObj.hasOwnProperty(childSnapshot.key)) {
                    firebase.storage().ref().child("user_profile_picture/" + childSnapshot.key + "/user_profile_picture_200.jpg").getDownloadURL().then((url) => {
                        //console.log(url)
                        let temp = {};
                        temp[childSnapshot.key] = url;
                        setChatListProfilePictureObj((prepvState) => {
                            return { ...prepvState, ...temp };
                        });
                    }).catch(() => {
                    });
                }
                if (!chatListUserNameObj.hasOwnProperty(childSnapshot.key)) {
                    firebase.database().ref("user/" + childSnapshot.key + "/username/userdata").once('value', (snapshot2) => {
                        setChatListUserNameObj((prepvState) => {
                            let temp = {};
                            temp[childSnapshot.key] = snapshot2.val();
                            return { ...prepvState, ...temp };
                        });
                    }).catch(() => {
                    });
                }
            });
            setChatListArray(temp);
        });
    }
    return (
        <ScrollView style={styles.scrollView}>
            {
                chatListArray && chatListArray.slice(0).reverse().map((value, index) => {
                    return (
                        <ChatListItem key={index} item={value}
                            proPic={
                                chatListProfilePictureObj.hasOwnProperty(value[0])
                                    ?
                                    chatListProfilePictureObj[value[0]]
                                    :
                                    null
                            }
                            userName={
                                chatListUserNameObj.hasOwnProperty(value[0])
                                    ?
                                    chatListUserNameObj[value[0]]
                                    :
                                    ""
                            } />
                    );
                })
            }
        </ScrollView>
    );
}

const ChatRoomScreen = () => {
    return (
        <ShowComponentOrMessage message="Please login to use chat room.">
            <View style={{ marginTop: Constants.statusBarHeight, marginBottom: 54 }}>
                <View style={{ paddingLeft: 10, paddingBottom: 10, paddingTop: 10, justifyContent: "space-between", borderBottomWidth: 1, borderColor: '#dfdfdf', flexDirection: "row", backgroundColor: "white" }}>
                    <View style={{ justifyContent: 'flex-start', flexDirection: "row", marginLeft: 5 }}>
                        <MaterialCommunityIcons name="message-outline" size={21} style={{ marginTop: 5, marginRight: 2, alignSelf: 'center' }} />
                        <Text style={{ fontSize: 23, alignSelf: 'center', marginLeft: 5 }}>Chat</Text>
                    </View>
                </View>
                <View style={{ height: Dimensions.get('window').height - 54 - Constants.statusBarHeight }} >
                    <ChatList />
                </View>
            </View>
        </ShowComponentOrMessage>
    );
}

export default ChatRoomScreen;

const styles = StyleSheet.create({
    chatListItemView: {
        flexDirection: "row",
        flex: 100,
        height: 110,
    },
    chatListItemImageView: {
        flex: 25,
        margin: 5,
        borderRadius: 1000,
    },
    chatListItemViewImage: {
        height: 90,
        width: 90,
        borderRadius: 1000
    },
    chatListItemNameAndContent: {
        height: 110,
        flex: 50,
        alignSelf: 'auto',
        borderColor: 'rgba(128,128,128,0.3)',
        borderBottomWidth: 0.6,
    },
    chatListContentView: {
        height: 50,
        marginBottom: 10,
        bottom: 0,
    },
    chatListContent: {
        fontSize: 18,
        color: 'rgba(100,100,100,1)',
    },
    chatListName: {
        height: 30,
        marginTop: 20,
        fontSize: 23,
        top: 0,
    },
    chatListItemViewTime: {
        flex: 25,
        borderColor: 'rgba(128,128,128,0.3)',
        borderBottomWidth: 0.6,
    },
    chatListItemTime: {
        paddingTop: 30,
        color: 'rgba(128,128,128,0.7)',
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'white',
    }
});