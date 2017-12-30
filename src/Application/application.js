// Copyright 2016-2017 Gabriele Rigo
import React, { Component } from 'react';

import { api } from '../parity';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import ApplicationGabcoin from '../ApplicationGabcoin';
import ApplicationGabcoinEventful from '../ApplicationGabcoinEventful';
// import ApplicationExchange from '../ApplicationExchange';
// import ApplicationExchangeEventful from '../ApplicationExchangeEventful';
import ApplicationDragoHome from '../ApplicationDragoHome';
// import ApplicationDragoFactory from '../ApplicationDragoFactory';
import ApplicationHome from '../ApplicationHome';
import ApplicationConfig from '../ApplicationConfig';

import ApplicationBottomBar from './ApplicationBottomBar';
import ApplicationTopBar from './ApplicationTopBar';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { Grid, Row, Col } from 'react-flexbox-grid';

import styles from './application.module.css';
import classNames from 'classnames';

import * as Colors from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NotConnected from '../Elements/notConnected'


// Router
// import { Link, Route, withRouter } from 'react-router-dom'

// const muiTheme = getMuiTheme(lightBaseTheme);

const muiTheme = getMuiTheme({
  palette: {
    "primary1Color": "#2196f3",

  }
});

// function logMsg(message) {
//   console.log(message);
// }

// This function accepts children components to display below the Tabs top menu.
// Flex box grid system: https://github.com/roylee0704/react-flexbox-grid
const TemplateLayout = ({children}) =>
(

      <Grid fluid className={styles.maincontainer}>
        <Row>
          <Col xs={12}>
            {/* <ApplicationTabsMenu /> */}
            <ApplicationTopBar handleTopBarSelectAccountType={()=>{}}/>
          </Col>
        </Row>
        <Row className={classNames(styles.content)}>
          <Col xs={12}>
            {children}
          </Col>
        </Row>
        <Row>
          <Col xs={12} className={classNames(styles.bottombar)}>
            <ApplicationBottomBar />
          </Col>
        </Row>
      </Grid>

)



export class Whoops404 extends Component {
  // constructor(props) {
  //   super(props)
  // }

  render() {
  // we access the props passed to the component
  const { location } = this.props
  console.log(location);
    return (
          <TemplateLayout>
          <div className="">
              <h1>Page not found. Resource not found at '{location.pathname}'</h1>
          </div>
          </TemplateLayout>
    )
  }
}

export class ApplicationConfigPage extends Component {

  // We define the properties of the context variables passed down to the children
  static childContextTypes = {
    muiTheme: PropTypes.object,
    api: PropTypes.object,
    isConnected: PropTypes.func
  };

  state = {
    isManager: false,
    isConnected: true,
    notificationsOpen: false
  }

  td = null

  componentWillMount() {
    this.checkConnectionToNode()
  }

  componentWillUnmount () {
    clearTimeout(this.td)
  }

  // This function is passed down with context and used as a call back function to show a warning page
  // if the connection with the node drops
  isConnected = (status) => {
    // console.log('isConnected')
    this.setState({
      isConnected: status
    })
  }

  checkConnectionToNode = () =>{
    api.net.listening()
    .then((listening) =>{
      // console.log(listening)
      this.td = setTimeout(this.checkConnectionToNode,15000)
      this.setState({
        isConnected: true
      })
    })
    .catch((error) => {
      this.td = setTimeout(this.checkConnectionToNode,15000)
      this.setState({
        isConnected: false
      })
      console.warn(error)
    })
    
  }

  // We pass down the context variables passed down to the children
  getChildContext () {
    return {
      muiTheme,
      api,
      isConnected: this.isConnected
    };
  }

  // Callback function to handle account type selection in the Top Bar
  // value = 1 = Trader
  // value = 2 = Manager
  handleTopBarSelectAccountType = (event, index, value) => { 
    const accountType = {
      false: false,
      true: true
    }
    this.setState({
      isManager: accountType[value],
    }); 
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
  };

  handleToggleNotifications = () => {
    console.log('open')
    this.setState({notificationsOpen: !this.state.notificationsOpen})
  }

  render() {
  const {notificationsOpen} = this.state
  const { location, match } = this.props
  console.log('is Manager = '+this.state.isManager)
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Grid fluid className={styles.maincontainer}>
          <Row>
            <Col xs={12}>
              {/* <ApplicationTabsMenu /> */}
              <ApplicationTopBar 
                handleTopBarSelectAccountType={ this.handleTopBarSelectAccountType } 
                isManager={this.state.isManager} 
                handleToggleNotifications={this.handleToggleNotifications} 
                />
            </Col>
          </Row>
          <Row className={classNames(styles.content)}>
            <Col xs={12}>
            {this.state.isConnected ? (
              <ApplicationConfig 
                match={match}
                isManager={this.state.isManager} 
                location={location}
                notificationsOpen={notificationsOpen}
                handleToggleNotifications={this.handleToggleNotifications}
                notificationsOpen={notificationsOpen}
                />
            ) : (
              <NotConnected isConnected={this.state.isConnected}/>
            )}
            </Col>
          </Row>
          {/* <Row>
            <Col xs={12} className={classNames(styles.bottombar)}>
              <ApplicationBottomBar />
            </Col>
          </Row> */}
        </Grid>
      </MuiThemeProvider>
    )
  }
}

export class ApplicationHomePage extends Component {

  // We define the properties of the context variables passed down to the children
  static childContextTypes = {
    muiTheme: PropTypes.object,
    api: PropTypes.object
  }

