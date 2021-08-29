import React, { useState, useEffect, useRef } from 'react';
import * as firebase from 'firebase';
import * as RootNavigation from '../../RootNavigation';
import { View, Text, ScrollView, TextInput, Dimensions, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Touchable, showToast, timeStampToString } from '../CommonFunctions';

const messageFrom = (usersId, userXId_userYId) => {
    const sendMessage = (message, usersId) => {
        let chatMessageData = {
            content: message,
            sender_uid: firebase.auth().currentUser.uid,
            time: firebase.database.ServerValue.TIMESTAMP
        };
        let newMessageKey = firebase.database().ref().child('chat/' + userXId_userYId + "/").push().key;
        let updates = {};
        updates['chat/' + userXId_userYId + "/" + newMessageKey] = chatMessageData;
        updates['user-chat-list/' + usersId[0] + "/" + usersId[1]] = chatMessageData;
        updates['user-chat-list/' + usersId[1] + "/" + usersId[0]] = chatMessageData;
        firebase.database().ref().update(updates).then(_ => {
            firebase.database().ref('chat/' + userXId_userYId + "/" + newMessageKey).once('value').then(
                (snapshot) => {
                    firebase.database().ref('chat/' + userXId_userYId + "/" + newMessageKey).update({ time: snapshot.val().time * -1 })
                }
            );
        })
    }
    const [message, setMessage] = useState("");
    return (
        <View style={{ ...styles.messageFromView }}>
            <View style={{ ...styles.messageFromViewView }}>
                <TextInput multiline style={{ ...styles.messageFromTextInput }} onChangeText={message => setMessage(message)} placeholder="Enter message" value={message} />
                <Touchable onPress={() => {
                    if (/[^ ]+/.test(message)) {
                        sendMessage(message, usersId);
                        setMessage("");
                    } else {
                        showToast("Please enter something", "warning", "OK", 1500);
                    }
                }} useForeground={true}>
                    <View style={{ ...styles.messageSendButton, }} >
                        <FontAwesome name="send" size={20} color="black" />
                    </View>
                </Touchable>
            </View>
        </View>
    )
}

const Triangle = (props) => {
    return <View style={props.style} />;
};

const ChatItem = (props) => {
    return (
        <View style={!props.user ? { ...styles.chatItemRowLeft, ...styles.chatItemRow } : { ...styles.chatItemRowRight, ...styles.chatItemRow }}>
            {!props.user && <Triangle style={styles.triangleLeft} />}
            <View style={!props.user ? { ...styles.chatItemViewLeft, ...styles.chatItemView } : { ...styles.chatItemViewRight, ...styles.chatItemView }}>
                <View style={styles.chatContentView}>
                    <Text style={styles.chatContent}>{props.item[1].content}</Text>
                </View>
                <View style={styles.chatItemViewTime}>
                    <Text style={styles.chatItemTime}>{timeStampToString(-props.item[1].time)}</Text>
                </View>
            </View>
            {props.user && <Triangle style={styles.triangleRight} />}
        </View>
    )
}

