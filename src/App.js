import './App.css';
import React  from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import NavBar from './Navbar';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import Cookies from 'js-cookie';
import WorkFlowStepper from './WorkFlowStepper';
import Status from './Status';
import DocumentInfo from './DocumentInfo';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import Document from './Document';

const THEME = createMuiTheme({
 
});

function App() {

  const isLoggedIn = () => {
    if (Cookies.get('id') === null || Cookies.get('id') === undefined) return false;
    let user = JSON.parse(window.atob(Cookies.get('id')));
    return (Cookies.get('email') && Cookies.get('name') && user && user.email === Cookies.get('email') && user.name === Cookies.get('name'));
  }
  const protectRoute = (Component) => () => {
    return isLoggedIn() ? ( Component) : (<Redirect to='/login'></Redirect>)
  }
  return (
    <MuiThemeProvider theme={THEME}>

    <Router>
      <Switch>
        <Route path='/login' render={() => { return !isLoggedIn() ? (<> <LoginPage></LoginPage> </>) : (<Redirect to='/'></Redirect>) }}></Route>
        <Route exact path="/add" render={protectRoute(
          <>
            <NavBar></NavBar>
            <WorkFlowStepper></WorkFlowStepper>
          </>
        )}></Route>
        <Route exact path="/status" render={protectRoute(
          <>
            <NavBar></NavBar>
            <Status></Status>
          </>
        )}></Route>
         <Route exact path="/info" render={protectRoute(
          <>
            <NavBar></NavBar>
            <DocumentInfo></DocumentInfo>
          </>
        )}></Route>
         <Route exact path="/doc/:fileId" render={protectRoute(
          <>
            <Document></Document>
          </>
        )}></Route>

        <Route exact path="/" render={protectRoute(
          <>
            <NavBar></NavBar>
            <HomePage></HomePage>
          </>
        )}>
       
        </Route>
      </Switch>
    </Router>
    </MuiThemeProvider>
  );
}

export default App;
