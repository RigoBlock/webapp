import React, { Component } from 'react';
import { Link, Route, withRouter } from 'react-router-dom'
import {Tabs, Tab} from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';
import FontIcon from 'material-ui/FontIcon';
import ActionLightBulb from 'material-ui/svg-icons/action/lightbulb-outline';
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionPolymer from 'material-ui/svg-icons/action/polymer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import ApplicationTabsMenu from '../ApplicationTabsMenu';

function logMsg(message) {
    console.log(message);
  }

const TopTabsMenu = ({children}) =>
(
    <div className="">
        <ApplicationTabsMenu />
        {children}
    </div>
)

export class ApplicationHomePage extends Component {
    constructor(props) {
      super(props)

    }

    render() {
    // we access the props passed to the component
    const { location } = this.props
    console.log(location);
      return (
        <MuiThemeProvider>
            <TopTabsMenu>
                <p>This content is loaded from Home component and not generated inside the Tabs component.</p>
                <p>The following link does not exist and will load an error page:</p>
                <Link to="wrongpage">wrongpage</Link>
                <p>Locaton is {location.pathname}</p>
            </TopTabsMenu>
        </MuiThemeProvider>
      )
    }
  }

  export class Whoops404 extends Component {
    constructor(props) {
      super(props)

    }

    render() {
    // we access the props passed to the component
    const { location } = this.props
    console.log(location);
      return (
        <MuiThemeProvider>
            <TopTabsMenu>
            <div className="">
                <h1>Page not found. Resource not found at '{location.pathname}'</h1>
            </div>
            </TopTabsMenu>
        </MuiThemeProvider>
      )
    }
  }

export class ApplicationGabcoinPage extends Component {
    constructor(props) {
      super(props)

    }

    render() {
    // we access the props passed to the component
    const { location } = this.props
    console.log(location);
      return (
        <MuiThemeProvider>
            <TopTabsMenu>
                <p>This content is loaded from Section1 component and not generated inside the Tabs component.</p>
                <p>Locaton is {location.pathname}</p>
            </TopTabsMenu>
        </MuiThemeProvider>
      )
    }
  }

  export class ApplicationDragoPage extends Component {
    constructor(props) {
      super(props)

    }

    render() {
    // we access the props passed to the component
    const { location } = this.props
    console.log(location);
      return (
        <MuiThemeProvider>
            <TopTabsMenu>
            <p>This content is loaded from Section2 component and not generated inside the Tabs component.</p>
            <p>Locaton is {location.pathname}</p>
            </TopTabsMenu>
        </MuiThemeProvider>
      )
    }
  }

  export class ApplicationExchangePage extends Component {
    constructor(props) {
      super(props)

    }

    render() {
    // we access the props passed to the component
    const { location } = this.props
    console.log(location);
      return (
        <MuiThemeProvider>
            <TopTabsMenu>
            <p>This content is loaded from Section3 component and not generated inside the Tabs component.</p>
            <p>Locaton is {location.pathname}</p>
            </TopTabsMenu>
        </MuiThemeProvider>
      )
    }
  }