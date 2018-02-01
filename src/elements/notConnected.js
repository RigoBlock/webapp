import AlertWarning from 'material-ui/svg-icons/alert/warning'
import React, { Component } from 'react'
import  * as Colors from 'material-ui/styles/colors'
import { Row, Col } from 'react-flexbox-grid';
import BigNumber from 'bignumber.js';
import Dialog from 'material-ui/Dialog';

import styles from './notConnected.module.css'
import PropTypes from 'prop-types';

var td = null

class NotConnected extends Component {

    state = {
      counter: 15
    }

    static propTypes = {
      isConnected: PropTypes.bool,
      isSyncing: PropTypes.bool,
    };

    componentDidMount () {
      this.counter()
    }

    componentWillUnmount () {
      clearTimeout(td)
    }

    counter = () => {
      var x = this
      var { counter } = this.state;
      td = setTimeout(function() {
        if (counter > 0) {
          x.setState({ counter: counter - 1 })
          // console.log('timeout')
          x.counter()
        } else {
          x.setState({ counter: 15 })
          // console.log('reset')
          x.counter()
        }
      }, 1000);      
    }

    renderSyncing = () => {
      const progress = new BigNumber(this.props.syncStatus.currentBlock).div(new BigNumber(this.props.syncStatus.highestBlock)).mul(100).toFixed(2)
      return (
        <Dialog
        open={true}
        modal={true}
        >
        <Row >
          <Col xs={12}>
          <Row>
          <Col xs={12}>
            <div class={styles.titleRBHeaderContainer}>
            <div class={styles.titleRBHeader}>
              <img src="img/RigoLogoTop.png" alt="logo" />
              <div className={styles.titlePrimaryText}>
                RIGOBLOCK
                </div>
                <div className={styles.titleSecondaryText}>
                BLOCKCHAIN TOKEN POOLS
                </div>
            </div>
            </div>
          </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <br />
              <h3 className={styles.warningText}>Node syncing.</h3>
              <p>Your node is syncing with Ethereum blockchain.</p>
              <p>Please wait until fully synced before accessing RigoBlock.</p>
              <p>Syncing progress:</p>
              <p>Blocks {new BigNumber(this.props.syncStatus.currentBlock).toFormat()} of {new BigNumber(this.props.syncStatus.highestBlock).toFormat()} ({progress}%)</p>
            </Col>
          </Row>
          </Col>
        </Row>
        </Dialog>
      )
    }

    renderNotConnected = () => {
      return (
        <Dialog
        open={true}
        modal={true}
        >
        <Row >
          <Col xs={12}>
            <div class={styles.titleRBHeaderContainer}>
            <div class={styles.titleRBHeader}>
              <img src="img/RigoLogoTop.png" alt="logo" />
              <div className={styles.titlePrimaryText}>
                RIGOBLOCK
                </div>
                <div className={styles.titleSecondaryText}>
                BLOCKCHAIN TOKEN POOLS
                </div>
            </div>
            </div>
          </Col>
          <Col xs={12}>
          <Row>
            <Col xs={12}>
              <br />
              <h3 className={styles.warningText}>Connection error.</h3>
              <p>Unable to connect to the network.</p>
              <p>Trying to establish a new connection in {this.state.counter} seconds... </p>
              <p>Please contact our support.</p>
            </Col>
          </Row>
          </Col>
        </Row>
        </Dialog>
      )
    }
    
    render() {
      // console.log(this.props)
      const { isSyncing} = this.props
      return isSyncing ? this.renderSyncing() : this.renderNotConnected()
    }
  }

  export default NotConnected