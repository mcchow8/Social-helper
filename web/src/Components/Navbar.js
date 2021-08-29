import React, { useState, Fragment } from "react";
import clsx from "clsx";
import { Router, Route, Link } from "react-router-dom";
import { createBrowserHistory } from "history";

import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

import Home from "../pages/Home";
import ChatList from "../pages/ChatList";
import ExistedMeeting from "../pages/ExistedMeeting";
import CreateMeeting from "../pages/CreateMeeting";
import Users from "../pages/Users";
import AuctionHome from "../pages/auction/auctionHome"
import CreatePost from "../pages/auction/createPost"
import ReadPost from "../pages/auction/readPost"
import SearchPage from '../pages/auction/search'
import EditUser from '../Member/Components/EditUser'
import NestedList from "./Nestlist"
import SignIn from '../Member/Components/SignIn'
import NotMatch from '../404'

const drawerWidth = 240;
const history = createBrowserHistory();

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  flex: {
    flex: 1
  },
  drawerPaper: {
    position: "relative",
    width: drawerWidth
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  toolbarMargin: theme.mixins.toolbar,
  aboveDrawer: {
    zIndex: theme.zIndex.drawer + 1
  }
});

const MyToolbar = withStyles(styles)(({ classes, title, onMenuClick }) => (
  <Fragment>
    <AppBar className={classes.aboveDrawer}>
      <Toolbar>
        <IconButton
          className={classes.menuButton}
          color="inherit"
          aria-label="Menu"
          onClick={onMenuClick}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" className={classes.flex}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
    <div className={classes.toolbarMargin} />
  </Fragment>
));

const MyDrawer = withStyles(styles)(
  ({ classes, variant, open, onClose, onItemClick }) => (
    <Router history={history}>
      <Drawer
        variant={variant}
        open={open}
        onClose={onClose}
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <div
          className={clsx({
            [classes.toolbarMargin]: variant === "persistent"
          })}
        />
        <List>
          <ListItem
            button
            component={Link}
            to="/"
            onClick={onItemClick("Home")}
          >
            <ListItemText>Home</ListItemText>
          </ListItem>
          <Divider />
          <ListItem
            button
            component={Link}
            to="/users"
            onClick={onItemClick("Users")}
          >
            <ListItemText>Users</ListItemText>
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/auction/home"
            onClick={onItemClick("Auction")}
          >
            <ListItemText>Auction Home</ListItemText>
          </ListItem>
          <Divider />
          <ListItem
            button
            component={Link}
            to="/chat"
            onClick={onItemClick("Chat")}
          >
            <ListItemText>Chat</ListItemText>
          </ListItem>
          <Divider />
          <ListItem
            button
            component={Link}
            to="/meeting/create"
            onClick={onItemClick("Create Meeting")}
          >
            <ListItemText>Create Meeting</ListItemText>
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/meeting/view"
            onClick={onItemClick("View Meeting")}
          >
            <ListItemText>View Meeting</ListItemText>
          </ListItem>
          <NestedList>

          </NestedList>
        </List>
      </Drawer>
      <main className={classes.content}>
        <Route exact path="/" component={Home} />
        <Route exact={true} path="/users" component={Users} />
        <Route exact={true} path="/users/edit/:userid" component={EditUser} />
        <Route exact={true} path="/signin" component={SignIn} />
        <Route exact={true} path="/auction/home" component={AuctionHome} />
        <Route exact={true} path="/auction/home/:topicId" component={ReadPost} />
        <Route exact={true} path="/auction/home/search/:searchId" component={SearchPage} />
        <Route path="/auction/create" component={CreatePost} />
        <Route path="/chat" component={ChatList} />
        <Route path="/meeting/create" component={CreateMeeting} />
        <Route path="/meeting/view" component={ExistedMeeting} />
      </main>
    </Router>
  )
);



function AppBarInteraction({ classes, variant }) {
  const [drawer, setDrawer] = useState(false);
  const [title, setTitle] = useState("Home");

  const toggleDrawer = () => {
    setDrawer(!drawer);
  };

  const onItemClick = title => () => {
    setTitle(title);
    setDrawer(variant === "temporary" ? false : drawer);
    setDrawer(!drawer);
  };

  return (
    <div className={classes.root}>
      <MyToolbar title={title} onMenuClick={toggleDrawer} />
      <MyDrawer
        open={drawer}
        onClose={toggleDrawer}
        onItemClick={onItemClick}
        variant={variant}
      />
    </div>
  );
}

export default withStyles(styles)(AppBarInteraction);
