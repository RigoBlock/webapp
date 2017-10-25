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

export default class EventsGabcoinCreated extends Component {
  static childContextTypes = {
    accountsInfo: PropTypes.object
  }

  static contextTypes = {
    api: PropTypes.object.isRequired,
    contract: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired
  }

  static propTypes = {
    accountsInfo: PropTypes.object.isRequired
  }

  getChildContext () {
    const { accountsInfo } = this.props;

    return { accountsInfo };
  }

  state = {
    allEvents: [],
    minedEvents: [],
    pendingEvents: [],
    subscriptionIDContractCreated: null
  }

  componentDidMount () {
    this.setupFilters();
    console.log('eventsGabcoinCreated mounted');
  }

  componentWillUnmount() {
    // We are goint to close the websocket connection when the the user moves away from this app
    this.detachInterface();
  }

  render () {
    return (
      <div className={ styles.events }>
        <div className={ styles.container }>
          <table className={ styles.list }>
            <tbody>
              { this.renderEvents() }
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  renderEvents () {
    const { allEvents } = this.state;

    if (!allEvents.length) {
      return null;
    }

    return allEvents
      .filter((event) => event.type === 'GabcoinCreated' )
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

  /*case 'NewTranch':
    return <EventNewTranch key={ event.key } event={ event } />;
  case 'Refund':
    return <EventRefund key={ event.key } event={ event } />;
  case 'Transfer':
    return <EventTransfer key={ event.key } event={ event } />;*/



  setupFilters () {
    const { contract } = this.context;
    const { api } = this.context;
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
      console.log(`eventsGabcoinCreated: Subscribed to contract ${contract._address} -> Subscription ID: ${subscriptionID}`);
      this.setState({subscriptionIDContractCreated: subscriptionID});
    });
  }

  detachInterface = () => {
    const { contract } = this.context;
    const { api } = this.context;
    const { subscriptionIDContractCreated } = this.state;
    console.log(`eventsGabcoinCreated: Unsubscribed from contract ${contract._address} -> Subscription ID: ${subscriptionIDContractCreated}`);
    contract.unsubscribe(subscriptionIDContractCreated).catch((error) => {
      console.warn('Unsubscribe error', error);
    });
    console.log(this.context);
  }  
}
