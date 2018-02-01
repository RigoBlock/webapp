// Copyright 2016-2017 Rigo Investment Sarl.

import { Grid, Row, Col } from 'react-flexbox-grid';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import  * as Colors from 'material-ui/styles/colors';
import styles from './elementDialogHeadTitle.module.css';


export default class ElementDialogHeadTitle extends Component {

  static propTypes = {
    primaryText: PropTypes.string.isRequired,
  }

  render = () => {
    return (
      <Row className={styles.modalHeader}>
        <Col xs={12}>
          <Row className={styles.modalHeaderActions} middle="xs" center="xs">
            <Col xs>
              {this.props.primaryText}
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}
