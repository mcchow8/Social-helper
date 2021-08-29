import React, { useState, useEffect } from "react";
import { database, storage } from '../../firebase'
import { useHistory } from "react-router-dom";
import { PostsContainer } from './auctionHome'

export const SeacrhBar = (props) => {
    const [allTagObj, setAllTagObj] = useState({})
    const [runOnce, setRunOnce] = useState(false)
    useEffect(() => {
        if (runOnce === false) {
            let temp = {}
            database.ref("/tag-list/").on('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    for (let i = 1; i <= childSnapshot.key.length; i++) {
                        if (temp.hasOwnProperty(childSnapshot.key.slice(0, i))) {
                            temp[childSnapshot.key.slice(0, i)] = [...temp[childSnapshot.key.slice(0, i)], childSnapshot.key]
                        } else {
                            temp[childSnapshot.key.slice(0, i)] = [childSnapshot.key]
                        }
                    }
                })
            });
            setAllTagObj(temp)
            setRunOnce(true)
        }
    }, [runOnce]);

    const [searchResult, setSearchResult] = useState(false)
    const searchInputOnChangeHandler = (value) => {
        if (value === "") {
            setSearchResult(false)
        } else {
            setSearchResult(value)
        }
    }
    const [searchPreviewHoverLength, setSearchPreviewHoverLength] = useState(false)
    const [searchPreviewHoverIndex, setSearchPreviewHoverIndex] = useState(false)
    const searchInputOnKeyDownHandler = (e) => {
        if (e.code === "ArrowUp" && searchPreviewHoverLength !== false) {
            e.preventDefault()
            if (searchPreviewHoverIndex === false) {
                setSearchPreviewHoverIndex(searchPreviewHoverLength - 1)
            } else if (searchPreviewHoverIndex === 0) {
                setSearchPreviewHoverIndex(false)
            } else {
                setSearchPreviewHoverIndex(searchPreviewHoverIndex - 1)
            }
        } else if (e.code === "ArrowDown" && searchPreviewHoverLength !== false) {
            e.preventDefault()
            if (searchPreviewHoverIndex === false) {
                setSearchPreviewHoverIndex(0)
            } else if (searchPreviewHoverIndex + 1 === searchPreviewHoverLength) {
                setSearchPreviewHoverIndex(false)
            } else {
                setSearchPreviewHoverIndex(searchPreviewHoverIndex + 1)
            }
        }
    }
    useEffect(() => {
        if (searchResult !== false && allTagObj.hasOwnProperty(searchResult) && inputOnFocus) {
            setSearchPreviewHoverLength(allTagObj[searchResult].length)
        } else {
            setSearchPreviewHoverLength(false)
            setSearchPreviewHoverIndex(false)
        }
        // eslint-disable-next-line
    }, [searchResult]);

    const history = useHistory();
    // eslint-disable-next-line
    const handleSelection = () => {
        if (searchPreviewHoverIndex !== false && searchResult !== false && allTagObj.hasOwnProperty(searchResult)) {
            history.push(`/auction/home/search/${allTagObj[searchResult][searchPreviewHoverIndex]}`)
        } else if (searchResult !== false && allTagObj.hasOwnProperty(searchResult)) {
            history.push(`/auction/home/search/${searchResult}`)
        }
    }
    const inputOnBlurHandler = (e) => {
        if (!searchPreviewHover) {
            setInputOnFocus(false)
        } else {
            e.preventDefault()
        }
    }
    const SearchPreview = (props) => {
        return (
            searchResult !== false && inputOnFocus
                ?
                <div style={{
                    zIndex: 100, backgroundColor: 'white', borderRadius: 5, position: 'absolute', color: 'black', width: 500,
                    'filter': 'drop-shadow(rgb(170, 170, 170) 0px 0px 3px)'
                }} onMouseOver={() => { setSearchPreviewHover(true) }} onMouseLeave={() => { setSearchPreviewHover(false) }}                >
                    {
                        allTagObj.hasOwnProperty(searchResult) ?
                            allTagObj[searchResult].map((value, index) => {
                                return (
                                    <div key={index} className='' style={{
                                        padding: 10, paddingLeft: 15, paddingRight: 15,
                                        borderRadius: 5,
                                        backgroundColor: searchPreviewHoverIndex === index ? '#c8c8c8' : 'white',
                                    }} onClick={() => { handleSelection(); }} onFocus={() => { setInputOnFocus(true) }} onMouseOver={() => { setSearchPreviewHoverIndex(index); setSearchPreviewHover(true); }} onMouseLeave={() => { setSearchPreviewHover(false) }}>
                                        {value}
                                    </div>
                                )
                            })
                            :
                            <div style={{ padding: 10, paddingLeft: 15, paddingRight: 15, }} >
                                {"No result"}
                            </div>
                    }
                </div>
                :
                null
        )
    }
    const [inputOnFocus, setInputOnFocus] = useState(false)
    const [searchPreviewHover, setSearchPreviewHover] = useState(false)
    return (
        <div >
            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" onChange={(e) => { searchInputOnChangeHandler(e.target.value.toLocaleLowerCase()) }} style={{ width: 500, zIndex: 101 }} onKeyDown={(e) => { searchInputOnKeyDownHandler(e) }} onFocus={() => { setInputOnFocus(true) }} onBlur={(e) => { inputOnBlurHandler(e) }} onKeyUp={(e) => { if (e.key === 'Enter') { handleSelection() } }} />
            <SearchPreview />
        </div>
    )
}

const SearchPage = (props) => {
    const [seacrhId, setSeacrhId] = useState(window.location.pathname.split('/')[4]);
    const [runOnce, setRunOnce] = useState(false)
    const [idList, setIdList] = useState([])
    const [postList, setPostList] = useState([])
    const [imgObj, setImgObj] = useState({})
    useEffect(async () => {
        if (runOnce === false) {
            let temp = {}
            let temp2 = []
            await database.ref("/tag-list/").once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    for (let i = 1; i <= childSnapshot.key.length; i++) {
                        if (temp.hasOwnProperty(childSnapshot.key.slice(0, i))) {
                            temp[childSnapshot.key.slice(0, i)] = [...temp[childSnapshot.key.slice(0, i)], childSnapshot.key]
                        } else {
                            temp[childSnapshot.key.slice(0, i)] = [childSnapshot.key]
                        }
                    }
                })
            }).then(async () => {
                for (const key of temp[seacrhId]) {
                    await database.ref("/tags/" + key).once('value', (snapshot) => {
                        snapshot.forEach((childSnapshot) => {
                            if (!temp2.includes(childSnapshot.key)) {
                                temp2.push(childSnapshot.key)
                            }
                        })
                    })
                }
            }).then(async () => {
                for (let i = 0; i < temp2.length; i++) {
                    database.ref("/post/" + temp2[i]).once('value', async (snapshot) => {
                        setIdList((p) => [...p, snapshot.key])
                        setPostList((p) => [...p, snapshot.val()])
                        let tmp = {}
                        await storage.ref("postsImages/" + `${snapshot.val()["post_owner_uid"]}` + "/" + `${snapshot.key}` + "/0.jpg").getDownloadURL().then(async (url) => {
                            tmp[snapshot.key] = url
                        })
                        setImgObj((p) => ({ ...p, ...tmp }))
                    })
                }
            });
            setRunOnce(true)
        }
    }, [runOnce]);

    return (<PostsContainer url={"/auction/home"} idList={idList} postList={postList} imgObj={imgObj} />)
}
export default SearchPage;