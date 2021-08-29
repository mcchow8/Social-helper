import React, { useState, useEffect } from "react";
import Modal from '@material-ui/core/Modal';
import { auth, database } from "../firebase";
import { timeStampToString } from "../common";

import {
    Link,
    useRouteMatch,
  } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles((theme) => ({
    root: {
      minWidth: 275,
    },
    root_fab: {
      '& > *': {
        margin: theme.spacing(1),
        right: 20,
        bottom: 10,
        position: 'fixed',
      },
    },
    mainFeaturedPost: {
      position: 'relative',
      backgroundColor: theme.palette.grey[800],
      color: theme.palette.common.white,
      marginBottom: theme.spacing(4),
      backgroundImage: 'url(https://source.unsplash.com/random)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,.3)',
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
    mainFeaturedPostContent: {
      position: 'relative',
      padding: theme.spacing(3),
      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(6),
        paddingRight: 0,
      },
    },
  }));

export const uploadTimeTable = async (typeOrKey, tableData, startDate, startTime, endDate, endTime, timeLength, validEmail, meetingName) => {
    if (typeOrKey === 'new') {
        let emailObj = {};
        for (let i = 0; i < validEmail.length; i++) {
            emailObj[validEmail[i].replaceAll(".", "\\")] = true;
        }
        let newTableData = {};
        for (const i in tableData) {
            for (const j in tableData[i]) {
                let temp = {}
                temp[j.replaceAll(".", "\\")] = true;
                newTableData[i] = temp;
            }
        }
        let myEmail = auth.currentUser.email.replaceAll(".", "\\");
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
        let newMeetingKey = database.ref().child('meeting').push().key;
        let updates = {}
        updates['/meeting/' + newMeetingKey] = data;
        for (let i = 0; i < validEmail.length; i++) {
            updates['/email-meeting/' + validEmail[i].replaceAll(".", "\\") + '/' + newMeetingKey] = {
                createdAt: ((new Date()).getTime()),
                meeting_name: meetingName,
                creator: myEmail,
            };
        }
        database.ref().update(updates).then(_ => {
        })
    } else {
        let newTableData = {};
        for (const i in tableData) {
            for (const j in tableData[i]) {
                let temp = {}
                temp[j.replaceAll(".", "\\")] = true;
                newTableData[i] = { ...newTableData[i], ...temp };
            }
        }
        let updates = {};
        updates['/meeting/' + typeOrKey + "/selected"] = newTableData;
        database.ref().update(updates).then(_ => {
        })
    }
}

const ExistedMeetingList = (props) => {
    const classes = useStyles();
    const ShowExistedMeeting = props.existedMeeting.length !== 0
        ?
        [...Array(props.existedMeeting.length)].map((value, index) => {
            let i = props.existedMeeting.length - index - 1;
            return (
                <div
                    key={index}
                    style={styles.existedMeetingDiv}
                >
                    <div
                        style={styles.existedMeetingNameAndTimeDiv}
                        onClick={() => {
                            props.callbackSetViewMeetingKey(props.existedMeeting[i][0]);
                        }}
                    >
                        <div
                            style={styles.existedMeetingName}
                        >
                            {props.existedMeeting[i][1]["meeting_name"]}
                        </div>
                        <div
                            style={styles.existedMeetingTime}
                        >
                            Created at: {timeStampToString(props.existedMeeting[i][1]["createdAt"])}
                        </div>
                    </div>
                    <button type="button" className="btn btn-close" onClick={() => { props.callbackSetOpen(props.existedMeeting[i]) }} style={styles.existedMeetingDeleteButton}>
                    </button>
                    <div className={classes.root_fab}>
                    <Fab color="primary" aria-label="add">
                        <Link to="/meeting/create"><AddIcon /></Link>
                    </Fab>
                </div>
                </div>
            )
        })
        :
        <div>
            There are no meeting yet. Try to create one?
            <div className={classes.root_fab}>
                <Fab color="primary" aria-label="add">
                    <Link to="/meeting/create"><AddIcon /></Link>
                </Fab>
            </div>
        </div>

    return (
        <div
            style={styles.existedMeetingsContainer}
        >
            {ShowExistedMeeting}
        </div>
    );
}

