import  * as Colors from 'material-ui/styles/colors'
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Link, Route, withRouter } from 'react-router-dom'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import AccountIcon from 'material-ui/svg-icons/action/account-circle';
import ActionAssessment from 'material-ui/svg-icons/action/assessment'
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionLightBulb from 'material-ui/svg-icons/action/lightbulb-outline';
import ActionPolymer from 'material-ui/svg-icons/action/polymer'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import Avatar from 'material-ui/Avatar';
import DropDownMenu from 'material-ui/DropDownMenu'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import Immutable from 'immutable'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import { toHex } from '../../format';
import DragoApi from '../../DragoApi/src'
import ElementListVaults from '../Elements/elementListVaults'
import FilterVaults from '../Elements/elementFilterVaults'
import Loading from '../../Loading';
import utils from '../../utils/utils'
import ElementListWrapper from '../../Elements/elementListWrapper'

import styles from './pageVaultsVaultTrader.module.css'

// Getting events signatures
const dragoFactoryEventsSignatures = (contract) => {
  const events = contract._events.reduce((events, event) => {
    events[event._name] = {
      hexSignature: toHex(event._signature)
    }
    return events
  }, {})
  return events
}


class PageFundsVaultTrader extends Component {

  constructor() {
    super()
    this.filterList = this.filterList.bind(this);
  }

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
      vaultCreatedLogs: [],
      vaultFilteredList: []
    }

    scrollPosition = 0

    componentWillMount () {
      this.getVaults()
    }

    componentWillReceiveProps(nextProps) {
      // Updating the lists on each new block if the accounts balances have changed
      // Doing this this to improve performances by avoiding useless re-rendering
      const { api, contract } = this.context
      const {accounts } = this.props
      const sourceLogClass = this.constructor.name
      if (!this.props.ethBalance.eq(nextProps.ethBalance)) {
        this.getVaults()
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

    filterList (filteredList) {
      const { vaultCreatedLogs } = this.state;
      this.setState({
        vaultFilteredList: filteredList
      })
    }

    render() {
      var { location, accountsInfo, allEvents, match } = this.props
      const { vaultCreatedLogs, vaultFilteredList } = this.state;
      // const vaultSearchList = Immutable.List(vaultCreatedLogs)
      // const vaultList = Immutable.List(vaultFilteredList)
      const vaultSearchList = vaultCreatedLogs
      const vaultList = vaultFilteredList
      const detailsBox = {
        padding: 20,
      }

      return (
        <Row>
        <Col xs={12}>
          <Paper className={styles.paperContainer} zDepth={1}>
            <Toolbar className={styles.detailsToolbar}>
                <ToolbarGroup className={styles.detailsToolbarGroup}>
                  <Row className={styles.detailsToolbarGroup}>
                    <Col xs={12} md={1} className={styles.dragoTitle}>
                      <h2><Avatar size={50} icon={<ActionShowChart />} /></h2>
                    </Col>
                    <Col xs={12} md={11} className={styles.dragoTitle}>
                    <p>Vaults</p>
                    <small></small>
                    </Col>
                  </Row>
                </ToolbarGroup> 
                <ToolbarGroup>
                <p>&nbsp;</p>
                </ToolbarGroup>
            </Toolbar>
            <Row className={styles.transactionsStyle}>
              <Col xs>
                <Paper style={detailsBox} zDepth={1}>
                <ElementListWrapper fundsList={vaultSearchList} filterList={this.filterList} poolType="vault">
                  <FilterVaults/>
                </ElementListWrapper>
                </Paper>
                <p></p>
              </Col>
            </Row>
            <Row className={styles.transactionsStyle}>
              <Col xs>
                <ElementListWrapper list={vaultList} location={location} match={match} poolType="vault">
                  <ElementListVaults/>
                </ElementListWrapper>
              </Col>
            </Row>
          </Paper>
        </Col>
      </Row>
      )
    }

    getVaults () {
      const { api } = this.context;
      const dragoApi = new DragoApi(api)
      const logToEvent = (log) => {
        const key = api.util.sha3(JSON.stringify(log))
        const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log       
        params.dragoID = params.gabcoinID 

        return {
          type: log.event,
          state: type,
          blockNumber,
          logIndex,
          transactionHash,
          transactionIndex,
          params,
          key
        }
      }
  
      // const options = {
      //   fromBlock: 0,
      //   toBlock: 'pending',
      //   limit: 50
      // };
      
      // Getting all DragoCreated events since block 0.
      // dragoFactoryEventsSignatures accesses the contract ABI, gets all the events and for each creates a hex signature
      // to be passed to getAllLogs. Events are indexed and filtered by topics
      // more at: http://solidity.readthedocs.io/en/develop/contracts.html?highlight=event#events
      dragoApi.contract.vaulteventful.init()
      .then(() =>{
        dragoApi.contract.vaulteventful.getAllLogs({
          topics: [ dragoApi.contract.vaulteventful.hexSignature.GabcoinCreated] 
        })
        .then((vaultCreatedLogs) => {
          const logs = vaultCreatedLogs.map(logToEvent)
          this.setState({
            vaultCreatedLogs: logs,
            vaultFilteredList: logs
          })
        }
        )
      })
    }
  }

  export default withRouter(PageFundsVaultTrader)

 