const LoadChat = (props) => {
    const [chatArray, setChatArray] = useState([]);
    const [runOnce, setRunOnce] = useState(false);
    const scroll = useRef(null);
    const [userXYProfilePictureObj, setUserXYProfilePictureObj] = useState({});
    const [chatUserNameObj, setChatUserNameObj] = useState({});
    useEffect(() => {
        if (runOnce === false) {
            getChat();
            setRunOnce(true);
        }
    }, []);
    const getChat = () => {
        firebase.database().ref("chat/" + props.userXId_userYId).orderByChild('time').on('value', (snapshot) => {
            let temp = [];
            snapshot.forEach((childSnapshot) => {
                temp = [...temp, [childSnapshot.key, childSnapshot.val()]];
            });
            setChatArray(temp);
        });
        /*
        props.usersId.forEach((userid) => {
            firebase.storage().ref().child("user_profile_picture/" + userid + "/user_profile_picture_200.jpg").getDownloadURL().then((url) => {
                //console.log(url)
                let temp = {};
                temp[childSnapshot.key] = url;
                setUserXYProfilePictureObj((prepvState) => {
                    return { ...prepvState, ...temp };
                });
            }).catch(() => {
            });
            firebase.database().ref("user/" + userid + "/username/userdata").once('value', (snapshot2) => {
                setChatUserNameObj((prepvState) => {
                    let temp = {};
                    temp[childSnapshot.key] = snapshot2.val();
                    return { ...prepvState, ...temp };
                });
            }).catch(() => {
            });
        })

        .slice(0).reverse()
        */
    }

    return (
        <ScrollView ref={scroll}
            onContentSizeChange={(contentWidth, contentHeight) => {
                scroll.current.scrollToEnd({ animated: false });
            }}
            style={{ ...styles.scrollView }}
        /*contentContainerStyle={{ ...styles.scrollView, }}*/
        >
            {
                chatArray && [...Array(chatArray.length).keys()].map((value, index) => {
                    return (
                        <ChatItem key={chatArray.length - 1 - index} item={chatArray[chatArray.length - 1 - index]} user={chatArray[chatArray.length - 1 - index][1].sender_uid === props.usersId[0]} />
                    );
                })
            }
        </ScrollView>
    );
}
const ChatScreen = (props) => {
    const usersId = [firebase.auth().currentUser.uid, props.route.params[0]];
    const stringCompare = (uid1, uid2) => {
        let result = false;
        for (let i = 0; i < uid1.length; i++) {
            if (uid1[i] > uid2[i]) {
                result = true;
                break;
            } else if (uid1[i] < uid2[i]) {
                result = false;
                break;
            }
        }
        return result;
    }
    const userXId_userYId = stringCompare(usersId[0], usersId[1]) ? usersId[0] + "-" + usersId[1] : usersId[1] + '-' + usersId[0];
    return (
        <>
            <LoadChat usersId={usersId} userXId_userYId={userXId_userYId} />
            {messageFrom(usersId, userXId_userYId)}
        </>
    );
}
export default ChatScreen;

const styles = StyleSheet.create({
    messageFromView: {
        width: Dimensions.get('window').width,
        borderColor: 'lightgrey',
        borderTopWidth: 1,
        backgroundColor: 'white',
        padding: 5
    },
    messageSendButton: {
        height: 33,
        width: 33,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 33
    },
    messageFromViewView: {
        alignItems: 'center',
        alignItems: 'stretch',
        borderRadius: 15,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        flexDirection: 'row',
        backgroundColor: 'whitesmoke'
    },
    messageFromTextInput: {
        flex: 9,
        textAlignVertical: "top",
        fontSize: 23
    },
    triangleLeft: {
        borderLeftWidth: 10,
        borderBottomWidth: 20,
        borderBottomColor: "transparent",
        borderLeftColor: "transparent",
        transform: [{ rotate: "270deg" }],
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderBottomColor: "white",
        marginTop: 0.1
    },
    triangleRight: {
        borderRightWidth: 10,
        borderBottomWidth: 20,
        borderBottomColor: "transparent",
        borderRightColor: "transparent",
        transform: [{ rotate: "90deg" }],
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderBottomColor: "white",
        marginTop: 0.5
    },
    scrollView: {
        height: Dimensions.get('window').height,
        backgroundColor: 'rgba(128,128,128,0.05)',
    },
    chatItemRow: {
        flexDirection: 'row',
    },
    chatItemRowLeft: {
        alignSelf: 'flex-start',
        marginLeft: 10,
    },
    chatItemRowRight: {
        alignSelf: 'flex-end',
        marginRight: 10,
    },
    chatItemView: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        marginTop: 5,
        marginBottom: 5,
        padding: 5,
    },
    chatItemViewLeft: {
        borderTopRightRadius: 5,
        marginRight: 10,
    },
    chatItemViewRight: {
        borderTopLeftRadius: 5,
        marginLeft: 10,
    },
    chatContentView: {
    },
    chatContent: {
        fontSize: 18
    },
    chatItemViewTime: {
    },
    chatItemTime: {
        fontSize: 12,
        color: 'rgba(128,128,128,0.7)',
    },
});
