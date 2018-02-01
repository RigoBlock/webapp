import  * as Colors from 'material-ui/styles/colors'
import { Row, Col } from 'react-flexbox-grid';
import { transparent} from 'material-ui/styles/colors';
import NotificationWifi from 'material-ui/svg-icons/notification/wifi';
import AccessTime from 'material-ui/svg-icons/device/access-time';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import utils from '../utils/utils'

import styles from './elementBottomStatusBar.module.css';
import classnames from 'classnames'

var t = null;

export default class ElementBottomStatusBar extends Component {

  static propTypes = {
    // accountName: PropTypes.string.isRequired,
    // blockNumber: PropTypes.string,
    networkName: PropTypes.string.isRequired,
    networkError: PropTypes.string.isRequired,
    networkStatus: PropTypes.string.isRequired,
  };

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  state = {
    currentTime: "0000-00-00 00:00:00",
    lastBlockTime: "00:00:00"
  }

  componentDidMount () {
    // this.blockNumber()
    this.startTime()
  }

  componentWillUnmount () {
    // clearTimeout(t)
  }


  componentWillReceiveProps (nextProps) {
    // console.log(this.props.blockNumber)
    // console.log(nextProps.blockNumber)
     if(this.props.blockNumber == 0 && nextProps.blockNumber !=0) {
      // this.blockNumber(nextProps.blockNumber)
     }
    // (!utils.shallowEqual(this.props.blockNumber, nextProps.blockNumber)) ? this.blockNumber(): null
  }

  shouldComponentUpdate(nextProps, nextState){
    const propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    const stateUpdate = (!utils.shallowEqual(this.state, nextState))
    return propsUpdate || stateUpdate
  }
  
  renderNetworkStatus = () => {
    const { networkStatus, networkError } = this.props
    var networkIconColor = Colors.green600
    var toolTipType = 'info'
    switch (this.props.networkError) {
      case ('networkOk'):
        networkIconColor = Colors.green600
        break;
      case ('networkWarning'):
        networkIconColor = Colors.red600
        break;
      default:
        networkIconColor = Colors.green600
    }
    switch (this.props.networkError) {
      case ('networkOk'):
        toolTipType = 'info'
        break;
      case ('networkWarning'):
        toolTipType = 'error'
        break;
      default:
        toolTipType = 'info'
    }

    const tooltip = {
      backgroundColor: '#fff',
    }
    return (
      <a className={classnames(styles.tooltip)}>
        <NotificationWifi
          className={classnames(styles.networkIcon)} color={networkIconColor}
        />
        <div className={styles.tooltiptext}>{networkStatus}</div>
      </a>
    )
  }

  startTime = () => {
    var x = this
    function checkTime(i) {
      return (i < 10) ? "0" + i : i;
    }
    var today = new Date(),
      y = today.getFullYear(),
      M = ("0" + (today.getMonth() + 1)).slice(-2),
      d = ("0" + today.getDate()).slice(-2),
      h = checkTime(today.getHours()),
      m = checkTime(today.getMinutes()),
      s = checkTime(today.getSeconds());

    const currentTime = y + "-" + M + "-" + d + " " + h + ":" + m + ":" + s;
    this.setState({
      currentTime: currentTime
    })
    t = setTimeout(function () {
      x.startTime()
    }, 1000);
  }

  // blockNumber = (blockNumber) => {
  //   const { api } = this.context
  //   var currentBlock = null

  //   function addZero(i) {
  //     return (i < 10) ? "0" + i : i;
  //   }

  //   if (typeof blockNumber !== 'undefined') {
  //     currentBlock = blockNumber 
  //   } else {
  //     currentBlock = this.props.blockNumber
  //   } 

  //   if (currentBlock != 0) {
  //     api.eth
  //     .getBlockByNumber(currentBlock)
  //     .then((block) => {
  //       var t = block.timestamp
  //       var blockTime = addZero(t.getHours())+':'+addZero(t.getMinutes())+':'+addZero(t.getSeconds())
  //       console.log(blockTime)
  //       this.setState({
  //         lastBlockTime: blockTime
  //       })
  //     })
  //   }
  // }

  renderCurrentTime = () => {
    return (
      <span>
        <AccessTime
          className={classnames(styles.accessTimeIcon)} />&nbsp;
        {this.state.currentTime}
      </span>
    )
  }
 

  render() {
    const { blockNumber, networkName, networkStatus, networkError } = this.props
    var toolTipType = 'info'
    const numberWithCommas = (x) => {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    switch (this.props.networkError) {
      case ('networkOk'):
        toolTipType = 'info'
        break;
      case ('networkWarning'):
        toolTipType = 'error'
        break;
      default:
        toolTipType = 'info'
    } 
    return (
      <Row className={styles.networkStatus} between="xs">
        <Col xs={4}>
          ©2017 RigoInvestment. All rights reserved.
        </Col>
        <Col xs={8} className={styles.networkStatusCounter}>
          <div className={styles.networkDataContainer}>
            {this.renderCurrentTime()}&nbsp;&nbsp;&nbsp;&nbsp;
            {/* Blockchain: {this.state.lastBlockTime}&nbsp;/&nbsp;  */}
            Blockchain:
         #{numberWithCommas(blockNumber)}&nbsp;&nbsp;<span className={styles.networkName}>{networkName}</span>&nbsp;&nbsp;{this.renderNetworkStatus()}
          </div>
        </Col>
        <span>{networkStatus}</span>
      </Row>
    );
  }
}
