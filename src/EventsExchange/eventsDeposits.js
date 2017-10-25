// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../parity';

import EventDeposit from './EventDeposit';
import EventWithdraw from './EventWithdraw';
import EventOrderPlaced from './EventOrderPlaced';
import EventOrderMatched from './EventOrderMatched';
import EventOrderCancelled from './EventOrderCancelled';
import EventDealFinalized from './EventDealFinalized';

import styles from './events.module.css';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

export default class EventsDeposits extends Component {
  static childContextTypes = {
    accountsInfo: PropTypes.object
  }

  static contextTypes = {
    //contractExchange: PropTypes.object.isRequired,
    contract: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired
  }

  static propTypes = {
    accountsInfo: PropTypes.object.isRequired
  }

  state = {
    allEvents: [],
    minedEvents: [],
    pendingEvents: [],
    subscriptionIDDeposit: null
  }

  componentDidMount () {
    this.setupFilters();
  }

  componentWillUnmount() {
    // Unsubscribing to the event when the the user moves away from this page
    this.detachInterface();
  }

  render () {
    return (
      // <div className={ styles.events }>
      //   <div className={ styles.container }>
      //     <table className={ styles.list }>
      //       <tbody>
              this.renderEvents()
            {/* </tbody>
          </table>
        </div>
      </div> */}
    );
  }

  renderEvents () {
    const { allEvents } = this.state;

    if (!allEvents.length) {
      return null;
    }

    return allEvents
      //.filter((event) => event.type === 'Deposit' || 'Withdraw' ) not working now...
      //.filter((event) => event.type === 'Deposit' || 'event.type === 'Withdraw' ) //this should be working
      .filter((event) => event.type === 'Deposit' || event.type === 'Withdraw' )
      .map((event) => {
        switch (event.type) {
          case 'Deposit':
            return <EventDeposit key={ event.key } event={ event } />;
          case 'Withdraw':
            return <EventWithdraw key={ event.key } event={ event } />;
          case 'OrderPlaced':
            return <EventOrderPlaced key={ event.key } event={ event } />;
          case 'OrderMatched':
            return <EventOrderMatched key={ event.key } event={ event } />;
          case 'OrderCancelled':
            return <EventOrderCancelled key={ event.key } event={ event } />;
          case 'DealFinalized':
            return <EventDealFinalized key={ event.key } event={ event } />;
        }
      });
  }

  getChildContext () {
    const { accountsInfo } = this.props;

    return { accountsInfo };
  }

  setupFilters () {
    //const { contractExchange } = this.context;
    const { api } = this.context;
    const { contract } = this.context;

    const sortEvents = (a, b) => b.blockNumber.cmp(a.blockNumber) || b.logIndex.cmp(a.logIndex);
    const logToEvent = (log) => {
      const key = api.util.sha3(JSON.stringify(log));
      const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log;

      return {
        type: log.event,
        state: type,
        blockNumber,
        logIndex,
        transactionHash,
        transactionIndex,
        params: Object.keys(params).reduce((data, name) => {
          data[name] = params[name].value;
          return data;
        }, {}),
        key
      };
    };

    const options = {
      fromBlock: 0,
      toBlock: 'pending',
      limit: 200
    };

    contract.subscribe(null, options, (error, _logs) => { //contractExchange
      if (error) {
        console.error('setupFilters', error);
        return;
      }

      if (!_logs.length) {
        return;
      }
      console.log(logs);




      
      const logs = _logs.map(logToEvent);

      const minedEvents = logs
        .filter((log) => log.state === 'mined')
        .reverse()
        .concat(this.state.minedEvents)
        .sort(sortEvents);
      const pendingEvents = logs
        .filter((log) => log.state === 'pending')
        .reverse()
        .concat(this.state.pendingEvents.filter((event) => {
          return !logs.find((log) => {
            const isMined = (log.state === 'mined') && (log.transactionHash === event.transactionHash);
            const isPending = (log.state === 'pending') && (log.key === event.key);

            return isMined || isPending;
          });
        }))
        .sort(sortEvents);
      const allEvents = pendingEvents.concat(minedEvents);

      this.setState({
        allEvents,
        minedEvents,
        pendingEvents
      });
    }).then((subscriptionID) => {
      console.log(`eventsDeposits: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
      this.setState({subscriptionIDDeposit: subscriptionID});
    });
  }

  detachInterface = () => {
    const { subscriptionIDDeposit } = this.state;
    const { api } = this.context;
    console.log(`eventsDeposits: Unsubscribed to eth_blockNumber -> Subscription ID: ${subscriptionIDDeposit}`);
    api.unsubscribe(subscriptionIDDeposit).catch((error) => {
      console.warn('Unsubscribe error', error);
    });
  } 
}
