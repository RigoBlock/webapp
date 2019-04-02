import { Actions } from '../../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import ButtonAuthenticate from './buttonAuthenticate'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ShowStatusMsg from '../atoms/showStatusMsg'
import TokensLockBox from '../organisms/tockensLockBox'
import Web3 from 'web3'
import styles from './ethfinexAuth.module.css'

function mapStateToProps(state) {
  return {
    exchange: state.exchange,
    endpoint: {
      networkInfo: state.endpoint.networkInfo
    }
  }
}

class EthfinexAuth extends Component {
  state = {
    showSignMsg: false
  }
  static propTypes = {
    exchange: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  onAuthEF = async () => {
    const { endpoint } = this.props
    this.setState({ showSignMsg: true })

    try {
      // var provider = account.source === 'MetaMask' ? new Web3(window.ethereum) : api
      const token = Date.now() / 1000 + 3600 + ''
      const web3 = window.web3.currentProvider.isMetaMask
                        ? new Web3(window.ethereum)
                        : new Web3(window.web3)
      let result = await web3.eth.personal.sign(
        token,
        this.props.exchange.walletAddress
      )
      this.setState({ showSignMsg: false })
      const accountSignature = {
        signature: result,
        nonce: token,
        valid: true
      }
      // Fetch active orders
      this.props.dispatch(
        Actions.exchange.updateAccountSignature(accountSignature)
      )
      // Fetch active orders
      this.props.dispatch(
        Actions.exchange.getAccountOrdersStart(
          this.props.exchange.selectedRelay,
          endpoint.networkInfo.id,
          accountSignature,
          this.props.exchange.selectedTokensPair.baseToken,
          this.props.exchange.selectedTokensPair.quoteToken
        )
      )
    } catch (error) {
      this.setState({ showSignMsg: false })
      console.warn(error)
    }
  }
  render() {
    const {
      selectedRelay,
      accountSignature,
      selectedFund,
      selectedTokensPair,
      selectedExchange
    } = this.props.exchange
    // console.log(
    //   `Exp base token: ${moment
    //     .unix(selectedTokensPair.baseTokenLockWrapExpire)
    //     .format('MMMM Do YYYY, h:mm:ss a')}`
    // )
    // console.log(
    //   `Exp quote token: ${moment
    //     .unix(selectedTokensPair.quoteTokenLockWrapExpire)
    //     .format('MMMM Do YYYY, h:mm:ss a')}`
    // )
    return (
      <div className={styles.section}>
        <Row>
          <Col xs={12}>
            <Row>
              <Col xs={12}>
                <ButtonAuthenticate
                  onAuthEF={this.onAuthEF}
                  disabled={accountSignature.valid}
                />
              </Col>
              <Col xs={12}>
                {this.state.showSignMsg && (
                  <ShowStatusMsg
                    key="authMessageWarning"
                    msg="Please sign the auth token."
                    status="warning"
                    onClose={() => {
                      this.setState({ showSignMsg: false })
                    }}
                  />
                )}
              </Col>
            </Row>
          </Col>
          <Col xs={12}>
            <TokensLockBox
              selectedFund={selectedFund}
              selectedTokensPair={selectedTokensPair}
              selectedExchange={selectedExchange}
              selectedRelay={selectedRelay}
            />
          </Col>
        </Row>
      </div>
    )
  }
}
export default connect(mapStateToProps)(EthfinexAuth)
