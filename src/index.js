import React from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter,
    Route,
    Switch
  } from 'react-router-dom'

// import App from './App';
// import registerServiceWorker from './registerServiceWorker';

// import { 
//     ApplicationHomePage, 
//     ApplicationGabcoinPage, 
//     ApplicationDragoPage, 
//     ApplicationExchangePage,
//     Whoops404 } from './Application/ApplicationPages';

import { 
    ApplicationHomePage, 
    ApplicationGabcoinPage, 
    ApplicationDragoPage, 
    ApplicationExchangePage,
    Whoops404 } from './App';

import './index.module.css';

// window.React = React

// ReactDOM.render(<App />, document.getElementById('root'));

// We set the routes. 
// Component Whoops404 is loaded if a page does not exist.
ReactDOM.render(
    <HashRouter>
      <div className="">
        <Switch>
          <Route exact path="/" component={ApplicationHomePage} />
          <Route path="/vault" component={ApplicationGabcoinPage} />
          <Route path="/drago" component={ApplicationDragoPage} />
          <Route path="/exchange" component={ApplicationExchangePage} />
          <Route component={Whoops404} />
        </Switch>
      </div>
    </HashRouter>,
    document.getElementById('root'))

// registerServiceWorker()
