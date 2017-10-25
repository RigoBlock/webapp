// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../parity';

import EventBuyGabcoin from './EventBuyGabcoin';
//import EventNewTranch from './EventNewTranch';
//import EventRefund from './EventRefund';
//import EventTransfer from './EventTransfer';
import EventGabcoinCreated from './EventGabcoinCreated';
import EventSellGabcoin from './EventSellGabcoin';

import styles from './events.module.css';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

export default class EventsGabcoin extends Component {

  // Defining the properties of the context variables passed down to the children
  static childContextTypes = {
    accountsInfo: PropTypes.object

  };

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired,
    contract: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired
  };
  
  // Passing down the context variables to the children
  getChildContext () {
    const { accountsInfo } = this.props;

    return { accountsInfo };
  }



  static propTypes = {
    accountsInfo: PropTypes.object.isRequired
  }

  state = {
    allEvents: [],
    minedEvents: [],
    pendingEvents: [],
    subscriptionIDContractGabcoin: null
  }

  componentDidMount () {
    this.setupFilters();
    console.log('eventsGabcoin mounted');
  }

  componentWillUnmount() {
    // We are goint to close the websocket connection when the the user moves away from this app
    this.detachInterface();
  }

  render () {
    return (
      <div className={ styles.events }>
        <div className={ styles.container }>
        <h1>New Vault</h1>
          <table className={ styles.list }>
            <tbody>
              { this.renderEvents(['GabcoinCreated']) }
            </tbody>
          </table>
          <br />
          <h1>Vault Transactions</h1>
          <table className={ styles.list }>
            <tbody>
              { this.renderEvents(['BuyGabcoin', 'SellGabcoin']) }
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  renderEvents (eventType) {
    const { allEvents } = this.state;
    if (!allEvents.length) {
      return null;
    }
    console.log();
    return allEvents
      .filter((event) => eventType.includes(event.type) )
      .map((event) => {
        switch (event.type) {
          case 'BuyGabcoin':
            return <EventBuyGabcoin key={ event.key } event={ event } />;
          case 'GabcoinCreated':
            return <EventGabcoinCreated key={ event.key } event={ event } />;
          case 'SellGabcoin':
            return <EventSellGabcoin key={ event.key } event={ event } />;
        }
      });
  }

/*
case 'NewTranch':
  return <EventNewTranch key={ event.key } event={ event } />;
case 'Refund':
  return <EventRefund key={ event.key } event={ event } />;
case 'Transfer':
  return <EventTransfer key={ event.key } event={ event } />;
*/



  setupFilters () {
    const { contract } = this.context;
    const { api } = this.context;
    console.log(contract);

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
      limit: 50
    };

    contract.subscribe(null, options, (error, _logs) => {
      if (error) {
        console.error('setupFilters', error);
        return;
      }

      if (!_logs.length) {
        return;
      }

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
      console.log(`eventsGabcoin: Subscribed to contract ${contract._address} -> Subscription ID: ${subscriptionID}`);
      this.setState({subscriptionIDContractGabcoin: subscriptionID});
    });
  }

  detachInterface = () => {
    const { contract } = this.context;
    const { api } = this.context;
    const { subscriptionIDContractGabcoin } = this.state;
    console.log(`eventsGabcoin: Unsubscribed from contract ${contract._address} -> Subscription ID: ${subscriptionIDContractGabcoin}`);
    contract.unsubscribe(subscriptionIDContractGabcoin).catch((error) => {
      console.warn('Unsubscribe error', error);
    });
    console.log(this.context);
  }  
}
