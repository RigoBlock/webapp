// Copyright 2016-2017 Rigo Investment Sarl.

import  * as Colors from 'material-ui/styles/colors';
import { Dialog, FlatButton, TextField } from 'material-ui';
import { Grid, Row, Col } from 'react-flexbox-grid';
import BigNumber from 'bignumber.js';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import AccountSelector from '../Elements/elementAccountSelector';
import ElementDialogAddressTitle from './elementDialogAddressTitle'
import ElementDialogHeadTitle from './elementDialogHeadTitle'
import IdentityIcon from '../IdentityIcon';
import InfoTable from './elementInfoTable'
import NotificationWifi from 'material-ui/svg-icons/notification/wifi';

import styles from './elementActionAuthorization.module.css';

export default class ElementActionAuthorization extends Component {

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    account: PropTypes.object.isRequired,
    onClose: PropTypes.func
  }

  state = {
    open: true,
  }

  buttonsStyle = {
    marginTop: 12,
    marginBottom: 12,
    color: 'white',
  }


  handleClose = () => {
    // Executing onClose function passed by parent if exists, otherwise setting state.
    if (typeof this.props.onClose !== 'undefined') {
      console.log('onClose props')
      this.props.onClose()
    } else {
      this.setState({
        open: false,
      })
    }

  }

  renderHeader = () => {
  }

  renderHeader = () => {
    const { tokenDetails } = this.props
    return (
      <div>
          <ElementDialogHeadTitle primaryText='Authorize action' />
          {typeof tokenDetails !=='undefined'
          ?
          <ElementDialogAddressTitle tokenDetails={tokenDetails} />
          : null
          }
      </div>

    )
  }

  render () {
    const { authMsg, account } = this.props
    const titleStyle = {
      padding: 0,
      lineHeight: '20px',
      fontSize: 16
    }
    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onClick={this.handleClose}
      />,
    ];
    return (
      <Dialog
        title={this.renderHeader()}
        titleStyle={titleStyle}
        modal
        open={this.state.open}
        actions={actions}>

        <Row className={styles.container}>
          <Col xs={12}>
            <span style={{ borderBottom: "1px dotted" }}>
              {authMsg}
            </span>
          </Col>
          <Col xs={12}>
            Please check your {account.source.charAt(0).toUpperCase() + account.source.slice(1)} wallet and authorize this transaction.
        </Col>
          <Col xs={12}>
            Click on the {<NotificationWifi color={Colors.blue500} />} icon in the top bar to track the progress of your transaction.
        </Col>
          <Col xs={12}>
            Transactions can take up to 45 seconds to be mined into a new block.
        </Col>
        </Row>
      </Dialog>
    )
  }

}