export const TimeTable = (startDate, startTime, endDate, endTime, timeLength, callback, tableDataInput, canEdit = true) => {
    let tableHead = [""];
    let tableData = [];
    const sDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const eDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const days = ((eDate.getTime() - sDate.getTime()) / (1000 * 3600 * 24)) + 1;
    const numSlot = Math.floor((endTime.getHours() * 60 + endTime.getMinutes() - startTime.getHours() * 60 - startTime.getMinutes()) / timeLength);
    const myEmail = auth.currentUser.email;
    for (let i = 0; i < days; i++) {
        tableHead = [...tableHead, timeStampToString(startDate.getTime() + i * 24 * 60 * 60 * 1000, 'dmy')];
    }
    for (let i = 0; i < numSlot; i++) {
        let tempTimeStart = new Date(startTime.getTime() + 1000 * 60 * timeLength * (i));
        let tempTimeEnd = new Date(startTime.getTime() + 1000 * 60 * timeLength * (i + 1));
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
                            messageArray = [...messageArray, property.replaceAll('\\', '.')]
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
            <div>
                {
                    colIndex !== 0 && data ?
                        data.map((t, id) => (
                            <div key={id}>
                                {t}
                            </div>
                        ))
                        :
                        <div >
                            {data}
                        </div>
                }
            </div>
        )
    }
    return (
        <div className="time-table">
            <style
                dangerouslySetInnerHTML={{
                    __html: [
                        '.table-time {',
                        'border-collapse: collapse;',
                        'width: 100%;',
                        'overflow: auto;',
                        '}',
                        '.table-time td, .table-time th {',
                        'border: 1px solid #888888;',
                        'text-align: center;',
                        '}',
                        '.table-time tr:nth-child(odd) {',
                        'background-color: #dddddd;',
                        '}',
                        '.table-time th {',
                        'background-color: #cccccc;',
                        '}',
                        '.time-table {',
                        'padding-top:10px;',
                        '}'
                    ].join('\n')
                }}
            />
            <table className="table-time">
                <tbody>
                    <tr>
                        {
                            tableHead.map((value, index) => {
                                return (
                                    <th key={index}>{value}</th>
                                )
                            })
                        }
                    </tr>
                    {
                        tableData.map((rowData, index) => (
                            <tr key={index}>
                                {
                                    rowData.map((cellData, cellIndex) => (
                                        cellIndex !== 0 ?
                                            <td
                                                key={cellIndex}
                                                onClick={() => {
                                                    if (cellIndex !== 0 && canEdit) {
                                                        callback(index + ":" + (cellIndex - 1))
                                                    }
                                                }}
                                                style={{
                                                    padding: 8,
                                                }}
                                            >
                                                {
                                                    element(cellData, index, cellIndex)
                                                }
                                            </td>
                                            :
                                            <th
                                                key={cellIndex}
                                            >
                                                {
                                                    element(cellData, index, cellIndex)
                                                }
                                            </th>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div >
    )
}

const ViewMeeting = (props) => {
    const [meeting, setMeeting] = useState([]);
    const [emailArray, setEmailArray] = useState([]);
    const [editMeeting, setEditMeeting] = useState(false);
    const [newSelect, setNewSelect] = useState({});

    useEffect(() => {
        database.ref('/meeting/' + props.viewMeetingKey).on("value", (snapshot) => {
            setMeeting([snapshot.exportVal()]);
            let temp = [];
            for (const key in snapshot.exportVal().email) {
                temp = [...temp, key.replaceAll("\\", ".")];
            }
            setEmailArray(temp);
            let newObj = snapshot.exportVal();
            let temp2 = {};
            for (const num in newObj.selected) {
                let tmp = {};
                for (const address in newObj.selected[num]) {
                    tmp[address.replaceAll('\\', '.')] = true;
                }
                temp2[num] = tmp;
            }
            setNewSelect(temp2);
        });
    }, [props.viewMeetingKey]);

    return (
        <div
            className="view-meeting"
        >
            <style
                dangerouslySetInnerHTML={{
                    __html: [
                        '.view-meeting{',
                        'padding-top:10px;',
                        'padding-bottom:10px;',
                        '}',
                        '.table-info th{',
                        'background-color: #cccccc;',
                        '}',
                        '.table-info {',
                        'border-collapse: collapse;',
                        'width: 100%;',
                        '}',
                        '.table-info td, .table-info th {',
                        'border: 1px solid #888888;',
                        'text-align: center;',
                        'padding: 8px;',
                        '}',
                        '.button-group{',
                        'display:flex;',
                        'flex-direction:row;',
                        'justify-content:space-evenly;',
                        'margin-top:10px;',
                        '}',
                    ].join('\n')
                }}
            />
            {
                meeting.length !== 0
                    ?
                    editMeeting === false
                        ?
                        <div>
                            <table className="table-info">
                                <tbody>
                                    <tr>
                                        <th>
                                            Meeting Name:
                                </th>
                                        <td>
                                            {
                                                meeting[0].meeting_name
                                            }
                                        </td>
                                    </tr>
                                    <tr>

                                        <th>
                                            Creator:
                                </th>
                                        <td>
                                            {
                                                meeting[0].creator.replaceAll("\\", ".")
                                            }
                                        </td>
                                    </tr>
                                    {

                                        [...Array((emailArray.length + 1) % 2 === 0 ? (emailArray.length + 1) / 2 : (emailArray.length + 2) / 2).keys()].map((value, index) => {
                                            return (
                                                <tr key={index}>
                                                    {
                                                        index === 0 ?
                                                            <th>
                                                                Emails:
                                                        </th>
                                                            :
                                                            <td>
                                                                {
                                                                    emailArray[index * 2 - 1]
                                                                }
                                                            </td>
                                                    }
                                                    <td>
                                                        {
                                                            emailArray[index * 2]
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                            {
                                TimeTable(new Date(-meeting[0].time_data.start_date), new Date(-meeting[0].time_data.start_time), new Date(-meeting[0].time_data.end_date), new Date(-meeting[0].time_data.end_time), meeting[0].time_data.time_length, () => {
                                },
                                    newSelect, false)
                            }
                            <div className="button-group">
                                <div
                                    onClick={() => {
                                        props.callbackSetViewMeetingKey("");
                                    }}
                                    className="btn btn-primary"
                                >
                                    Go back
                                </div>
                                <div
                                    onClick={() => {
                                        setEditMeeting(true);
                                    }}
                                    className="btn btn-primary"
                                >
                                    Edit
                                </div>
                            </div>
                        </div>
                        :
                        <div>
                            {
                                TimeTable(new Date(-meeting[0].time_data.start_date), new Date(-meeting[0].time_data.start_time), new Date(-meeting[0].time_data.end_date), new Date(-meeting[0].time_data.end_time), meeting[0].time_data.time_length, (att) => {
                                    let emialString = auth.currentUser.email.toString();
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
                                            // eslint-disable-next-line no-unused-vars
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
                                }, newSelect, true)
                            }
                            <div className="button-group">
                                <div
                                    onClick={() => {
                                        setEditMeeting(false);
                                    }}
                                    className="btn btn-primary"
                                >
                                    Go back
                                </div>
                                <div
                                    onClick={() => {
                                        uploadTimeTable(props.viewMeetingKey, newSelect);
                                        setEditMeeting(false);
                                    }}
                                    className="btn btn-primary"
                                >
                                    Save
                                </div>
                            </div>
                        </div>
                    :
                    null
            }
        </div>
    );
}

const ExistedMeeting = (props) => {
    const [loginState, setLoginState] = useState(auth.currentUser !== null);
    const [runOnce, setRunOnce] = useState(false);
    const [viewMeetingKey, setViewMeetingKey] = useState("");
    const [existedMeeting, setExistedMeeting] = useState([]);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (loginState) {
            let email = auth.currentUser.email;
            email = email.replaceAll(".", "\\");
            database.ref('/email-meeting/' + email).on("value", (snapshot) => {
                let temp = [];
                snapshot.forEach((childSnapshot) => {
                    temp = [...temp, [childSnapshot.key, childSnapshot.exportVal()]];
                });
                setExistedMeeting(temp);
            });
        } else {
            setExistedMeeting("");
        }
    }, [loginState]);

    useEffect(() => {
        if (!runOnce) {
            auth.onAuthStateChanged(userAuth => {
                setLoginState(userAuth ? true : false);
            });
            setRunOnce(true);
        }
    }, [runOnce]);

    const deleteMeeting = async (meeting, mode) => {
        let key = meeting[0]
        let emailObj = {}
        await database.ref('/meeting/' + key + '/email').once("value", (snapshot) => {
            emailObj = snapshot.exportVal();
        });
        let emailCounter = 0
        // eslint-disable-next-line no-unused-vars
        for (const _ in emailObj) {
            if (emailCounter < 3) {
                emailCounter++;
            } else {
                break
            }
        }
        if (mode === 'me' && emailCounter === 3) {
            let myEmail = auth.currentUser.email.replaceAll(".", "\\");
            database.ref('email-meeting/' + myEmail + '/' + key).remove()
            database.ref('meeting/' + key + '/email/' + myEmail).remove()
            await database.ref('/meeting/' + key + '/selected').once("value", (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    for (const property in childSnapshot.exportVal()) {
                        if (property === myEmail) {
                            database.ref('/meeting/' + key + '/selected/' + childSnapshot.key + '/' + property).remove()
                        }
                    }
                })
            });
        } else if (mode === "all" || emailCounter === 2) {
            for (const property in emailObj) {
                database.ref('email-meeting/' + property + '/' + key).remove()
            }
            database.ref('meeting/' + key).remove()
        }
    }
    return (
        <div className="container">
            <style
                dangerouslySetInnerHTML={{
                    __html: [
                        'main{',
                        'background-color:#fafafa;',
                        'height:calc( 100vh - 64px );',
                        '}'
                    ].join('\n')
                }}
            />
            {
                loginState && viewMeetingKey === "" ?
                    <ExistedMeetingList
                        callbackSetViewMeetingKey={(key) => {
                            setViewMeetingKey(key);
                        }}
                        callbackSetOpen={(key) => { setOpen(key) }}
                        existedMeeting={existedMeeting}
                    />
                    :
                    null
            }
            {
                loginState && viewMeetingKey === "" ?
                    <Modal
                        open={open !== false}
                        onClose={() => setOpen(false)}
                        aria-labelledby="simple-modal-title"
                        aria-describedby="simple-modal-description"
                    >
                        <div style={{
                            top: '50%',
                            left: ' 50%',
                            transform: 'translate(-50%, -50%)',
                            position: 'absolute',
                            width: 600,
                            border: '0px solid #000',
                            backgroundColor: 'white',
                            padding: 30,
                            borderRadius: 5
                        }}>
                            <h2 id="simple-modal-title">Delete meeting</h2>
                            <p id="simple-modal-description">
                                {
                                    open !== false
                                    &&
                                    (open[1]["creator"] === auth.currentUser.email.replaceAll(".", "\\") ?
                                        "You are the creator of the meeting, you can delete the meeting or remove yourself from the meeting."
                                        :
                                        "You are not the creator of the meeting, you can only remove yourself from the meeting."
                                    )
                                }
                            </p>
                            <div style={{
                                flexDirection: 'row',
                                flex: 1,
                                justifyContent: 'space-evenly',
                                display: 'flex',
                            }}>
                                {
                                    open !== false
                                    &&
                                    (open[1]["creator"] === auth.currentUser.email.replaceAll(".", "\\") ?
                                        <button type="button" className="btn btn-secondary " onClick={() => {
                                            deleteMeeting(open, "all");
                                            setOpen(false);
                                        }}>
                                            {"Delete Meeting"}
                                        </button>
                                        :
                                        null
                                    )
                                }
                                <button type="button" className="btn btn-secondary " onClick={() => {
                                    deleteMeeting(open, "me");
                                    setOpen(false);
                                }} >
                                    {"Remove Myself"}
                                </button>
                                <button type="button" className="btn btn-primary" onClick={() => { setOpen(false) }} >
                                    {"Cancel"}
                                </button>
                            </div>
                        </div>
                    </Modal>
                    :
                    null
            }
            {
                loginState && viewMeetingKey !== "" ?
                    <ViewMeeting
                        callbackSetViewMeetingKey={(key) => {
                            setViewMeetingKey(key);
                        }}
                        viewMeetingKey={viewMeetingKey}
                    />
                    :
                    null
            }
        </div >

    );
}

const styles = {
    existedMeetingsContainer: {
        overflow: "auto",
        flexDirection: 'row',
        display: 'flex',
        flexWrap: 'wrap',
        backgroundColor: '#fafafa',
        justifyContent: 'space-evenly',
    },
    existedMeetingDiv: {
        borderWidth: 0.5,
        borderRadius: 6,
        borderStyle: 'solid',
        borderColor: 'rgba(0,0,0,0.5)',
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f4f4f4',
        overflow: "auto",
        display: 'flex',
        width: 350,
        height: 100,
        flexDirection: 'row',
    },
    existedMeetingNameAndTimeDiv: {
        flex: 15,
    },
    existedMeetingName: {
        fontSize: 28,
        padding: 3,
        paddingBottom: 8
    },
    existedMeetingTime: {
        fontSize: 16,
        color: '#585858'
    },
    existedMeetingDeleteButton: {
        flex: 1,
        padding: 5,
        paddingBottom: 20
    },
    existedMeetingDeleteButtonImage: {
        height: 15,
        width: 15,
    },
};

export default ExistedMeeting;
