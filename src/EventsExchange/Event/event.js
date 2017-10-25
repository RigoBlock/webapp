// Copyright 2016-2017 Gabriele Rigo

import IdentityIcon from '../../IdentityIcon';
import { formatCoins, formatEth, formatHash } from '../../format';

import styles from '../events.module.css';
import { Container, Row, Col } from 'react-grid-system';

import moment from 'moment';
import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import FileFolder from 'material-ui/svg-icons/file/folder';
import FontIcon from 'material-ui/FontIcon';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

const EMPTY_COLUMN = (
  <td></td>
);

export default class Event extends Component {
  static contextTypes = {
    accountsInfo: PropTypes.object.isRequired,
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    event: PropTypes.object,
    value: PropTypes.object,
    price: PropTypes.object,
    dragoname: PropTypes.object, //dragoname: PropTypes.object,  //check: dragoName??
    cfd: PropTypes.string, //cfd: PropTypes.object,
    fromAddress: PropTypes.string,
    toAddress: PropTypes.string,
    isStable: PropTypes.bool
  }

  state = {
    block: null
  }

  componentDidMount () {
    this.loadBlock();
  }

  render () {
    const { event, fromAddress, toAddress, price, value, ethvalue, dragoname, cfd, isStable } = this.props;
    const { block } = this.state;
    const { state, type } = event;
    const cls = `${styles.event} ${styles[state]} ${styles[type.toLowerCase()]}`;

    // console.log(type);

    return (
        // <span>
        // <TableRow>
        //         <TableRowColumn>{ this.renderTimestamp(block) }</TableRowColumn>
        //         <TableRowColumn>{ this.renderType(type) }</TableRowColumn>
        //         <TableRowColumn>{ this.renderEthValue(ethvalue) } <small> ETH</small></TableRowColumn>
        // </TableRow>
        // <TableRow>
        //         <TableRowColumn colSpan={3}>{ this.renderAddress(fromAddress) } { this.renderAddress(toAddress) }</TableRowColumn>
        // </TableRow>
        // </span>
        <TableRow>
        <TableRowColumn colSpan={3} className={styles.listiteminfotextavatarrow}>
        <Container fluid>
        <Row>
            <Col className={styles.listiteminfotext}>{ this.renderTimestamp(block) }</Col>
            <Col className={styles.listiteminfotexttype}>{ this.renderType(type) }</Col>
            <Col className={styles.listiteminfotextamount}>{ this.renderEthValue(ethvalue) } ETH</Col>
          </Row>
          <Row>
            <Col className={styles.listiteminfotextavatar}>{ this.renderAddress(fromAddress) } { this.renderAddress(toAddress) }</Col>
          </Row>
        </Container>
        </TableRowColumn>
        </TableRow>




      // <table className={ styles.eventstable }>
      // <tr className={ cls }>
      //   { this.renderTimestamp(block) }
      //   { this.renderType(type) }
      //   { this.renderPrice(price) }
      //   { this.renderValue(value) }
      //   { this.renderEthValue(ethvalue) }
      // </tr>
      // <tr>
      //   { this.renderAddress(fromAddress) }
      // </tr>
      // <tr>
      //   { this.renderAddress(toAddress) }
      // </tr>
      // </table>
    );
  }

  /*
  { this.renderName(dragoname) }
  { this.renderAddress(dragoAddress) }
  { this.renderType(id) }
  { this.renderValue(value) }
  { this.renderType(id) }
  */

  renderTimestamp (block) {
    return (
        !block ? ' ' : moment(block.timestamp).fromNow()
    );
  }

  renderAddress (address) {
    const { api } = this.context;

    if (!address) {
      // return EMPTY_COLUMN;
      return ''
    }
    // console.log(styles.account);
    return (
        <List>
          <ListItem
            disabled={true}
            leftAvatar={
              <Avatar size={30} src={ api.util.createIdentityImg(address, 4) } />
            }
          className={styles.listitemavatartext}
          >
          { this.renderAddressName(address) }
          </ListItem>
        </List>
    );
  }

  renderAddressName (address) {
    const { accountsInfo } = this.context;
    const account = accountsInfo[address];
    // console.log(account.name);
    if (account && account.name) {
      return (
        account.name
        // <span className={ styles.name }>
        //   { account.name }
        // </span>
      );
    }
    // console.log(address);
    return (
      address
      // <span className={ styles.address }>
      //   { /*formatHash(*/address/*)*/ }
      // </span>
    );
  }

  renderPrice (price) {
    if (!price) {
      return '';
    }

    return (

        formatEth(price)

    );
  }

  renderValue (value) {
    if (!value) {
      return '';
    }

    return (

        formatCoins(value)

    );

  }

  renderEthValue (ethvalue) {
    if (!ethvalue) {
      return '';
    }

    return (

        formatEth(ethvalue)

    );
  }

/*
renderName (dragoname) {
  if (!dragoname) {
    return EMPTY_COLUMN;
  }

  return (
    <td className={ styles.name }>
      { dragoname }<small> NAME</small>
    </td>
  );
}
*/

  renderType (type) {
    return (

        type

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
