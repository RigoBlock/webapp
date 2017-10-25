// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../parity';

import EventDeposit from './EventDeposit';
import EventWithdraw from './EventWithdraw';
import EventOrderPlaced from './EventOrderPlaced';
import EventOrderMatched from './EventOrderMatched';
import EventOrderCancelled from './EventOrderCancelled';
import EventDealFinalized from './EventDealFinalized';

import { Container, Row, Col } from 'react-grid-system';

import styles from './events.module.css';

import React, { Component } from 'react';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

export default class EventsExchange extends Component {
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

  state = {
    allEvents: [],
    minedEvents: [],
    pendingEvents: [],
    subscriptionIDExchange: null
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
    //   <div className={ styles.events }>
    //     <div className={ styles.container }>
    //       <table className={ styles.list }>
    //         <tbody>
    //           { this.renderEvents() }
    //         </tbody>
    //       </table>
    //     </div>
    //   </div>
    // <div>
    // <Container fluid>
    //   <Container fluid>
    //     <Row>
    //       <Col lg={6}>
    //       <h2>Withdraws and Deposits</h2>
    //       { this.renderEvents(['Deposit', 'Withdraw']) }
    //       </Col>
    //       <Col lg={6}>
    //       <h2>Cancelled Orders</h2>
    //       { this.renderEvents(['OrderCancelled']) }
    //       </Col>
    //     </Row>
    //   </Container>
    //   <Container fluid>
    //     <Row>
    //       <Col>
    //       <h2>Placed Orders</h2>
    //       { this.renderEvents(['OrderPlaced']) }
    //       </Col>
    //       <h2>Matched Orders</h2>
    //       <Col>
    //       { this.renderEvents(['OrderMatched']) }
    //       </Col>
    //     </Row>
    //   </Container>
    // </Container>
    <Container fluid>
    <Row>
      <Col xl={6}>
      <h3>Withdraws and Deposits</h3>
      <Table>
        <TableBody> 
        { this.renderEvents(['Deposit', 'Withdraw']) }
        {/* </div> */}
        </TableBody>
      </Table>
      </Col>
      <Col xl={6}>
      <h3>Cancelled Orders</h3>
      <Table>
        <TableBody> 
        { this.renderEvents(['OrderCancelled']) }
        {/* </div> */}
        </TableBody>
      </Table>
      </Col>
    </Row>
    <Row>
      <Col xl={6}>
      <h3>Placed Placed</h3>
      <Table>
        <TableBody> 
        { this.renderEvents(['OrderPlaced']) }
        {/* </div> */}
        </TableBody>
      </Table>
      </Col>
      <Col xl={6}>
      <h3>Matched Orders</h3>
      <Table>
        <TableBody> 
        { this.renderEvents(['OrderMatched']) }
        {/* </div> */}
        </TableBody>
      </Table>
      </Col>
    </Row>
  </Container>
    
    );
  }

  renderEvents (eventType) {
    const { allEvents } = this.state;

    if (!allEvents.length) {
      return null;
    }

    return allEvents
      //.filter((event) => event.type === type) define type, get from parent
      //.filter((event) => event.type === 'Deposit' || 'Withdraw' ) not working now... || event.type === 'Withdraw'
      // .filter((event) => event.type === 'Deposit' || event.type === 'Withdraw' )
      .filter((event) => eventType.includes(event.type) )
      .map((event) => {
        // switch (event.type) {
        //   case 'Deposit':
        //     return <EventDeposit key={ event.key } event={ event } />;
        //   case 'Withdraw':
        //     return <EventWithdraw key={ event.key } event={ event } />;
        //   case 'OrderPlaced':
        //     return <EventOrderPlaced key={ event.key } event={ event } />;
        //   case 'OrderMatched':
        //     return <EventOrderMatched key={ event.key } event={ event } />;
        //   case 'OrderCancelled':
        //     return <EventOrderCancelled key={ event.key } event={ event } />;
        //   case 'DealFinalized':
        //     return <EventDealFinalized key={ event.key } event={ event } />;
        // }
        switch (event.type) {
          // case 'Deposit':
          //   return <EventDeposit key={ event.key } event={ event } />;
          // case 'Withdraw':
          //   return <EventWithdraw key={ event.key } event={ event } />;
          // case 'OrderPlaced':
          //   return <EventOrderPlaced key={ event.key } event={ event } />;
          // case 'OrderMatched':
          //   return <EventOrderMatched key={ event.key } event={ event } />;
          // case 'OrderCancelled':
          //   return <EventOrderCancelled key={ event.key } event={ event } />;
          // case 'DealFinalized':
          //   return <EventDealFinalized key={ event.key } event={ event } />;
          case 'Deposit':
          return <EventDeposit key={ event.key } event={ event } />;
          case 'Withdraw':
            return <EventDeposit key={ event.key } event={ event } />;
          case 'OrderPlaced':
            return <EventDeposit key={ event.key } event={ event } />;
          case 'OrderMatched':
            return <EventDeposit key={ event.key } event={ event } />;
          case 'OrderCancelled':
            return <EventDeposit key={ event.key } event={ event } />;
          case 'DealFinalized':
            return <EventDeposit key={ event.key } event={ event } />;
        }
      });
  }
/*

  allEvents.filter((event) => (
  <EventsExchange
    type = 'Deposit'
    accountsInfo = { accountsInfo } />
  ))}
*/

  getChildContext () {
    const { accountsInfo } = this.props;

    return { accountsInfo };
  }

  setupFilters () {
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
      limit: 10  //how many transactions to filter
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
      console.log(logs);



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
      console.log(`eventsExchange: Subscribed to contract -> Subscription ID: ${subscriptionID}`);
      this.setState({subscriptionIDExchange: subscriptionID});
    });
  }

  detachInterface = () => {
    const { subscriptionIDExchange } = this.state;
    const { contract } = this.context;
    const { api } = this.context;
    console.log(`eventsExchange: Unsubscribed to contract -> Subscription ID: ${subscriptionIDExchange}`);
    contract.unsubscribe(subscriptionIDExchange).catch((error) => {
      console.warn('Unsubscribe error', error);
    });
  } 
}
