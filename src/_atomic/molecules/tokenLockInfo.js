import { Actions } from '../../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { sha3_512 } from 'js-sha3'
import { toBaseUnitAmount } from '../../_utils/format'
import { toUnitAmount } from '../../_utils/format'
import BigNumber from 'bignumber.js'
import ButtonLock from '../atoms/buttonLock'
import Checkbox from 'material-ui/Checkbox'
import LockErrorMessage from '../atoms/lockErrorMessage'
import PoolApi from '../../PoolsApi/src'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import SectionTitleExchange from '../atoms/sectionTitleExchange'
import TokenAmountInputField from '../atoms/tokenLockAmountField'
import TokenLockBalance from '../atoms/tokenLockBalance'
import TokenLockTimeField from '../atoms/tokenLockTimeField'
import Web3 from 'web3'
// import Web3Wrapper from '../../_utils/web3Wrapper'
import ShowStatusMsg from '../atoms/showStatusMsg'
import moment from 'moment'
import serializeError from 'serialize-error'
import styles from './tokenLockInfo.module.css'
import utils from '../../_utils/utils'

class TokenLockInfo extends Component {
  static propTypes = {
    selectedFund: PropTypes.object.isRequired,
    selectedExchange: PropTypes.object.isRequired,
    selectedTokensPair: PropTypes.object.isRequired,
    selectedRelay: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
    // notifications: PropTypes.func.isRequired
  }

