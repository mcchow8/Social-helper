import React, { useState, useEffect } from "react";
import { auth, storage, database } from "../firebase";
import { timeStampToString } from "../common";
import proPic from '../assets/UserProPic.jpg';

const LeftChatList = (props) => {
    const [chatListArray, setChatListArray] = useState([]);
    const [chatListUserNameObj, setChatListUserNameObj] = useState({});
    const [chatListProfilePictureObj, setChatListProfilePictureObj] = useState({});
    const [chatListUserUidObj, setChatListUserUidObj] = useState({});
    const [chatListNewUserObj, setChatListNewUserObj] = useState({});
    useEffect(() => {
        if (props.newChatUserId !== undefined && !chatListUserUidObj.hasOwnProperty(props.newChatUserId)) {
            let temp = {}
            database.ref("user/" + props.newChatUserId).once('value', (snapshot) => {
                temp[snapshot.key] = { name: snapshot.val()['username']['userdata'] }
                storage.ref().child("user_profile_picture/" + snapshot.key + "/user_profile_picture_200.jpg").getDownloadURL().then((url) => {
                    temp[snapshot.key] = { proPic: url }
                }).catch(() => { });
            })
            setChatListNewUserObj(temp)
            console.log(chatListNewUserObj)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.newChatUserId])

    useEffect(() => {
        if (props.loginState === true) {
            database.ref("user-chat-list/" + auth.currentUser.uid).orderByChild('time').on('value', (snapshot) => {
                let temp = [];
                snapshot.forEach((childSnapshot) => {
                    setChatListUserUidObj((p) => ({ ...p, [childSnapshot.key]: true }))
                    temp = [...temp, [childSnapshot.key, childSnapshot.val()]];
                    if (!chatListProfilePictureObj.hasOwnProperty(childSnapshot.key)) {
                        storage.ref().child("user_profile_picture/" + childSnapshot.key + "/user_profile_picture_200.jpg").getDownloadURL().then((url) => {
                            let temp = {};
                            temp[childSnapshot.key] = url;
                            setChatListProfilePictureObj((prepvState) => {
                                return { ...prepvState, ...temp };
                            });
                        }).catch(() => { });
                    }
                    if (!chatListUserNameObj.hasOwnProperty(childSnapshot.key)) {
                        database.ref("user/" + childSnapshot.key + "/username/userdata").once('value', (snapshot2) => {
                            setChatListUserNameObj((prepvState) => {
                                let temp = {};
                                temp[childSnapshot.key] = snapshot2.val();
                                return { ...prepvState, ...temp };
                            });
                        }).catch((err) => {
                        });
                    }
                });
                setChatListArray(temp);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.loginState]);

    const ChatUserView = (props) => {
        return (
            <div
                key={props.index}
                style={{ ...styles.chatListItem, ...(props.viewChatObj.hasOwnProperty("uid") && props.viewChatObj.uid === props.uid ? { backgroundColor: '#b8b8b8' } : {}) }}
                onClick={() => {
                    let temp = {};
                    temp["uid"] = props.uid;
                    if (props.index !== 0) {
                        if (chatListProfilePictureObj.hasOwnProperty(props.uid)) {
                            temp["proPic"] = chatListProfilePictureObj[props.uid];
                        }
                        if (chatListUserNameObj.hasOwnProperty(props.uid)) {
                            temp["name"] = chatListUserNameObj[props.uid];
                        }
                        props.callBack(temp)
                    } else {
                        if (props.newUser.hasOwnProperty(props.uid)) {
                            if (props.newUser[props.uid].hasOwnProperty("proPIc")) {
                                temp["proPic"] = props.newUser[props.uid].proPIc;
                            }
                            if (props.newUser[props.uid].hasOwnProperty("name")) {
                                temp["temp"] = props.newUser[props.uid].name;
                            }
                        }
                        props.callBack(temp)
                    }
                }}
            >
                <div style={styles.proPicDiv}>
                    <img
                        src={
                            props.hasOwnProperty("newUser") ?
                                props.newUser.hasOwnProperty(props.uid) ?
                                    props.newUser[props.uid].hasOwnProperty("proPic") ?
                                        props.newUser[props.uid].proPic
                                        :
                                        proPic
                                    :
                                    proPic
                                :
                                chatListProfilePictureObj.hasOwnProperty(props.uid)
                                    ?
                                    chatListProfilePictureObj[props.uid]
                                    :
                                    proPic
                        }
                        alt="ProPic of user."
                        style={styles.proPic}
                    />
                </div>
                <div style={styles.nameAndContentDiv}>
                    <p style={styles.nameText}>
                        {
                            props.hasOwnProperty("newUser") ?
                                props.newUser.hasOwnProperty(props.uid) ?
                                    props.newUser[props.uid].hasOwnProperty("name") ?
                                        props.newUser[props.uid].name
                                        :
                                        ""
                                    : ""
                                :
                                chatListUserNameObj.hasOwnProperty(props.uid)
                                    ?
                                    chatListUserNameObj[props.uid]
                                    :
                                    ""
                        }
                    </p>
                    <p style={styles.contentText}>
                        {
                            (
                                props.senderUid !== props.uid && props.senderUid !== ""
                                    ?
                                    "You: "
                                    :
                                    ""
                            ) + props.content
                        }
                    </p>
                </div>
                <div style={styles.timeDiv}>
                    <p style={styles.timeText}>
                        {
                            props.time === ""
                                ?
                                ""
                                :
                                timeStampToString(props.time, 'hm')
                        }
                    </p>
                    <p style={styles.timeText}>
                        {
                            props.time === ""
                                ?
                                ""
                                :
                                timeStampToString(props.time, 'dmy')
                        }
                    </p>
                </div>
            </div>
        )
    }
    return (
        [...Array(chatListArray.length + 1)].map((value, index) => {
            let i = chatListArray.length - index;//-1
            if (index !== 0) {
                return (
                    <ChatUserView index={index} uid={chatListArray[i][0]} time={chatListArray[i][1].time} content={chatListArray[i][1].content} senderUid={chatListArray[i][1].sender_uid} viewChatObj={props.viewChatObj} callBack={props.callBack} />
                );
            } else if (props.newChatUserId !== undefined && !chatListUserUidObj.hasOwnProperty(props.newChatUserId)) {
                return (
                    <ChatUserView index={index} uid={props.newChatUserId} time={""} content={""} senderUid={""} viewChatObj={props.viewChatObj} newUser={chatListNewUserObj} callBack={props.callBack} />
                );
            } else {
                return (<></>)
            }
        })
    );
}

const MessageInput = (props) => {
    const sendMessage = (message, usersId) => {
        let chatMessageData = {
            content: message,
            sender_uid: auth.currentUser.uid,
            time: ((new Date()).getTime())
        };
        let newMessageKey = database.ref().child('chat/' + props.userXId_userYId + "/").push().key;
        let updates = {};
        updates['chat/' + props.userXId_userYId + "/" + newMessageKey] = chatMessageData;
        updates['user-chat-list/' + usersId[0] + "/" + usersId[1]] = chatMessageData;
        updates['user-chat-list/' + usersId[1] + "/" + usersId[0]] = chatMessageData;
        database.ref().update(updates).then(_ => {
            database.ref('chat/' + props.userXId_userYId + "/" + newMessageKey).once('value').then(
                (snapshot) => {
                    database.ref('chat/' + props.userXId_userYId + "/" + newMessageKey).update({ time: snapshot.val().time * -1 })
                }
            );
        })
    }
    const [message, setMessage] = useState("");
    const handleSendMessage = () => {
        if (/[^ ]+/.test(message)) {
            sendMessage(message, props.usersId);
            setMessage("");
        }
    }
    return (
        <div style={styles.inputDiv}>
            <div
                style={styles.inputForm}
            >
                <div
                    style={styles.formInputDiv}
                >
                    <input
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                handleSendMessage()
                            }
                        }}
                        onChange={(newMessage) => {
                            setMessage(newMessage.target.value)
                        }}
                        value={message}
                        type="text"
                        name="message"
                        style={styles.input}
                    />
                </div>
                <div
                    style={styles.submitDiv}
                >
                    <img
                        onClick={() => {
                            handleSendMessage()
                        }}
                        alt=""
                        style={styles.submit}
                        src={'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNDk2LjAwOSA0OTYuMDA5IiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDQ5Ni4wMDkgNDk2LjAwOSIgd2lkdGg9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtNDc1LjAxNS44MTUtNDY0IDE1MS42MTdjLTEzLjEwNCA0LjI4Mi0xNC45OTkgMjIuMTA2LTMuMDczIDI5LjA0bDE3NS4zNSAxMDEuOTYzYzUuNTMyIDMuMjE3IDEyLjQ0NiAyLjgyOSAxNy41ODItLjk4Nmw0OS4yOTItMzYuNjA2LTM2LjYwNiA0OS4yOTJjLTMuODE0IDUuMTM3LTQuMjAyIDEyLjA1Mi0uOTg2IDE3LjU4M2wxMDEuOTYzIDE3NS4zNWM2Ljk0MiAxMS45MzYgMjQuNzYyIDEwLjAyIDI5LjA0MS0zLjA3M2wxNTEuNjE3LTQ2NGM0LjA2Ny0xMi40NTktNy43ODItMjQuMjM0LTIwLjE4LTIwLjE4em0tMTUwLjc2NiA0NDAuMjk3LTc4LjcxMi0xMzUuMzY1IDk0LjkxMy0xMjcuODA1YzQuNzI5LTYuMzcgNC4wNzgtMTUuMjQzLTEuNTMyLTIwLjg1My01LjYwOS01LjYxLTE0LjQ4NC02LjI2Mi0yMC44NTMtMS41MzJsLTEyNy44MDUgOTQuOTE0LTEzNS4zNjQtNzguNzEzIDQwMC4wODctMTMwLjczM3ptLTE1Ni4yNTgtOTAuNDY4LTEwNi4yMzggMTA2LjIzN2MtNi4yNDggNi4yNDctMTYuMzc5IDYuMjQ5LTIyLjYyNyAwLTYuMjQ5LTYuMjQ4LTYuMjQ5LTE2LjM3OSAwLTIyLjYyN2wxMDYuMjM4LTEwNi4yMzdjNi4yNS02LjI0NyAxNi4zODEtNi4yNDkgMjIuNjI3IDAgNi4yNDkgNi4yNDggNi4yNDkgMTYuMzc5IDAgMjIuNjI3em0tMTQwLjM0OSA0LjAyYy02LjI0OS02LjI0OS02LjI0OS0xNi4zNzkgMC0yMi42MjdsNDEuOTItNDEuOTIxYzYuMjQ4LTYuMjQ5IDE2LjM3OS02LjI0OSAyMi42MjcgMCA2LjI0OSA2LjI0OSA2LjI0OSAxNi4zNzkgMCAyMi42MjdsLTQxLjkyIDQxLjkyMWMtNi4yNDcgNi4yNDctMTYuMzc5IDYuMjQ4LTIyLjYyNyAwem0xNzguMjUgNDkuMTU0YzYuMjQ5IDYuMjQ4IDYuMjQ5IDE2LjM3OSAwIDIyLjYyN2wtNDEuOTIxIDQxLjkyYy0zLjEyNCAzLjEyNS03LjIxOSA0LjY4Ny0xMS4zMTMgNC42ODctMTQuMTI3IDAtMjEuNDIxLTE3LjIwNy0xMS4zMTMtMjcuMzE0bDQxLjkyMS00MS45MmM2LjI0Ny02LjI0OSAxNi4zNzgtNi4yNDkgMjIuNjI2IDB6Ii8+PC9zdmc+'}
                    />
                </div>
            </div>
        </div>
    );
}

const ChatScreen = (props) => {
    const [chatArray, setChatArray] = useState([]);
    const [savedViewChatObj, setSavedViewChatObj] = useState(null);
    useEffect(() => {
        if (props.viewChatObj !== savedViewChatObj) {
            const stringCompare = (uid1, uid2) => {
                let result = false;
                for (let i = 0; i < uid1.length; i++) {
                    if (uid1[i] > uid2[i]) {
                        result = true;
                        break;
                    } else if (uid1[i] < uid2) {
                        result = false;
                        break;
                    }
                }
                return result;
            }
            let tempString = stringCompare(props.usersId[0], props.usersId[1]) ? props.usersId[0] + "-" + props.usersId[1] : props.usersId[1] + '-' + props.usersId[0];
            database.ref("chat/" + tempString).orderByChild('time').on('value', (snapshot) => {
                let temp = [];
                snapshot.forEach((childSnapshot) => {
                    temp = [...temp, [childSnapshot.key, childSnapshot.val()]];
                });
                setChatArray(temp);
            });
            props.callBackSetUserXId_userYId(tempString);
            setSavedViewChatObj(props.viewChatObj)
        }
        // eslint-disable-next-line
    }, [props.viewChatObj]);

    return (
        chatArray.map((value, index) => {
            return (
                <MessageItem
                    key={index}
                    item={value}
                    user={value[1].sender_uid === props.usersId[0]}
                />
            );
        })
    );
}

const MessageItem = (props) => {
    return (
        <div style={!props.user ? { ...styles.messageItemRowLeft, ...styles.messageItemRow } : { ...styles.messageItemRowRight, ...styles.messageItemRow }}>
            {!props.user && <div style={styles.triangleLeft} />}
            <div style={!props.user ? { ...styles.messageItemViewLeft, ...styles.messageItemView } : { ...styles.messageItemViewRight, ...styles.messageItemView }}>
                <div style={styles.messageContentView}>
                    <p style={styles.messageContent}>{props.item[1].content}</p>
                </div>
                <div style={styles.messageItemViewTime}>
                    <p style={styles.messageItemTime}>{timeStampToString(-props.item[1].time)}</p>
                </div>
            </div>
            {props.user && <div style={styles.triangleRight} />}
        </div>
    )
}

const ChatList = (props) => {
    const [loginState, setLoginState] = useState(auth.currentUser !== null);
    // eslint-disable-next-line
    const [newChatUserId, setNewChatUserId] = useState(window.location.pathname.split('/')[2]);
    const [viewChatObj, setViewChatObj] = useState({});
    const [runOnce, setRunOnce] = useState(false);
    const [userXId_userYId, setUserXId_userYId] = useState("");

    useEffect(() => {
        if (!runOnce) {
            auth.onAuthStateChanged(userAuth => {
                setLoginState(userAuth ? true : false);
            });
            setRunOnce(true);
        }
    }, [runOnce]);

    return (
        <div style={styles.container}>
            <div style={styles.leftSubContainer}>
                <div style={styles.chatList}>
                    <LeftChatList loginState={loginState} viewChatObj={viewChatObj} callBack={(obj) => { setViewChatObj(obj) }} newChatUserId={newChatUserId} />
                </div>
            </div>
            <div style={styles.rightSubContainer}>
                {
                    viewChatObj.hasOwnProperty("uid")
                        ?
                        <div style={styles.messageAndInputContainer}>
                            <div style={styles.messageContainer}>
                                <ChatScreen
                                    loginState={loginState}
                                    viewChatObj={viewChatObj}
                                    usersId={[loginState ? auth.currentUser.uid : "", viewChatObj.hasOwnProperty("uid") ? viewChatObj.uid : ""]}
                                    callBackSetUserXId_userYId={(newUserXId_userYId) => { setUserXId_userYId(newUserXId_userYId) }}
                                />
                            </div>
                            <MessageInput
                                usersId={[loginState ? auth.currentUser.uid : "", viewChatObj.hasOwnProperty("uid") ? viewChatObj.uid : ""]}
                                userXId_userYId={userXId_userYId}
                            />
                        </div>
                        :
                        null
                }
            </div>
        </div>
    );
}

export default ChatList;

const styles = {
    container: {
        flex: 1,
        flexDirection: 'row',
        display: 'flex',
        height: 'calc( 100vh - 64px )'
    },
    leftSubContainer: {
        flex: 7,
        borderRightColor: '#c8c8c8',
        borderRightStyle: 'solid',
        borderRightWidth: 1,
        display: 'flex',
    },
    chatList: {
        display: 'flex',
        overflow: 'auto',
        flex: 1,
        maxHeight: '100%',
        flexDirection: 'column',
    },
    rightSubContainer: {
        flex: 14,
        display: 'flex',
    },
    messageAndInputContainer: {
        display: 'flex',
        flexDirection: 'column',
        flex: 14
    },
    messageContainer: {
        backgroundColor: '#ddd',
        overflow: 'auto',
        flexDirection: 'column-reverse',
        display: 'flex',
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 20,
        flex: 20
    },
    inputDiv: {
        flex: 1,
        borderTopStyle: 'solid',
        borderTopWidth: 1,
        borderTopColor: '#bbb',
        backgroundColor: '#bbb',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'cneter'
    },
    inputForm: {
        padding: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'cneter',
        width: '100%',
    },
    formInputDiv: {
        borderRadius: 50,
        backgroundColor: '#eee',
        width: '100%',
        paddingLeft: 20,
        paddingRight: 20,
        padding: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'cneter',
    },
    input: {
        width: 'calc( 100% - 20px )',
        backgroundColor: '#eee',
        borderWidth: 0,
    },
    submitDiv: {
        marginLeft: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'cneter',
        alignSelf: 'center',
        backgroundColor: '#eee',
        borderRadius: 50,
    },
    submit: {
        width: 35,
        height: 35,
        padding: 6,
        borderWidth: 0,
        alignSelf: 'cneter',
        display: 'flex',
        filter: "drop-shadow(0px 0px 0px rgba(170,170,170,1))",
    },
    chatListItem: {
        height: 100,
        display: "flex",
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomColor: '#c8c8c8',
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
    },
    proPicDiv: {
        padding: 10,
    },
    proPic: {
        height: 80,
        width: 80,
        borderRadius: 50,
        boxShadow: "0px 0px 5px 1px #aaa",
    },
    nameAndContentDiv: {
        flex: 10,
        height: 100
    },
    nameText: {
        paddingLeft: 5,
        fontSize: 22,
        marginBottom: 0,
        marginTop: 10
    },
    contentText: {
        marginBottom: 0,
        fontSize: 18,
        paddingLeft: 5,
        color: '#555'
    },
    timeDiv: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'center',
        padding: 10,
    },
    timeText: {
        marginBottom: 0,
        fontSize: 14,
        color: '#555'
    },
    messageItemRow: {
        flexDirection: 'row',
    },
    messageItemRowLeft: {
        alignSelf: 'flex-start',
        marginLeft: 10,
        display: ' flex',
        filter: "drop-shadow(0px 0px 3px rgba(170,170,170,1))",
    },
    messageItemRowRight: {
        alignSelf: 'flex-end',
        marginRight: 10,
        display: ' flex',
        filter: "drop-shadow(0px 0px 3px rgba(170,170,170,1))",
    },
    messageItemView: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        marginTop: 5,
        marginBottom: 5,
        padding: 5,
    },
    messageItemViewLeft: {
        borderTopRightRadius: 5,
        marginRight: 10,
    },
    messageItemViewRight: {
        borderTopLeftRadius: 5,
        marginLeft: 10,
    },
    messageContentView: {
    },
    messageContent: {
        fontSize: 18,
        paddingLeft: 5,
        paddingRight: 5
    },
    messageItemViewTime: {
        paddingLeft: 5,
        paddingRight: 5
    },
    messageItemTime: {
        fontSize: 12,
        color: 'rgba(128,128,128,0.7)',
        marginBottom: 0,
    },
    triangleLeft: {
        marginTop: 5,
        width: 0,
        height: 0,
        borderTop: "0px solid transparent",
        borderRight: "20px solid white",
        borderBottom: "10px solid transparent",
    },
    triangleRight: {
        marginTop: 5,
        width: 0,
        height: 0,
        borderTop: "0px solid transparent",
        borderLeft: "20px solid white",
        borderBottom: "10px solid transparent",
    },
};

