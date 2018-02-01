import  * as Colors from 'material-ui/styles/colors'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Link, Route, withRouter } from 'react-router-dom'
import { spacing } from 'material-ui/styles'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {List, ListItem} from 'material-ui/List'
import {Tabs, Tab} from 'material-ui/Tabs'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import ActionAssessment from 'material-ui/svg-icons/action/assessment'
import ActionHome from 'material-ui/svg-icons/action/home'
import ActionList from 'material-ui/svg-icons/action/list'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import BigNumber from 'bignumber.js'
import Chip from 'material-ui/Chip'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import DropDownMenu from 'material-ui/DropDownMenu'
import FileFolder from 'material-ui/svg-icons/file/folder'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import Immutable from 'immutable'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { Component, PureComponent } from 'react'
import ReactDOM from 'react-dom'
import scrollToComponent from 'react-scroll-to-component'
import Search from 'material-ui/svg-icons/action/search'
import Snackbar from 'material-ui/Snackbar'
import Sticky from 'react-stickynode'
import ElementListWrapper from '../../Elements/elementListWrapper'
import ElementAccountBox from '../../Elements/elementAccountBox'

import { dragoFactoryEventsSignatures } from '../../utils/utils.js'
import { formatCoins, formatEth, formatHash, toHex } from '../../format'
import * as abis from '../../contracts'
import ElementVaultCreateAction from '../Elements/elementVaultCreateAction'
import ElementListSupply from '../Elements/elementListSupply'
import ElementListTransactions from '../Elements/elementListTransactions'
import IdentityIcon from '../../IdentityIcon'
import Loading from '../../Loading'
import utils, {dragoApi} from '../../utils/utils'

import styles from './pageDashboardVaultManager.module.css'

