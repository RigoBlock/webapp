// Copyright 2016-2017 Rigo Investment Sagl.

import { Col, Row } from 'react-flexbox-grid'
import ApplicationDragoManager from './ApplicationDragoManager'
import ApplicationDragoTrader from './ApplicationDragoTrader'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'
import LeftSideDrawerFunds from '../Elements/leftSideDrawerFunds'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import WalletSetup from '../_atomic/organisms/walletSetup'
import styles from './applicationDragoHome.module.css'
import utils from '../_utils/utils'

import { connect } from 'react-redux'

function mapStateToProps(state) {
  return state
}

class ApplicationDragoHome extends Component {
  constructor() {
    super()
    this._notificationSystem = null
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
  }

  state = {}

  scrollPosition = 0
  activeElement = null

  shouldComponentUpdate(nextProps, nextState) {
    let stateUpdate = true
    let propsUpdate = true
    // shouldComponentUpdate returns false if no need to update children, true if needed.
    propsUpdate = !utils.shallowEqual(this.props, nextProps)
    stateUpdate = !utils.shallowEqual(this.state.loading, nextState.loading)
    stateUpdate = !utils.shallowEqual(this.state, nextState)
    // Saving the scroll position. Neede in componentDidUpdate in order to avoid the the page scroll to be
    // set top
    const element = this.node
    if (element !== null) {
      this.scrollPosition = window.scrollY
    }
    return stateUpdate || propsUpdate
  }

  UNSAFE_componentWillUpdate() {
    // Storing the active document, so we can preserve focus in forms.
    this.activeElement = document.activeElement
  }

  componentDidUpdate() {
    const element = this.node
    if (element !== null) {
      window.scrollTo(0, this.scrollPosition)
    }
    // Setting focus on the element active before component re-render
    if (this.activeElement.id !== '') {
      const activeElement = document.getElementById(this.activeElement.id)
      if (activeElement !== null) {
        activeElement.focus()
      }
    }
  }

  render() {
    const { user, location, endpoint } = this.props
    const openWalletSetup =
      this.props.endpoint.isMetaMaskLocked ||
      !this.props.endpoint.isMetaMaskNetworkCorrect
        ? true
        : false

    const showApp = !openWalletSetup //&& !endpoint.grgBalance.eq(0) // comment last part if want to remove grg req
    return (
      <div style={{ height: '100%' }} ref={node => (this.node = node)}>
        {user.isManager && showApp && (
          <Row className={styles.maincontainer}>
            <Col xs={2}>
              <LeftSideDrawerFunds
                location={location}
                isManager={user.isManager}
              />
            </Col>
            <Col xs={10}>
              <ApplicationDragoManager />
            </Col>
          </Row>
        )}
        {!user.isManager && showApp && (
          <Row className={styles.maincontainer}>
            <Col xs={2}>
              <LeftSideDrawerFunds
                location={location}
                isManager={user.isManager}
              />
            </Col>
            <Col xs={10}>
              <ApplicationDragoTrader />
            </Col>
          </Row>
        )}
        <ElementBottomStatusBar
          blockNumber={endpoint.prevBlockNumber}
          networkName={endpoint.networkInfo.name}
          networkError={endpoint.networkError}
          networkStatus={endpoint.networkStatus}
        />
        <WalletSetup />
      </div>
    )
  }
}

export default connect(mapStateToProps)(ApplicationDragoHome)
