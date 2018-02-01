// Copyright 2016-2017 Rigo Investment Sarl.

import IdentityIcon from '../../IdentityIcon';
import { formatCoins, formatEth, formatHash } from '../../format';

import styles from '../applicationDragoHome.module.css';
import { Grid, Row, Col } from 'react-flexbox-grid';

import moment from 'moment';
import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import FileFolder from 'material-ui/svg-icons/file/folder';
import FontIcon from 'material-ui/FontIcon';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import Divider from 'material-ui/Divider';
// import {
//   Table,
//   TableBody,
//   TableHeader,
//   TableHeaderColumn,
//   Row,
//   Col,
// } from 'material-ui/Table';

import PropTypes from 'prop-types';

const EMPTY_COLUMN = (
  ''
);

export default class ElementEventTransactions extends Component {
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    event: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    dragoAddress: PropTypes.string.isRequired, 
    fromAddress: PropTypes.string.isRequired,
    accountsInfo: PropTypes.object.isRequired, 
  }

  state = {
    block: null
  }

  componentDidMount () {
    this.loadBlock();
  }

  render () {
    const { event, fromAddress, toAddress, price, value, ethvalue, dragoname, dragosymbol, dragoAddress } = this.props;
    const { block } = this.state;
    const { state, type } = event;
    return (
      <Grid fluid>
      <Row>
        <Col xs={12}>
          <Row className={styles.transactionsDivider}>
            { this.renderTimestamp(block) }
            { this.renderType(type) }
            { this.renderValue(value) }
            { this.renderEthValue(ethvalue) }
          </Row>
          <Row >
            { this.renderName(dragoname) }
            { this.renderSymbol(dragosymbol) }
            { this.renderAddress(dragoAddress) }
            { this.renderAddress(fromAddress) }
            { this.renderAddress(toAddress) }
            { this.renderPrice(price) }
            <Col xs={12} className={styles.transactionsDivider} ><Divider /></Col>
          </Row>
        </Col>
      </Row>
      </Grid>
    );
  }

  renderTimestamp (block) {
    return (
      <Col xs>
        { !block ? ' ' : moment(block.timestamp).fromNow() }
      </Col>
    );
  }

  renderAddress (address) {
    if (!address) {
      return EMPTY_COLUMN;
    }

    return (
      <Col xs>
        <IdentityIcon address={ address } />
        { this.renderAddressName(address) }
      </Col>
    );
  }

  renderAddressName (address) {
    const { accountsInfo } = this.props;
    const account = accountsInfo[address];

    if (account && account.name) {
      return (
        <div className={ styles.name }>
          { account.name }
        </div>
      );
    }

    return (
      <div className={ styles.address }>
        { /*formatHash(*/address/*)*/ }
      </div>
    );
  }

  renderPrice (price) {
    if (!price) {
      return EMPTY_COLUMN;
    }

    return (
      <Col xs>
        { formatEth(price) }<small> ETH</small>
      </Col>
    );
  }

  renderValue (value) {
    if (!value) {
      return EMPTY_COLUMN;
    }

    return (
      <Col xs>
        { formatCoins(value) }<small> dragos</small>
      </Col>
    );

  }

  renderEthValue (ethvalue) {
    const { api } = this.context;
    if (!ethvalue) {
      return EMPTY_COLUMN;
    }

    return (
      <Col xs>
        { formatEth(ethvalue,null,api) }<small> ETH</small>
      </Col>
    );
  }

  renderName (dragoname) {
    if (!dragoname) {
      return EMPTY_COLUMN;
    }

    return (
      <Col xs>
        { dragoname }
      </Col>
    );
  }

  renderSymbol (dragosymbol) {
    if (!dragosymbol) {
      return EMPTY_COLUMN;
    }

    return (
      <Col xs>
        { dragosymbol }
      </Col>
    );
  }

  renderType (type) {
    return (
      <Col xs>
        { type }
      </Col>
    );
  }

  loadBlock () {
    const { api } = this.context;
    const { event } = this.props;

    if (!event || !event.blockNumber || event.blockNumber.eq(0)) {
      return;
    }

    api.eth
      .getBlockByNumber(event.blockNumber)
      .then((block) => {
        this.setState({ block });
      });
  }
}
