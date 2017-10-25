// Copyright 2016-2017 Gabrele Rigo

import styles from './loading.module.css';

import React, { Component } from 'react';

import { CircularProgress, LinearProgress } from 'material-ui';

export default class Loading extends Component {
  render () {
    return (
      <div className={ styles.loading }>
        <CircularProgress size={ 120 } thickness={ 7 } />
        {/* <LinearProgress mode="indeterminate" /> */}
      </div>
    );
  }
}