  state = {
    isConnected: false,
    isManager: true
  }

  checkConnectionToNode = () =>{
    api.net.listening()
    .then(listening =>{
      console.log(listening)
      this.setState({
        isConnected: true
      })
    })
    .catch((error) => {
      this.setState({
        isConnected: false
      })
      console.warn(error)
    })
  }

  // We pass down the context variables passed down to the children
  getChildContext () {
    return {
      muiTheme,
      api
    };
  }

  componentDidMount() {
    this.checkConnectionToNode()
    
  }

  render() {
  // we access the props passed to the component
  // console.log(location);
    console.log('is Manager = '+this.state.isManager)
    return (
      <TemplateLayout isManager={this.state.isManager}>
        {this.state.isConnected ? (
          <ApplicationHome />
        ) : (
          <NotConnected />
        )}
      </TemplateLayout>
    )
  }
}

export class ApplicationGabcoinPage extends Component {

    // We define the properties of the context variables passed down to the children
    static childContextTypes = {
      muiTheme: PropTypes.object,
      api: PropTypes.object
    };
  
    // We pass down the context variables passed down to the children
    getChildContext () {
      return {
        muiTheme,
        api
      };
    }

  render() {
  // we access the props passed to the component
  const { location } = this.props
    return (
          <TemplateLayout>
          <ApplicationGabcoin />
          <ApplicationGabcoinEventful />
              {/* <p>Locaton is {location.pathname}</p> */}
          </TemplateLayout>
    )
  }
}

export class ApplicationDragoPage extends Component {


  constructor(props) {
    super(props);
    const isManagerSelected = localStorage.getItem('isManager')
    var isManager = true
    // Checking account type (trader/manager) and restoring after browser refresh
    if (typeof isManagerSelected !== 'undefined') {
      switch (isManagerSelected) {
        case 'false':
        isManager = false
        break;
        case 'true':
        isManager = true
        break;
      }
    } else {
      isManager = false
    }
    this.state = {
      isManager: isManager,
      isConnected: true,
      notificationsOpen: false
    }
  }
  
  
  // We define the properties of the context variables passed down to the children
  static childContextTypes = {
    muiTheme: PropTypes.object,
    api: PropTypes.object,
    isConnected: PropTypes.func
  };



  td = null

  componentWillMount() {
    this.checkConnectionToNode()
  }

  componentWillUnmount () {
    clearTimeout(this.td)
  }

  // This function is passed down with context and used as a call back function to show a warning page
  // if the connection with the node drops
  isConnected = (status) => {
    // console.log('isConnected')
    this.setState({
      isConnected: status
    })
  }

  checkConnectionToNode = () =>{
    api.net.listening()
    .then((listening) =>{
      // console.log(listening)
      this.td = setTimeout(this.checkConnectionToNode,15000)
      this.setState({
        isConnected: true
      })
    })
    .catch((error) => {
      this.td = setTimeout(this.checkConnectionToNode,15000)
      this.setState({
        isConnected: false
      })
      console.warn(error)
    })
    
  }

  // We pass down the context variables passed down to the children
  getChildContext () {
    return {
      muiTheme,
      api,
      isConnected: this.isConnected
    };
  }

  // Callback function to handle account type selection in the Top Bar
  // value = 1 = Trader
  // value = 2 = Manager
  handleTopBarSelectAccountType = (event, index, value) => { 
    const accountType = {
      false: false,
      true: true
    }
    localStorage.setItem('isManager', accountType[value])
    this.setState({
      isManager: accountType[value],
    }); 
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
  };

  handleToggleNotifications = () => {
    console.log('open')
    this.setState({notificationsOpen: !this.state.notificationsOpen})
  }

  render() {
  // console.log(location);

  const {notificationsOpen} = this.state
  const { location } = this.props
  console.log('is Manager = '+this.state.isManager)
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Grid fluid className={styles.maincontainer}>
          <Row>
            <Col xs={12}>
              {/* <ApplicationTabsMenu /> */}
              <ApplicationTopBar 
                handleTopBarSelectAccountType={ this.handleTopBarSelectAccountType } 
                isManager={this.state.isManager} 
                handleToggleNotifications={this.handleToggleNotifications} 
                />
            </Col>
          </Row>
          <Row className={classNames(styles.content)}>
            <Col xs={12}>
            {this.state.isConnected ? (
              <ApplicationDragoHome 
                isManager={this.state.isManager} 
                location={location}
                notificationsOpen={notificationsOpen}
                handleToggleNotifications={this.handleToggleNotifications}
                notificationsOpen={notificationsOpen}
                />
            ) : (
              <NotConnected isConnected={this.state.isConnected}/>
            )}
            </Col>
          </Row>
          {/* <Row>
            <Col xs={12} className={classNames(styles.bottombar)}>
              <ApplicationBottomBar />
            </Col>
          </Row> */}
        </Grid>
      </MuiThemeProvider>
    )
  }
}

// export class ApplicationExchangePage extends Component {

//   // We define the properties of the context variables passed down to the children
//   static childContextTypes = {
//     muiTheme: PropTypes.object,
//     api: PropTypes.object
//   };

//   // We pass down the context variables passed down to the children
//   getChildContext () {
//     return {
//       muiTheme,
//       api
//     };
//   }

//   render() {
//   // we access the props passed to the component
//   const { location } = this.props
//     return (
//           <TemplateLayout>
//           <ApplicationExchange />
//           <ApplicationExchangeEventful />
//           {/* <p>Locaton is {location.pathname}</p> */}
//           </TemplateLayout>
//     )
//   }
// }


