import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, withRouter, HashRouter, Switch, Redirect } from 'react-router-dom'
import { Grid, Row, Col } from 'react-flexbox-grid';
import {APP, DS} from '../../utils/const.js'
import utils from '../../utils/utils.js'
import PageDashboardVaultTrader from './pageDashboardVaultTrader'
import PageVaultsVaultTrader from './pageVaultsVaultTrader'
import PageVaultDetailsVaultTrader from './pageVaultDetailsVaultTrader'



import styles from '../applicationVaultHome.module.css';

class ApplicationVaultTrader extends Component {

    static propTypes = {
      location: PropTypes.object.isRequired,
      ethBalance: PropTypes.object.isRequired,
      accounts: PropTypes.array.isRequired,
      accountsInfo: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
      match: PropTypes.object.isRequired,
      isManager: PropTypes.bool.isRequired
    };


    render() {
      const { ethBalance, location, blockNumber, accounts, match, allEvents, accountsInfo, isManager } = this.props;
      return (
        <Switch>
          <Route path={match.path+"/dashboard"} 
              render={(props) => <PageDashboardVaultTrader {...props}               
                blockNumber={blockNumber}
                accounts={accounts}
                ethBalance={ethBalance}
                allEvents={allEvents}
                accountsInfo={accountsInfo} />
              } 
          />
          <Route exact path={match.path+"/pools"}
            render={(props) => <PageVaultsVaultTrader {...props}               
            blockNumber={blockNumber}
            accounts={accounts}
            ethBalance={ethBalance} 
            allEvents={allEvents}
            accountsInfo={accountsInfo}
            />
          } 
          />
          <Route path={match.path+"/pools/:dragoid/:dragocode"}
            render={(props) => <PageVaultDetailsVaultTrader {...props}               
            blockNumber={blockNumber}
            accounts={accounts}
            ethBalance={ethBalance} 
            allEvents={allEvents}
            accountsInfo={accountsInfo}
            isManager={isManager}
            />
          } 
          />
          <Redirect from={match.path} to={match.path+"/dashboard"}  />
        </Switch>
      );
    }
  }

  export default withRouter(ApplicationVaultTrader)