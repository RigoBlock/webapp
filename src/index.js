// Copyright 2016-2017 Rigo Investment Sarl.
// By the Power of Grayskull! I Have the Power!

import React from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter,
    Route,
    Switch,
    Redirect
  } from 'react-router-dom'

import registerServiceWorker from './registerServiceWorker';
import { 
    ApplicationHomePage, 
    ApplicationVaultPage, 
    ApplicationDragoPage, 
    ApplicationConfigPage,
    ApplicationGabcoinPage,
    // ApplicationExchangePage,
    Whoops404 } from './App';

import './index.module.css';

var appHashPath = true;



// Detectiong if the app is running inside Parity client
var pathArray = window.location.hash.split( '/' );
// console.log(pathArray[2]);
if (typeof window.parity !== 'undefined') {
    appHashPath = pathArray[2];
    } else {
    appHashPath = 'web';
    }
// console.log(appHashPath);
// console.log(location);

// Setting the routes. 
// Component Whoops404 is loaded if a page does not exist.

ReactDOM.render(
    <HashRouter>
        <Switch>
          <Route exact path={ "/app/" + appHashPath + "/home" } component={ApplicationHomePage} />
          <Route path={ "/app/" + appHashPath + "/vault" } component={ApplicationGabcoinPage} />
          <Route path={ "/app/" + appHashPath + "/vaultv2" } component={ApplicationVaultPage} />
          {/* <Route exact path={ "/app/" + appHashPath + "/drago/dashboard" } component={ApplicationDragoPage} /> */}
          {/* <Route exact path={ "/app/" + appHashPath + "/drago/funds" } component={ApplicationDragoPage} /> */}
          <Route path={ "/app/" + appHashPath + "/drago" } component={ApplicationDragoPage} />
          <Route path={ "/app/" + appHashPath + "/config" } component={ApplicationConfigPage} />
          {/* <Route path={ "/app/" + appHashPath + "/exchange" } component={ApplicationExchangePage} /> */}
          {/* <Redirect from="/exchange" to={ "/app/" + appHashPath + "/exchange" } />  */}
          <Redirect from="/vault/" to={ "/app/" + appHashPath + "/vault" } />
          <Redirect from="/vaultv2/" to={ "/app/" + appHashPath + "/vaultv2" } />
          <Redirect from="/drago" to={ "/app/" + appHashPath + "/drago" } />
          <Redirect from="/" to={ "/app/" + appHashPath + "/home" } />
          <Route component={Whoops404} />
        </Switch>
    </HashRouter>,
    document.getElementById('root'))

registerServiceWorker()

// Hot Module Reload
// if (module.hot) {
//     module.hot.accept();
// }
