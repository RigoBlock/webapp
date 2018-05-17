// Copyright 2016-2017 Rigo Investment Sarl.

import styles from './orderTypeSelector.module.css';
import React, { Component } from 'react';
import { MenuItem, SelectField } from 'material-ui';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';

export default class OrderTypeSelector extends Component {
  static propTypes = {
    orderTypes: PropTypes.array.isRequired,
    onSelectOrderType: PropTypes.func,
  }

  state = {
    value: 0,
  };

  onSelectOrderType = (event, key) => {
    const { orderTypes } = this.props
    this.setState({
      value: key
    })
    this.props.onSelectOrderType(orderTypes[key.toString()])
  }

  renderOrderTypes = () =>{
    const { orderTypes } = this.props
    return orderTypes.map((orderType,key) =>{
      return (
      <MenuItem key={key} 
        value={key} 
        primaryText={orderType} 
      />
    )
    })
  }

  render () {
    return (
      <Row bottom="xs"> 
        {/* <Col xs={12}>
          <div className={styles.sectionTitle}>
            Fund
        </div>
        </Col> */}
        <Col xs={12} >
          <SelectField
            floatingLabelText="Type"
            fullWidth
            value={this.state.value}
            onChange={this.onSelectOrderType}
          // style={{height: 90}}
          >
            {this.renderOrderTypes()}
          </SelectField>
        </Col>
      </Row>
    );
  }
}