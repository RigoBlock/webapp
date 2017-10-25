import React, { Component } from 'react';
import { Link, Route, withRouter } from 'react-router-dom'
import {Tabs, Tab} from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import ActionLightBulb from 'material-ui/svg-icons/action/lightbulb-outline';
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionPolymer from 'material-ui/svg-icons/action/polymer';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import styles from '../application.module.css';

function logMsg(message) {
    console.log(message);
  }


export default class ApplicationBottomBar extends Component {
    constructor(props) {
      super(props)

    }

    handleCallToRouter = (value) => {
        this.props.history.push(value);
      }

    render() {
    // we access the props passed to the component
    // const { location } = this.props
    // console.log(location);
      return (
        <span className={styles.bottomBar}> 
        <Toolbar>
            <ToolbarGroup><img src="./img/RigoLogoTop.png"/><span className={styles.copyright}>©2017 RigoInvestment. All rights reserved.</span></ToolbarGroup> 
            <ToolbarGroup><a href="https://rigoblock.com/" target="_blank">Website</a>&nbsp;-&nbsp;
            <a className={styles.copyright} href="https://github.com/RigoBlock/whitepaper/raw/master/RigoBlockPaper.pdf" target="_blank">WhitePaper</a>&nbsp;-&nbsp;
            <a className={styles.copyright} href="mailto:admin@rigoblock.com?Subject=RigoBlock%20contact">Contact Us</a>
            </ToolbarGroup>    
        </Toolbar>
        </span>
      )
    }
  }