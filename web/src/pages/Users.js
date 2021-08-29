import React  from "react";
import Application from "../Member/Components/Application";
import UserProvider from "../Member/providers/UserProvider";
function Users() {
  
  return (
    <UserProvider>
      <Application />
    </UserProvider>
  );
}

export default Users;
