import React, { useContext } from "react";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import ProfilePage from "./ProfilePage";
import { UserContext } from "../providers/UserProvider";
import PasswordReset from "./PasswordReset";
import Container from '@material-ui/core/Container';

function Application() {
  const user = useContext(UserContext);
  return (
        user ?
        <ProfilePage />
      :
        <Router>
            <SignUp path="signUp" />
            <SignIn path="/" />
            <PasswordReset path = "passwordReset" />
        </Router>
      
  );
}

export default Application;
