// Copyright 2016-2017 Rigo Investment Sarl.
import * as Colors from 'material-ui/styles/colors'
import styles from './applicationHome.module.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardActions, CardTitle, CardText } from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import { Row, Col } from 'react-flexbox-grid';
import FlatButton from 'material-ui/FlatButton'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'
import { connect } from 'react-redux';
import Loading from '../_atomic/atoms/loading';

import {
  Link
} from 'react-router-dom'

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

function mapStateToProps(state) {
  return state
}


class ApplicationHome extends Component {

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

  static propTypes = {
    endpoint: PropTypes.object.isRequired,
  };

  // We pass down the context variables passed down to the children
  getChildContext() {
    return {
      // api,
      // muiTheme
    };
  }

  componentDidMount() {
    // this.setState()
    // this.checkConnectionToNode();
    // console.log(this.context);
  }

  render() {
    const { connected } = this.state;
    const { endpoint } = this.props
    const buttonTelegram = {
      border: "2px solid",
      borderColor: Colors.blue400,
      fontWeight: "600",
      height: "45px"
      // width: "140px"
    }

    if (!connected) {
      return (
        <Loading />
      );
    }

    return (
      <div className={styles.body}>
        <Row>
          <Col xs={12} >
            <div className={styles.shadow}>
              <Row>
                <Col xs={12}>
                  
                  <div className={styles.mainlogo}><img style={{height: "80px"}} src='/img/new_logo_full.png'/></div>
                  <h2 className={styles.headline}>Decentralized Pools of Digital Tokens</h2>
                  <p>&nbsp;</p>
                  <a href="https://t.me/rigoblockprotocol" target="_blank" rel="noopener noreferrer">
                    <FlatButton
                      labelPosition="before"
                      label="Join us on telegram!"
                      labelStyle={{ color: Colors.blue400, fontWeight: "600", fontSize: "20px" }}
                      style={buttonTelegram}
                      icon={<img src="/img/t_logo.png" height="30px" />}
                    // hoverColor={Colors.blue300}
                    />
                  </a>
                  <p>&nbsp;</p>
                </Col>
              </Row>
              <Row className={styles.cards}>
                <Col xs={6}>
                  <Card className={styles.column}>
                    <CardTitle title="Vault" className={styles.cardtitle} titleColor="white" />
                    <CardText>
                      Pools of ether and proof-of-stake mining
                </CardText>
                    <CardActions>
                      <Link to="/vault">
                        <RaisedButton label="New Vault" className={styles.exchangebutton} labelColor="white" />
                      </Link>
                    </CardActions>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className={styles.column}>
                    <CardTitle title="Drago" className={styles.cardtitle} titleColor="white" />
                    <CardText>
                      Pools of ether and trading on decentralized exchanges
                </CardText>
                    <CardActions >
                      {/* <ApplicationDragoFactory /> */}
                      <Link to="/drago">
                        <RaisedButton label="New Drago" className={styles.exchangebutton} labelColor="white" />
                      </Link>
                    </CardActions>
                  </Card>
                </Col>
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
          <Col xs={12}>
          <ElementBottomStatusBar 
          blockNumber={endpoint.prevBlockNumber}
          networkName={endpoint.networkInfo.name}
          networkError={endpoint.networkError}
          networkStatus={endpoint.networkStatus} />
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

export default connect(mapStateToProps)(ApplicationHome)

