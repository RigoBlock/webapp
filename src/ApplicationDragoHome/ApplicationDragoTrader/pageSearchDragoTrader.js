import { Actions } from '../../_redux/actions'
import { Col, Grid, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import ElementListFunds from '../../Elements/elementListFunds'
import ElementListWrapper from '../../Elements/elementListWrapper'
import FilterPoolsField from '../../_atomic/atoms/filterPoolsField'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import UserDashboardHeader from '../../_atomic/atoms/userDashboardHeader'
import _ from 'lodash'

import LinearProgress from 'material-ui/LinearProgress'
import styles from './pageSearchDragoTrader.module.css'

function mapStateToProps(state) {
  return state
}

class PageSearchDragoTrader extends Component {
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    transactionsDrago: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  state = {
    filter: '',
    prevLastFetchRange: {
      chunk: {
        key: 0,
        range: 0
      },
      startBlock: 0,
      lastBlock: 0
    },
    lastFetchRange: {
      chunk: {
        key: 0,
        range: 0
      },
      startBlock: 0,
      lastBlock: 0
    },
    listLoadingProgress: 0
  }

  scrollPosition = 0

  static getDerivedStateFromProps(props, state) {
    // Any time the current user changes,
    // Reset any parts of state that are tied to that user.
    // In this simple example, that's just the email.
    const { lastFetchRange } = props.transactionsDrago.dragosList
    if (!_.isEqual(lastFetchRange, state.prevLastFetchRange)) {
      const { chunk, lastBlock, startBlock } = lastFetchRange
      if (lastBlock === 0) return null
      if (lastBlock === startBlock)
        return {
          prevLastFetchRange: lastFetchRange,
          listLoadingProgress: 100
        }
      let newProgress =
        lastBlock !== state.prevLastFetchRange.lastBlock
          ? ((chunk.toBlock - chunk.fromBlock) / (lastBlock - startBlock)) * 100
          : state.listLoadingProgress +
            ((chunk.toBlock - chunk.fromBlock) / (lastBlock - startBlock)) * 100
      return {
        prevLastFetchRange: lastFetchRange,
        listLoadingProgress: newProgress
      }
    }
    return null
  }

  componentDidMount() {
    let options = {
      topics: [null, null, null, null],
      fromBlock: 0,
      toBlock: 'latest',
      poolType: 'drago'
    }
    this.props.dispatch(
      Actions.drago.getPoolsSearchList(this.context.api, options)
    )
  }

  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   // Updating the lists on each new block if the accounts balances have changed
  //   // Doing this this to improve performances by avoiding useless re-rendering

  //   const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
  //   const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
  //   if (!currentBalance.eq(nextBalance)) {
  //     this.getDragos()
  //     console.log(
  //       `${
  //         this.constructor.name
  //       } -> UNSAFE_componentWillReceiveProps -> Accounts have changed.`
  //     )
  //   } else {
  //     null
  //   }
  // }

  // shouldComponentUpdate(nextProps, nextState) {
  //   let stateUpdate = true
  //   let propsUpdate = true
  //   const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
  //   const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
  //   stateUpdate = !utils.shallowEqual(this.state, nextState)
  //   propsUpdate = !currentBalance.eq(nextBalance)
  //   if (stateUpdate || propsUpdate) {
  //     console.log(
  //       `${
  //         this.constructor.name
  //       } -> shouldComponentUpdate -> Proceedding with rendering.`
  //     )
  //   }
  //   return stateUpdate || propsUpdate
  // }

  filter = filter => {
    this.setState(
      {
        filter
      },
      this.filterFunds
    )
  }

  filterFunds = () => {
    const { transactionsDrago } = this.props
    const { filter } = this.state
    const list = transactionsDrago.dragosList.list
    const filterValue = filter.trim().toLowerCase()
    const filterLength = filterValue.length
    return filterLength === 0
      ? list
      : list.filter(
          item =>
            item.name.toLowerCase().slice(0, filterLength) === filterValue ||
            item.symbol.toLowerCase().slice(0, filterLength) === filterValue
        )
  }

  render() {
    let { location } = this.props
    const detailsBox = {
      padding: 20
    }
    return (
      <Row>
        <Col xs={12}>
          <div className={styles.pageContainer}>
            <Paper zDepth={1}>
              <UserDashboardHeader
                fundType="drago"
                userType="holder"
                icon={<ActionShowChart />}
              />
            </Paper>
            <Paper zDepth={1}>
              <div className={styles.detailsBoxContainer}>
                <Grid fluid>
                  <Row className={styles.filterBox}>
                    <Col xs={12}>
                      <Paper style={detailsBox} zDepth={1}>
                        <FilterPoolsField filter={this.filter} />
                      </Paper>
                    </Col>
                    <Col xs={12}>
                      <div className={styles.progressBarContainer}>
                        <LinearProgress
                          mode="determinate"
                          value={this.state.listLoadingProgress}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className={styles.transactionsStyle}>
                    <Col xs={12}>
                      <ElementListWrapper
                        list={this.filterFunds()}
                        autoLoading={false}
                        location={location}
                        pagination={{
                          display: 10,
                          number: 1
                        }}
                      >
                        <ElementListFunds />
                      </ElementListWrapper>
                    </Col>
                  </Row>
                </Grid>
              </div>
            </Paper>
          </div>
        </Col>
      </Row>
    )
  }
}

export default withRouter(connect(mapStateToProps)(PageSearchDragoTrader))
