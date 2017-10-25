// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../parity';


import styles from './applicationHome.module.css';
import bgimage from '../assets/images/blockchainLight.jpg';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';
import Slider from 'material-ui/Slider';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import { Row, Col, GridSystem, Visible, Hidden, ScreenClassRender} from 'react-grid-system';

import ApplicationDragoFactory from '../ApplicationDragoFactory';
import ApplicationGabcoinFactory from '../ApplicationGabcoinFactory';

import Loading from '../Loading';

// import getMuiTheme from 'material-ui/styles/getMuiTheme';
// import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// const muiTheme = getMuiTheme(lightBaseTheme);

const bgstyle = {
  backgroundImage: `url(${bgimage})`
};

//backgroundColor: `#E8EAF6`

export default class ApplicationHome extends Component {

  state = {
        open: false,
        connected: true
  }

  // We define the properties of the context variables passed down to the children
  static childContextTypes = {
    // api: PropTypes.object,
    // muiTheme: PropTypes.object
  };

  // We check the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired
  };
  
  // We pass down the context variables passed down to the children
  getChildContext () {
    return {
      // api,
      // muiTheme
    };
  }

  componentDidMount () {
    // this.setState()
    // this.checkConnectionToNode();
    console.log(this.context);
  }

  render() {
    const { connected } = this.state;

    if (!connected) {
      return (
        <Loading />
      );
    }

    return (
      <div className={ styles.body } style={ bgstyle }>
        <h1 className={styles.headline}>RigoBlock: Decentralized Pools of Digital Tokens </h1>
        <div className={styles.content}>
          <h2>create your own decentralized pool of tokens</h2>
          <p>
            ever dreamed of running your own hedge fund?
          </p>
          <p>
            RigoBlock is serverless and built on top of our in-house smart contracts protocol
          </p>
          <p>
            RigoBlock Vault: Pools of Ether and Proof-of-Stake mining
          </p>
          <p>
            RigoBlock Drago: Pools of Ether and trading on decentalized exchanges
          </p>
          <p>
            RigoBlock Exchange: trade derivatives contracts with leverage
          </p>

            <p>RigoBlock offers a diverse set of tools and the Proof-of-Performance algorithm</p>
            <p>
              download our whitepaper at<a href='https://rigoblock.com'> www.rigoblock.com </a>
            </p>
            <p> Give us a shout!
              <a href="mailto:admin@rigoblock.com?Subject=RigoBlock%20contact" target="_top">admin@rigoblock.com</a>
            </p>

        </div>
        <div>
          <RaisedButton
            label='create your own pool'
            onTouchTap={this.handleToggle} />
          <Drawer
            width={200}
            openSecondary={true}
            open={this.state.open}>
            <AppBar title="pool types"
              onTouchTap={this.handleToggle} />
            <div className={styles.space}>
              <ApplicationGabcoinFactory />
            </div>
            <div className={styles.space}>
              <ApplicationDragoFactory />
            </div>
          </Drawer>
        </div>
      </div>
    );
  }

  handleToggle = () => {
    this.setState({
      open: !this.state.open,
    });
  }

  // isUp = () => {
  //   console.log(`applicationHome: checking node`);
  //   this.setState({connected: true})
  // }

  // checkConnectionToNode = () => {
  //   const { api } = this.context;
  //     api.subscribe('net_listening', this.isUp)
  //     .catch((error) => {
  //       console.warn('net_listening', error);
  //       this.setState({connected: false});
  //       console.log(`applicationHome: Parity node is DOWN`);
  //     })
  // }


}

//<Slider name='slider0' defaultValue={0.5} />
