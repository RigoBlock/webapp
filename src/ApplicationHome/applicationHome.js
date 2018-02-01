// Copyright 2016-2017 Rigo Investment Sarl.

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
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import { Grid, Row, Col } from 'react-flexbox-grid';

// import ApplicationDragoFactory from '../ApplicationDragoFactory';
// import ApplicationGabcoinFactory from '../ApplicationGabcoinFactory';

import Loading from '../Loading';

import {
  Link
} from 'react-router-dom'

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const bgstyle = {
  backgroundImage: `url(${bgimage})`
};

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
    // console.log(this.context);
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
      <Row>
        <Col xs={12} >
        <div className={ styles.shadow }>
          <Row>
            <Col xs={12}>
              <h1 className={styles.headline}>RigoBlock: Decentralized Pools of Digital Tokens </h1>
              <h2>Ever dreamed of running your own investment fund?</h2>
              <p>&nbsp;</p>
              <p>&nbsp;</p>
            </Col>
          </Row>
          <Row className={ styles.cards }>
            <Col xs={6}>
              <Card className={ styles.column }>
                <CardTitle title="RigoBlock Vault" className={ styles.cardtitle } titleColor="white"/>
                <CardText>
                Pools of ether and proof-of-stake mining
                </CardText>
                <CardActions>
                    {/* <ApplicationGabcoinFactory /> */}
                    <Link to="/vaultv2">
                    <RaisedButton label="New Vault" className={ styles.exchangebutton } labelColor="white"/>
                  </Link>
                </CardActions>
              </Card>
            </Col>
            <Col xs={6}>
              <Card className={ styles.column }>
                <CardTitle title="RigoBlock Drago" className={ styles.cardtitle } titleColor="white" />
                <CardText>
                Pools of ether and trading on decentralized exchanges
                </CardText>
                <CardActions >
                  {/* <ApplicationDragoFactory /> */}
                  <Link to="/drago">
                    <RaisedButton label="New Drago" className={ styles.exchangebutton } labelColor="white"/>
                  </Link>
                </CardActions>
              </Card>
            </Col>
            {/* <Col xs={4} >
              <Card className={ styles.column }>
                <CardTitle title="RigoBlock Exchange" className={ styles.cardtitle } titleColor="white" />
                <CardText>
                Trade derivatives contracts with leverage
                </CardText>
                <CardActions>
                  <Link to="/exchange">
                    <RaisedButton label="Trade" className={ styles.exchangebutton } labelColor="white"/>
                  </Link>
                </CardActions>
              </Card>
            </Col> */}
          </Row>
          <Row>
            <Col xs={12}>
              <p></p>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Paper zDepth={1}>
              <p>&nbsp;</p>
              <p>
              Download our whitepaper at <a href='https://rigoblock.com'>www.rigoblock.com </a>
              </p>
              <p>Give us a shout! <a href="mailto:admin@rigoblock.com?Subject=RigoBlock%20contact" target="_top">admin@rigoblock.com</a>
              </p>
              <p>&nbsp;</p>
              </Paper>
            </Col>
          </Row>
        </div>
        </Col>
        </Row>
      </div>
    );
  }

  handleToggle = () => {
    this.setState({
      open: !this.state.open,
    });
  }
}