  static defaultProps = {}

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  state = {
    baseTokenLockAmount: '0.01',
    quoteTokenLockAmount: '0.01',
    prevBaseTokenLockTime: 0,
    prevQuoteTokenLockTime: 0,
    baseTokenLockTime: this.props.selectedTokensPair.baseTokenLockWrapExpire,
    quoteTokenLockTime: this.props.selectedTokensPair.quoteTokenLockWrapExpire,
    baseTokenSelected: true,
    errorText: '',
    baseTokenRelock: false,
    quoteTokenRelock: false,
    showActionRequestMsg: false
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.selectedTokensPair.baseTokenLockWrapExpire !==
      state.prevBaseTokenLockTime
    ) {
      let now = moment()
      let baseTokenMinLockTime = now.diff(
        moment.unix(props.selectedTokensPair.baseTokenLockWrapExpire),
        'hours'
      )
      baseTokenMinLockTime < 0
        ? (baseTokenMinLockTime = Math.abs(baseTokenMinLockTime) + 1)
        : (baseTokenMinLockTime = 1)

      let quoteTokenMinLockTime = now.diff(
        moment.unix(props.selectedTokensPair.quoteTokenLockWrapExpire),
        'hours'
      )
      quoteTokenMinLockTime < 0
        ? (quoteTokenMinLockTime = Math.abs(quoteTokenMinLockTime) + 1)
        : (quoteTokenMinLockTime = 1)

      return {
        prevBaseTokenLockTime: props.selectedTokensPair.baseTokenLockWrapExpire,
        prevQuoteTokenLockTime:
          props.selectedTokensPair.quoteTokenLockWrapExpire,
        minBaseTokenLockTime: baseTokenMinLockTime.toString(),
        minQuoteTokenLockTime: quoteTokenMinLockTime.toString(),
        baseTokenLockTime: baseTokenMinLockTime.toString(),
        quoteTokenLockTime: quoteTokenMinLockTime.toString()
      }
    }
    return null
  }

  isBalanceSufficient = (amount, liquidity) => {


    if (this.state.baseTokenRelock || this.state.quoteTokenRelock) {
      return true
    }

    return new BigNumber(liquidity).gte(new BigNumber(amount))
  }

  isLockTimeGreaterThanCurrent = (currentLockTime, newLockTime) => {

    return newLockTime > currentLockTime - 1
  }

  onLockToken = async action => {
    const {
      selectedFund,
      selectedTokensPair,
      selectedRelay,
      selectedExchange // TODO: must be reviewed with 0xv2 migration
    } = this.props
    const {
      baseTokenSelected,
      baseTokenLockTime,
      quoteTokenLockTime,
      baseTokenLockAmount,
      quoteTokenLockAmount,
      minBaseTokenLockTime,
      minQuoteTokenLockTime
    } = this.state
    const { api } = this.context
    const tokenSymbol = baseTokenSelected
      ? selectedTokensPair.baseToken.symbol
      : selectedTokensPair.quoteToken.symbol
    let tokenAddress,
      tokenWrapperAddress,
      amount,
      time,
      decimals,
      isOldERC20,
      transactionDetails,
      receipt,
      transactionId,
      errorArray,
      minTime
    if (baseTokenSelected) {
      tokenAddress = selectedTokensPair.baseToken.address
      tokenWrapperAddress =
        selectedTokensPair.baseToken.wrappers[selectedRelay.name].address
      decimals = selectedTokensPair.baseToken.decimals
      amount =
        this.state.baseTokenRelock && action === 'lock'
          ? '0'
          : baseTokenLockAmount
      minTime = minBaseTokenLockTime
      time = baseTokenLockTime
      isOldERC20 = selectedTokensPair.baseToken.isOldERC20

      if (action === 'lock') {
        amount = this.state.baseTokenRelock ? '0' : baseTokenLockAmount
      }
      if (action === 'unlock') {
        amount = this.state.baseTokenRelock
          ? selectedFund.liquidity.baseToken.balanceWrapper
          : baseTokenLockAmount
      }
    } else {
      tokenAddress = selectedTokensPair.quoteToken.address
      tokenWrapperAddress =
        selectedTokensPair.quoteToken.wrappers[selectedRelay.name].address
      decimals = selectedTokensPair.quoteToken.decimals

      if (action === 'lock') {
        amount = this.state.quoteTokenRelock ? '0' : quoteTokenLockAmount
      }
      if (action === 'unlock') {
        amount = this.state.quoteTokenRelock
          ? selectedFund.liquidity.quoteToken.balanceWrapper
          : quoteTokenLockAmount
      }
      minTime = minQuoteTokenLockTime
      time = quoteTokenLockTime
      isOldERC20 = selectedTokensPair.quoteToken.isOldERC20
    }
    try {
      if (isNaN(amount - parseFloat(amount))) {
        this.setState({
          errorText: 'Please enter a valid positive number'
        })
        return
      }
    } catch (error) {}

    const web3 = window.web3.currentProvider.isMetaMask
                      ? new Web3(window.ethereum)
                      : new Web3(window.web3)

    const poolApi = await new PoolApi(web3)
    switch (action) {
      case 'lock':
        // Locking
        if (
          !this.isBalanceSufficient(
            toBaseUnitAmount(new BigNumber(amount), decimals),
            baseTokenSelected
              ? selectedFund.liquidity.baseToken.balance
              : selectedFund.liquidity.quoteToken.balance
          )
        ) {
          this.setState({
            errorText: 'The amount is greater then the available balance'
          })
          return
        }
        if (!this.isLockTimeGreaterThanCurrent(minTime, time)) {
          this.setState({
            errorText: 'The time must be greater than current lock time.'
          })
          return
        }
        this.setState({
          showActionRequestMsg: true
        })


        console.log(
          selectedFund.managerAccount,
          selectedFund.details.address,
          selectedExchange.exchangeAddress,
          tokenAddress,
          tokenWrapperAddress,
          toBaseUnitAmount(new BigNumber(amount), decimals),
          time,
          isOldERC20
        )
        transactionId = sha3_512(new Date() + selectedFund.managerAccount)
        transactionDetails = {
          status: 'pending',
          hash: '',
          parityId: null,
          timestamp: new Date(),
          account: selectedFund.details.address,
          error: false,
          action: action === 'lock' ? 'LockToken' : 'UnLockToken',
          symbol: tokenSymbol.toUpperCase(),
          amount: amount
        }
        this.props.dispatch(
          Actions.transactions.addTransactionToQueueAction(
            transactionId,
            transactionDetails
          )
        )
        try {
          let toBeLocked =
            '0x' +
            toBaseUnitAmount(new BigNumber(amount), decimals).toString(16)
          await poolApi.contract.drago.init(selectedFund.details.address)
          receipt = await poolApi.contract.drago.operateOnExchangeEFXLock(
            selectedFund.managerAccount,
            selectedFund.details.address,
            selectedExchange.exchangeAddress,
            tokenAddress,
            tokenWrapperAddress,
            toBeLocked,
            time,
            isOldERC20
          )

          transactionDetails.status = 'executed'
          transactionDetails.receipt = receipt
          transactionDetails.hash = receipt.transactionHash
          transactionDetails.timestamp = new Date()

          // Getting token wrapper lock time
          let baseTokenLockWrapExpire = await utils.getTokenWrapperLockTime(
            api,
            selectedTokensPair.baseToken.wrappers[selectedRelay.name].address,
            selectedFund.details.address
          )
          let quoteTokenLockWrapExpire = await utils.getTokenWrapperLockTime(
            api,
            selectedTokensPair.quoteToken.wrappers[selectedRelay.name].address,
            selectedFund.details.address
          )

          const payload = {
            baseTokenLockWrapExpire: baseTokenLockWrapExpire,
            quoteTokenLockWrapExpire: quoteTokenLockWrapExpire
          }

          this.props.dispatch(
            Actions.exchange.updateSelectedTradeTokensPair(payload)
          )

          // Updating selected tokens pair balances and fund liquidity (ETH, ZRX)
          this.props.dispatch(
            Actions.exchange.updateLiquidityAndTokenBalances(
              '',
              selectedFund.details.address
            )
          )
          this.props.dispatch(
            Actions.transactions.addTransactionToQueueAction(
              transactionId,
              transactionDetails
            )
          )
          this.setState({
            showActionRequestMsg: false
          })
        } catch (error) {
          console.warn(error)
          errorArray = serializeError(error).message.split(/\r?\n/)
          transactionDetails.status = 'error'
          transactionDetails.error = errorArray[0]
          this.props.dispatch(
            Actions.transactions.addTransactionToQueueAction(
              transactionId,
              transactionDetails
            )
          )
          this.props.dispatch(
            Actions.app.queueErrorNotification(serializeError(error).message)
          )
          this.setState({
            showActionRequestMsg: false
          })
        }

        break
      case 'unlock':
        // Unloking

        if (
          !this.isBalanceSufficient(
            toBaseUnitAmount(new BigNumber(amount), decimals),
            baseTokenSelected
              ? selectedFund.liquidity.baseToken.balanceWrapper
              : selectedFund.liquidity.quoteToken.balanceWrapper
          )
        ) {

          this.setState({
            errorText: 'You cannot unlock more than locked amount'
          })
          return
        }
        console.log(
          `Exp base token: ${moment
            .unix(selectedTokensPair.baseTokenLockWrapExpire)
            .format('MMMM Do YYYY, h:mm:ss a')}`
        )
        console.log(
          `Exp quote token: ${moment
            .unix(selectedTokensPair.quoteTokenLockWrapExpire)
            .format('MMMM Do YYYY, h:mm:ss a')}`
        )
        if (
          baseTokenSelected
            ? moment
                .unix(selectedTokensPair.baseTokenLockWrapExpire)
                .isAfter(moment())
            : moment
                .unix(selectedTokensPair.quoteTokenLockWrapExpire)
                .isAfter(moment())
        ) {
          this.setState({
            errorText: 'You cannot unlock ealier than the expiry time.'
          })
          return
        }
        console.log(
          selectedFund.managerAccount,
          selectedFund.details.address,
          selectedExchange.exchangeAddress,
          tokenAddress,
          tokenWrapperAddress,
          toBaseUnitAmount(new BigNumber(amount), decimals)
        )
        this.setState({
          showActionRequestMsg: true
        })
        transactionId = sha3_512(new Date() + selectedFund.managerAccount)
        transactionDetails = {
          status: 'pending',
          hash: '',
          parityId: null,
          timestamp: new Date(),
          account: selectedFund.details.address,
          error: false,
          action: action === 'lock' ? 'LockToken' : 'UnLockToken',
          symbol: tokenSymbol.toUpperCase(),
          amount: amount
        }
        this.props.dispatch(
          Actions.transactions.addTransactionToQueueAction(
            transactionId,
            transactionDetails
          )
        )
        try {



          console.log(
            web3.utils.toHex(toBaseUnitAmount(new BigNumber(amount), decimals))
          )
          console.log(
            '0x' +
              toBaseUnitAmount(new BigNumber(amount), decimals).toString(16)
          )

          const toBeUnlocked =
            this.state.baseTokenRelock || this.state.quoteTokenRelock
              ? '0x' + amount.toString(16)
              : '0x' +
                toBaseUnitAmount(new BigNumber(amount), decimals).toString(16)

          await poolApi.contract.drago.init(selectedFund.details.address)
          receipt = await poolApi.contract.drago.operateOnExchangeEFXUnlock(
            selectedFund.managerAccount,
            selectedFund.details.address,
            selectedExchange.exchangeAddress,
            tokenAddress,
            tokenWrapperAddress,
            toBeUnlocked
          )
          transactionDetails.status = 'executed'
          transactionDetails.receipt = receipt
          transactionDetails.hash = receipt.transactionHash
          transactionDetails.timestamp = new Date()

          // Getting token wrapper lock time
          let baseTokenLockWrapExpire = await utils.getTokenWrapperLockTime(
            api,
            selectedTokensPair.baseToken.wrappers[selectedRelay.name].address,
            selectedFund.details.address
          )
          let quoteTokenLockWrapExpire = await utils.getTokenWrapperLockTime(
            api,
            selectedTokensPair.quoteToken.wrappers[selectedRelay.name].address,
            selectedFund.details.address
          )

          const payload = {
            baseTokenLockWrapExpire: baseTokenLockWrapExpire,
            quoteTokenLockWrapExpire: quoteTokenLockWrapExpire
          }

          this.props.dispatch(
            Actions.exchange.updateSelectedTradeTokensPair(payload)
          )

          // Updating selected tokens pair balances and fund liquidity (ETH, ZRX)
          this.props.dispatch(
            Actions.exchange.updateLiquidityAndTokenBalances(
              '',
              selectedFund.details.address
            )
          )
          this.props.dispatch(
            Actions.transactions.addTransactionToQueueAction(
              transactionId,
              transactionDetails
            )
          )
          this.setState({
            showActionRequestMsg: false
          })
        } catch (error) {
          console.warn(error)
          errorArray = serializeError(error).message.split(/\r?\n/)
          transactionDetails.status = 'error'
          transactionDetails.error = errorArray[0]
          this.props.dispatch(
            Actions.transactions.addTransactionToQueueAction(
              transactionId,
              transactionDetails
            )
          )
          this.props.dispatch(
            Actions.app.queueErrorNotification(serializeError(error).message)
          )
          this.setState({
            showActionRequestMsg: false
          })
        }

        break
      default:
        return
    }
  }

  onChangeAmount = (amount, baseToken, errorText, options = {}) => {

    let relock = options.relock || false
    baseToken === true
      ? this.setState({
          baseTokenLockAmount: amount,
          errorText,
          baseTokenRelock: relock
        })
      : this.setState({
          quoteTokenLockAmount: amount,
          errorText,
          quoteTokenRelock: relock
        })
    this.onCheckToken(baseToken ? 'baseTokenSelected' : 'quoteTokenSelected')
  }

  onChangeTime = (amount, baseToken, errorText) => {

    baseToken === true
      ? this.setState({ baseTokenLockTime: amount, errorText })
      : this.setState({ quoteTokenLockTime: amount, errorText })
  }

  onCheckToken = token => {

    switch (token) {
      case 'baseTokenSelected':
        this.setState({
          baseTokenSelected: true,
          errorText: ''
        })
        break
      case 'quoteTokenSelected':
        this.setState({
          baseTokenSelected: false,
          errorText: ''
        })
        break
      default:
        this.setState({
          baseTokenSelected: true,
          errorText: ''
        })
    }
  }

  render() {
    const { selectedFund, selectedTokensPair } = this.props

    const baseTokenWrappedBalance = toUnitAmount(
      selectedFund.liquidity.baseToken.balanceWrapper,
      selectedTokensPair.baseToken.decimals
    ).toFixed(4)
    const quoteTokenWrappedBalance = toUnitAmount(
      selectedFund.liquidity.quoteToken.balanceWrapper,
      selectedTokensPair.quoteToken.decimals
    ).toFixed(4)
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

    // console.log(baseTokenWrappedBalance)
    return (
      <div key="lockedTokenInfo">
        <Row>
          <Col xs={12}>
            <SectionTitleExchange titleText="TOKEN LOCK" />
          </Col>

          <Col xs={12}>
            <Row className={styles.lockHeader}>
              <Col xs={1} />
              <Col xs={2} />
              <Col xs={3}>Locked</Col>
              <Col xs={4}>Amount</Col>
              <Col xs={2}>Hr</Col>
            </Row>
            <Row>
              <Col xs={1}>
                <Checkbox
                  checked={this.state.baseTokenSelected}
                  onCheck={() => this.onCheckToken('baseTokenSelected')}
                  id="baseTokenSelected"
                  key="baseTokenSelected"
                  iconStyle={{
                    width: '18px',
                    height: '18px',
                    marginTop: '1px'
                  }}
                />
              </Col>
              <Col xs={2}>
                <span className={styles.symbolText}>
                  <small>{selectedTokensPair.baseToken.symbol}</small>
                </span>
              </Col>
              <Col xs={3}>
                <TokenLockBalance
                  key="baseTokenBalance"
                  balance={baseTokenWrappedBalance}
                  lockTime={selectedTokensPair.baseTokenLockWrapExpire}
                  onClick={this.onChangeAmount}
                  isBaseToken={true}
                />
              </Col>
              <Col xs={4}>
                <TokenAmountInputField
                  key="baseTokenField"
                  lockMaxAmount={selectedFund.liquidity.baseToken.balance}
                  isBaseToken={true}
                  onChangeAmount={this.onChangeAmount}
                  disabled={!this.state.baseTokenSelected}
                  amount={this.state.baseTokenLockAmount}
                />
              </Col>
              <Col xs={2}>
                <TokenLockTimeField
                  key="baseTokenTimeField"
                  isBaseToken={true}
                  onChangeTime={this.onChangeTime}
                  disabled={!this.state.baseTokenSelected}
                  time={this.state.baseTokenLockTime}
                />
              </Col>
            </Row>

            <Row>
              <Col xs={1}>
                <Checkbox
                  checked={!this.state.baseTokenSelected}
                  onCheck={() => this.onCheckToken('quoteTokenSelected')}
                  id="quoteTokenSelected"
                  key="quoteTokenSelected"
                  iconStyle={{
                    width: '18px',
                    height: '18px',
                    marginTop: '1px'
                  }}
                />
              </Col>
              <Col xs={2}>
                <span className={styles.symbolText}>
                  <small>{selectedTokensPair.quoteToken.symbol}</small>
                </span>
              </Col>
              <Col xs={3}>
                <TokenLockBalance
                  key="quoteTokenBalance"
                  balance={quoteTokenWrappedBalance}
                  lockTime={selectedTokensPair.quoteTokenLockWrapExpire}
                  onClick={this.onChangeAmount}
                  isBaseToken={false}
                />
              </Col>
              <Col xs={4}>
                <TokenAmountInputField
                  key="quoteTokenField"
                  lockMaxAmount={selectedFund.liquidity.baseToken.balance}
                  isBaseToken={false}
                  onChangeAmount={this.onChangeAmount}
                  disabled={this.state.baseTokenSelected}
                  amount={this.state.quoteTokenLockAmount}
                />
              </Col>
              <Col xs={2}>
                <TokenLockTimeField
                  key="quoteTokenTimeField"
                  isBaseToken={false}
                  onChangeTime={this.onChangeTime}
                  disabled={this.state.baseTokenSelected}
                  time={this.state.quoteTokenLockTime}
                />
              </Col>
            </Row>
            <div className={styles.buttonsLockContainer}>
              <Row>
                <Col sm={12} md={6}>
                  <div className={styles.buttonsLock}>
                    <ButtonLock
                      buttonAction={'unlock'}
                      onLockToken={this.onLockToken}
                      disabled={this.state.errorText !== ''}
                      className={styles.buttonsLock}
                    />
                  </div>
                </Col>
                <Col sm={12} md={6}>
                  <div className={styles.buttonsLock}>
                    <ButtonLock
                      buttonAction={'lock'}
                      onLockToken={this.onLockToken}
                      className={styles.buttonsLock}
                      disabled={
                        this.state.errorText !== ''
                        // (new BigNumber(
                        //   selectedFund.liquidity.baseToken.balance
                        // ).eq(0) &&
                        //   this.state.baseTokenSelected) ||
                        // (new BigNumber(
                        //   selectedFund.liquidity.quoteToken.balance
                        // ).eq(0) &&
                        //   !this.state.baseTokenSelected)
                      }
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
          <Col xs={12}>
            <LockErrorMessage message={this.state.errorText} />
          </Col>
          <Col xs={12}>
            {this.state.showActionRequestMsg && (
              <ShowStatusMsg
                msg="Please authorize the action."
                status="warning"
                onClose={() => {
                  this.setState({ showActionRequestMsg: false })
                }}
              />
            )}
          </Col>
        </Row>
      </div>
    )
  }
}

export default connect()(TokenLockInfo)
