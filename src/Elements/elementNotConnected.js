import { Col, Row } from 'react-flexbox-grid'
import { Link } from 'react-router-dom'
import React, { Component } from 'react'

import { APP, DS } from '../_utils/const'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import SectionHeader from '../_atomic/atoms/sectionHeader'
import styles from './elementNotConnected.module.css'

function mapStateToProps(state) {
  return state
}

class ElementNotConnected extends Component {
  static propTypes = {
    app: PropTypes.object.isRequired
  }

  componentDidMount() {
    // this.counter()
  }

  componentWillUnmount() {
    // clearTimeout(td)
  }

  buildUrlPath = () => {
    let path = window.location.hash.split('/')
    return path[2]
  }

  renderSyncing = () => {
    return (
      <div className={styles.detailsBoxContainer}>
        <Row>
          <Col xs={12}>
            <SectionHeader titleText="NODE SYNCING" />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <p>
              <b>Your node is syncing with Ethereum blockchain.</b>
            </p>
            <p>Please wait until fully synced before accessing RigoBlock.</p>
            {/* <p><SyncStatusWarpChunksProcessed syncStatus={this.context.syncStatus}/></p> */}
            <p>
              Please contact our support or{' '}
              {
                <Link to={DS + APP + DS + this.buildUrlPath() + DS + 'config'}>
                  select
                </Link>
              }{' '}
              a different endpoint.
            </p>
          </Col>
        </Row>
      </div>
    )
  }

  renderNotConnected = () => {
    return (
      <div className={styles.detailsBoxContainer}>
        <Row>
          <Col xs={12}>
            <SectionHeader titleText="CONNECTION ERROR" />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <p>
              <b>Unable to connect to the network.</b>
            </p>
            {/* <p>Trying to establish a new connection in {this.state.counter} seconds... </p> */}
            <p>Trying to establish a new connection... </p>
            {/* <p>
        Attempt {this.props.app.connectionRetries}: retrying in{' '}
        {this.props.app.retryTimeInterval}
        ms
      </p> */}
            <p>Attempt {this.props.app.connectionRetries}.</p>
            <p>
              Please contact our support or{' '}
              {
                <Link to={DS + APP + DS + this.buildUrlPath() + DS + 'config'}>
                  select
                </Link>
              }{' '}
              a different endpoint.
            </p>
          </Col>
        </Row>
      </div>
    )
  }

  renderTitle = () => {
    return null
  }

  render() {
    const { isSyncing } = this.props.app
    return isSyncing ? this.renderSyncing() : this.renderNotConnected()
  }
}

export default connect(mapStateToProps)(ElementNotConnected)
