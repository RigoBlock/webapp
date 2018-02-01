// Copyright 2016-2017 Rigo Investment Sarl.

// import { api } from '../parity';
import styles from './identityIcon.module.css';

import React, { Component} from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

export default class IdentityIcon extends Component {
  static propTypes = {
    address: PropTypes.string.isRequired
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  render () {
    const { address } = this.props;
    const { api } = this.context;

    return (
      <img
        className={ styles.icon }
        src={ api.util.createIdentityImg(address, 4) } />
    );
  }
}
