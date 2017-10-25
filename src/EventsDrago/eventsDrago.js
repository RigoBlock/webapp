// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../parity';

import EventBuyDrago from './EventBuyDrago';
import EventNewTranch from './EventNewTranch';
import EventRefund from './EventRefund';
import EventTransfer from './EventTransfer';
import EventDragoCreated from './EventDragoCreated';
import EventSellDrago from './EventSellDrago';
import { Row, Col } from 'react-grid-system';

import styles from './events.module.css';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

export default class EventsDrago extends Component {
  static childContextTypes = {
    accountsInfo: PropTypes.object
  }

  static contextTypes = {
    api: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired,
    contract: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired
  }

  static propTypes = {
    accountsInfo: PropTypes.object.isRequired
  }

  // Passing down the context variables to the children
  getChildContext () {
    const { accountsInfo } = this.props;

    return { accountsInfo };
  }

  state = {
    allEvents: [],
    minedEvents: [],
    pendingEvents: [],
    subscriptionIDContractDrago: null
  }

  componentDidMount () {
    this.setupFilters();
  }

  componentWillUnmount() {
    // We are goint to close the websocket connection when the the user moves away from this app
    this.detachInterface();
  }

  render () {
    return (
      <div className={ styles.events }>
      <div className={ styles.container }>
      <h1>New Drago</h1>
        <table className={ styles.list }>
          <tbody>
            { this.renderEvents(['DragoCreated']) }
          </tbody>
        </table>
        <br />
        <h1>Drago Transactions</h1>
        <table className={ styles.list }>
          <tbody>
            { this.renderEvents(['BuyDrago', 'SellDrago']) }
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
    return allEvents
      .filter((event) => eventType.includes(event.type) )
      .map((event) => {
        switch (event.type) {
          case 'BuyDrago':
            return <EventBuyDrago key={ event.key } event={ event } />;
          case 'NewTranch':
            return <EventNewTranch key={ event.key } event={ event } />;
          case 'Refund':
            return <EventRefund key={ event.key } event={ event } />;
          case 'Transfer':
            return <EventTransfer key={ event.key } event={ event } />;
          case 'DragoCreated':
            return <EventDragoCreated key={ event.key } event={ event } />;
          case 'SellDrago':
            return <EventSellDrago key={ event.key } event={ event } />;
        }
      });
  }

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
      console.log(`eventsDrago: Subscribed to contract ${contract._address} -> Subscription ID: ${subscriptionID}`);
      this.setState({subscriptionIDContractDrago: subscriptionID});
    });
  }

  detachInterface = () => {
    const { contract } = this.context;
    const { api } = this.context;
    const { subscriptionIDContractDrago } = this.state;
    console.log(`eventsDrago: Unsubscribed from contract ${contract._address} -> Subscription ID: ${subscriptionIDContractDrago}`);
    contract.unsubscribe(subscriptionIDContractDrago).catch((error) => {
      console.warn('Unsubscribe error', error);
    });
    console.log(this.context);
  }  
}