class PageDashboardVaultManager extends Component {

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
      location: PropTypes.object.isRequired,
      ethBalance: PropTypes.object.isRequired,
      accounts: PropTypes.array.isRequired,
      accountsInfo: PropTypes.object.isRequired, 
    };

    state = {
      vaultTransactionsLogs: null,
      vaultList: null,
      loading: true,
      topBarClassName: null,
      topBarInitialPosition: null,
      topBarLinksPosition: null,
      snackBar: false,
      snackBarMsg: ''
    }

    componentDidMount() {
      const {accounts } = this.props
      this.getTransactions (null, accounts)
    }

    componentWillMount() {

    }

    componentWillReceiveProps(nextProps) {
      // Updating the lists on each new block if the accounts balances have changed
      // Doing this this to improve performances by avoiding useless re-rendering
      const { api, contract } = this.context
      const {accounts } = this.props
      const sourceLogClass = this.constructor.name
      if (!this.props.ethBalance.eq(nextProps.ethBalance)) {
        this.getTransactions (null, accounts)
        console.log(`${sourceLogClass} -> componentWillReceiveProps -> Accounts have changed.`);
      } else {
        null
      }
    }

    shouldComponentUpdate(nextProps, nextState){
      const  sourceLogClass = this.constructor.name
      var stateUpdate = true
      var propsUpdate = true
      stateUpdate = !utils.shallowEqual(this.state, nextState)
      propsUpdate = !this.props.ethBalance.eq(nextProps.ethBalance)
      if (stateUpdate || propsUpdate) {
        console.log(`${sourceLogClass} -> shouldComponentUpdate -> Proceedding with rendering.`);
      }
      return stateUpdate || propsUpdate
    }

    componentDidUpdate(nextProps) {
    }

    snackBar = (msg) =>{
      this.setState({
        snackBar: true,
        snackBarMsg: msg
      })
    }

    handlesnackBarRequestClose = () => {
      this.setState({
        snackBar: false,
        snackBarMsg: ''
      })
    }

    handleSetActive = (to) => {
    }

    renderCopyButton = (text) =>{
      if (!text ) {
        return null;
      }
      
      return (
        <CopyToClipboard text={text}
            onCopy={() => this.snackBar('Copied to clipboard')}>
            <Link to={'#'} ><CopyContent className={styles.copyAddress}/></Link>
        </CopyToClipboard>
      );
    }

    renderEtherscanButton = (type, text) =>{
      if (!text ) {
        return null;
      }
      
      return (
      <a href={'https://kovan.etherscan.io/'+type+'/' + text} target='_blank'><Search className={styles.copyAddress}/></a>
      );
    }

    render() {
      const { location, accounts, accountsInfo } = this.props
      const { vaultTransactionsLogs, loading, vaultList } = this.state 
      const tabButtons = {
        inkBarStyle: {
          margin: 'auto',
          width: 100,
          backgroundColor: 'white'
          },
        tabItemContainerStyle: {
          margin: 'auto',
          width: 300,
          backgroundColor: '#FFFFFF',
          zIndex: 1000
        }
      }

      const listAccounts = accounts.map((account) => {
        return (
          <Col xs={6} key={account.name}>
            <ElementAccountBox account={account} key={account.name} snackBar={this.snackBar} />
          </Col>
          )
        }
      )

      return (
        <Row>
          <Col xs={12}>
            <Paper className={styles.paperContainer} zDepth={1}>
              <Toolbar className={styles.detailsToolbar}>
                <ToolbarGroup className={styles.detailsToolbarGroup}>
                  <Row className={styles.detailsToolbarGroup}>
                    <Col xs={12} md={1} className={styles.dragoTitle}>
                      <h2><Avatar size={50} icon={<ActionHome />} /></h2>
                    </Col>
                    <Col xs={12} md={11} className={styles.dragoTitle}>
                      <p>Wizard</p>
                    </Col>
                  </Row>
                </ToolbarGroup>
                <ToolbarGroup>
                  <p>&nbsp;</p>
                </ToolbarGroup>
              </Toolbar>
              <Sticky enabled={true} innerZ={1}>
                <Row className={styles.tabsRow}>
                  <Col xs={12}>
                    <Tabs tabItemContainerStyle={tabButtons.tabItemContainerStyle} inkBarStyle={tabButtons.inkBarStyle}>
                      <Tab label="Accounts" className={styles.detailsTab}
                        onActive={() => scrollToComponent(this.Accounts, { offset: -80, align: 'top', duration: 500 })}
                        icon={<ActionList color={Colors.blue500} />}>
                      </Tab>
                      <Tab label="Drago" className={styles.detailsTab}
                        onActive={() => scrollToComponent(this.Dragos, { offset: -80, align: 'top', duration: 500 })}
                        icon={<ActionAssessment color={Colors.blue500} />}>
                      </Tab>
                      <Tab label="Transactions" className={styles.detailsTab}
                        onActive={() => scrollToComponent(this.Transactions, { offset: -80, align: 'top', duration: 500 })}
                        icon={<ActionShowChart color={Colors.blue500} />}>
                      </Tab>
                    </Tabs>
                  </Col>
                </Row>
              </Sticky>
              <Row className={styles.transactionsStyle}>
                <Col xs={12}>
                  <span ref={(section) => { this.Accounts = section; }}></span>
                  <AppBar
                    title='ACCOUNTS'
                    showMenuIconButton={false}
                    className={styles.appBar}
                    titleStyle={{ fontSize: 20 }}
                  />
                  <Row>
                    {listAccounts}
                  </Row>
                </Col>
              </Row>
              <Row className={styles.transactionsStyle}>
                <Col xs={12}>
                  <span ref={(section) => { this.Dragos = section; }}></span>
                  <AppBar className={styles.appBar}
                    title='FUNDS'
                    showMenuIconButton={false}
                    iconElementRight={<ElementVaultCreateAction accounts={accounts} snackBar={this.snackBar} />}
                       iconStyleRight={{ marginTop: 'auto', marginBottom: 'auto' }}
                      titleStyle={{ fontSize: 20 }}
                  />
                  <Paper zDepth={1}>
                    <Row>
                      <Col className={styles.transactionsStyle} xs={12}>
                        <ElementListWrapper list={vaultList}>
                          <ElementListSupply />
                        </ElementListWrapper>
                      </Col>
                    </Row>
                  </Paper>

                </Col>
              </Row>
              <Row className={styles.transactionsStyle}>
                <Col xs={12}>
                  <span ref={(section) => { this.Transactions = section; }}></span>
                  <AppBar className={styles.appBar}
                    title='TRANSACTIONS'
                    showMenuIconButton={false}
                    titleStyle={{ fontSize: 20 }}
                  />
                  <Paper zDepth={1}>
                    <Row style={{ outline: 'none' }}>
                      <Col className={styles.transactionsStyle} xs={12}>
                        <ElementListWrapper
                          list={vaultTransactionsLogs}
                          renderCopyButton={this.renderCopyButton}
                          renderEtherscanButton={this.renderEtherscanButton}
                        >
                          <ElementListTransactions />
                        </ElementListWrapper>
                      </Col>
                    </Row>
                  </Paper>
                </Col>
              </Row>
            </Paper>
          </Col>
          <Snackbar
            open={this.state.snackBar}
            message={this.state.snackBarMsg}
            action="close"
            onActionTouchTap={this.handlesnackBarRequestClose}
            onRequestClose={this.handlesnackBarRequestClose}
          />
        </Row>  
      )
    }

    // Getting last transactions
    getTransactions = (dragoAddress, accounts) =>{
      const { api } = this.context
      // const options = {balance: false, supply: true}
      const options = {balance: false, supply: true, limit: 10, trader: false}
      var sourceLogClass = this.constructor.name
      utils.getTransactionsVaultOpt(api, dragoAddress, accounts, options)
      .then(results =>{
        console.log(`${sourceLogClass} -> Transactions list loaded`)
        // const createdLogs = results[1].filter(event =>{
        //   return event.type !== 'BuyDrago' && event.type !== 'SellDrago'
        // })
        this.setState({
          vaultList: results[2],
          vaultTransactionsLogs: results[1],
        }, this.setState({
          loading: false,
        }))
      })
    }

    
  }

  export default withRouter(PageDashboardVaultManager)