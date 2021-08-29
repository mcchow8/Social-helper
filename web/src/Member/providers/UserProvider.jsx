import React, { Component, createContext } from "react";
import { auth, generateUserDocument, database } from "../../firebase";


export const UserContext = createContext({ user:null });

class UserProvider extends Component {
  state = {
    user: null
  };

  componentDidMount = async () => {
    auth.onAuthStateChanged(async userAuth => {
      if(!userAuth) return null;
      database.ref('user/' + auth.currentUser.uid)
      .on('value', (snapshot) => {
        let newUserState = [];
        newUserState.push({
          username: snapshot.val().username.userdata,
          self_description: snapshot.val().self_description.userdata,
          sex: snapshot.val().sex.userdata,
          email: auth.currentUser.email
        })
        this.setState({ user: newUserState });
      });
      //const user = await generateUserDocument(userAuth);
      //this.setState({ user });
    });


  };

  render() {
    const { user } = this.state;

    return (
      <UserContext.Provider value={user}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}

export default UserProvider;
