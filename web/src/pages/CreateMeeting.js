import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { TimeTable, uploadTimeTable } from "./ExistedMeeting";
import { useHistory } from 'react-router-dom';

const CreateMeetingForm = (props) => {
    const [timeTableData, setTimeTableData] = useState({
        meetingName: "",
        startDate: new Date(),
        endDate: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        timeLength: -1,
        email: [auth.currentUser.email]
    });
    const history = useHistory();
    const [tempEmail, setTempEmail] = useState("");
    const [timetableShow, setTimetableShow] = useState(false);
    const [timetableSelected, setTimetableSelected] = useState({});
    const handleInput = (target) => {
        let temp = {}
        if (target.id === "meetingName") {
            temp[target.id] = target.value;
        } else if (target.id === "timeLength") {
            temp[target.id] = parseInt(target.value);
        } else if (target.id === "email") {
            setTempEmail(target.value)
        } else if (target.id === "startDate" || target.id === "endDate") {
            temp[target.id] = new Date(target.value);
        } else if (target.id === "startTime" || target.id === "endTime") {
            temp[target.id] = new Date((new Date()).getFullYear() + " " + (new Date()).getMonth() + " " + (new Date()).getDate() + " " + target.value);
        }
        setTimeTableData({ ...timeTableData, ...temp });
    }
    return (
        <div className="container justify-content-center d-flex flex-column 
        align-items-center py-3">
            <table id="create-meeting-table" className="w-75 py-1">
                <tbody>
                    <tr>
                        <th className="w-25 px-1">
                            <label htmlFor="meetingName">Meeting Name: </label>
                        </th>
                        <td className="w-25">
                            <input
                                className="w-100 my-1"
                                type="text"
                                id="meetingName"
                                name="meetingName"
                                required
                                onChange={(e) => {
                                    handleInput(e.target);
                                }}
                            />
                        </td>
                        <th className="w-25 px-1">
                            <label htmlFor="timeLength">Time length: </label>
                        </th>
                        <td className="w-25 ">
                            <input
                                className="w-100 my-1"
                                type="number"
                                id="timeLength"
                                name="timeLength"
                                required
                                onChange={(e) => {
                                    handleInput(e.target);
                                }}
                                disabled={timetableShow}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th className="w-25 px-1">
                            <label htmlFor="startDate">Start date: </label>
                        </th>
                        <td className="w-25 ">
                            <input
                                className="w-100 my-1"
                                type="date"
                                id="startDate"
                                name="startDate"
                                required
                                onChange={(e) => {
                                    handleInput(e.target);
                                }}
                                disabled={timetableShow}
                            />
                        </td>
                        <th className="w-25 px-1">
                            <label htmlFor="endDate">End date: </label>
                        </th>
                        <td className="w-25 ">
                            <input
                                className="w-100 my-1"
                                type="date"
                                id="endDate"
                                name="endDate"
                                required
                                onChange={(e) => {
                                    handleInput(e.target);
                                }}
                                disabled={timetableShow}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th className="w-25 px-1">
                            <label htmlFor="startTime">Start time: </label>
                        </th>
                        <td className="w-25 ">
                            <input
                                onChange={(e) => {
                                    handleInput(e.target);
                                }}
                                className="w-100 my-1"
                                type="time"
                                id="startTime"
                                name="startTime"
                                required
                                disabled={timetableShow}
                            />
                        </td>
                        <th className="w-25 px-1">
                            <label htmlFor="endTime">End time: </label>
                        </th>
                        <td className="w-25 ">
                            <input
                                className="w-100 my-1"
                                type="time"
                                id="endTime"
                                name="endTime"
                                required
                                onChange={(e) => {
                                    handleInput(e.target);
                                }}
                                disabled={timetableShow}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th className="w-25 px-1">
                            <label htmlFor="email">Add email: </label>
                        </th>
                        <td className="w-25 ">
                            <input
                                className="w-100 my-1"
                                type="text"
                                id="email"
                                name="email"
                                onChange={(e) => {
                                    handleInput(e.target);
                                }}
                                value={tempEmail}
                            />
                        </td>
                        <td className="w-25 px-1">
                            <div className="button-group py-1 w-100 justify-content-center d-flex flex-column align-items-center">
                                <div
                                    onClick={() => {
                                        let temp = {}
                                        const emailRegex = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i;
                                        if (emailRegex.test(tempEmail) && !timeTableData["email"].includes(tempEmail)) {
                                            temp["email"] = [...timeTableData["email"], tempEmail.toLowerCase()];
                                        }
                                        setTimeTableData({ ...timeTableData, ...temp });
                                        setTempEmail("");
                                    }}
                                    className="btn btn-primary px-2 py-1"
                                >
                                    {"Add Email"}
                                </div>
                            </div>
                        </td>
                    </tr>
                    {
                        [...Array(Math.ceil((timeTableData["email"].length + 1) / 4)).keys()].map((value, index) => {
                            return (
                                <tr key={index} >
                                    {
                                        [...Array(4).keys()].map((value2, index2) => {
                                            return (
                                                index === 0 && index2 === 0
                                                    ?
                                                    <th key={index2} className="w-25 px-1 border border-secondary"
                                                        style={{ backgroundColor: '#adb5bd' }}>
                                                        {"Emails:"}
                                                    </th>
                                                    :
                                                    index * 4 - 1 + index2 < timeTableData["email"].length
                                                        ?
                                                        <td key={index2} className="w-25 px-1 border border-secondary">
                                                            <div className="w-100 text-center">
                                                                {
                                                                    timeTableData["email"][index * 4 - 1 + index2]
                                                                }
                                                            </div>
                                                        </td>
                                                        :
                                                        null
                                            )
                                        })
                                    }
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table >
            {
                timetableShow
                    ?
                    <div>
                        {
                            TimeTable(timeTableData.startDate, timeTableData.startTime, timeTableData.endDate, timeTableData.endTime, timeTableData.timeLength, (att) => {
                                let emialString = auth.currentUser.email.toString();
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
                                        let obj = {};
                                        obj[att] = { ...timetableSelected[att], ...smallObj };
                                        setTimetableSelected({ ...timetableSelected, ...obj });
                                    } else {
                                        let flag = 0;
                                        // eslint-disable-next-line
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
                            }, timetableSelected, true)
                        }
                        <div className="button-group justify-content-evenly d-flex flex-row w-75 py-1">
                            <div
                                onClick={() => {
                                    setTimetableShow(false);
                                }}
                                className="btn btn-primary"
                            >
                                {"Go back"}
                            </div>
                            <div
                                onClick={() => {
                                    const selectedTimetable = () => {
                                        let result = false;
                                        // eslint-disable-next-line
                                        for (let _ in timetableSelected) {
                                            result = true
                                            break
                                        }
                                        return result;
                                    }
                                    if (timeTableData["meetingName"].length > 0
                                        &&
                                        timeTableData["email"].length > 1
                                        &&
                                        selectedTimetable()
                                    ) {
                                        uploadTimeTable("new", timetableSelected, timeTableData["startDate"], timeTableData["startTime"], timeTableData["endDate"], timeTableData["endTime"], timeTableData["timeLength"], timeTableData["email"], timeTableData["meetingName"]);
                                        history.push("/meeting/view");
                                    }
                                }}
                                className="btn btn-primary"
                            >
                                {"Save"}
                            </div>
                        </div>
                    </div>
                    :
                    <div className="button-group py-1">
                        <div
                            onClick={() => {
                                if (timeTableData["timeLength"] > 0
                                    &&
                                    timeTableData["startDate"] <= timeTableData["endDate"]
                                    &&
                                    timeTableData["startTime"] < timeTableData["endTime"]) {
                                    setTimetableShow(true);
                                }
                            }}
                            className="btn btn-primary"
                        >
                            {"Generate Time Table"}
                        </div>
                    </div>
            }
        </div>
    )
}

const CreateMeeting = (props) => {
    const [loginState, setLoginState] = useState(auth.currentUser !== null);
    const [runOnce, setRunOnce] = useState(false);
    useEffect(() => {
        if (!runOnce) {
            auth.onAuthStateChanged(userAuth => {
                setLoginState(userAuth ? true : false);
            });
            setRunOnce(true);
        }
    }, [runOnce]);
    return (
        loginState ?
            <CreateMeetingForm />
            :
            null
    );
}

export default CreateMeeting;
