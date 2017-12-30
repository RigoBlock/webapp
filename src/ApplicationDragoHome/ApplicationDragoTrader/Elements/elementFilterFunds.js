import Autosuggest from 'react-autosuggest'
import Immutable from 'immutable'
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import TextField from 'material-ui/TextField';
import PropTypes from 'prop-types';

import { generateRandomList } from './utils'

class FilterFunds extends Component {

  static PropTypes = {
    fundsList: PropTypes.object.isRequired,
    filterList: PropTypes.func.isRequired,
  };

  filterFunds = (event, newValue) => {
    const { fundsList, filterList } = this.props
    const inputValue = newValue.trim().toLowerCase();
    const inputLength = inputValue.length;
    const funds = fundsList.toJS()
    const filteredFunds = () => {
      return inputLength === 0 ? fundsList.toJS() : funds.filter(fund =>
      fund.params.name.value.toLowerCase().slice(0, inputLength) === inputValue)
    }
    filterList(filteredFunds())
    console.log(filteredFunds())
  }

  render() {
    return (
      <TextField
      hintText=""
      floatingLabelText="Search pools"
      floatingLabelFixed={true}
      onChange={this.filterFunds}
      style={{
        width:'100%',
        fontSize:'16px'
      }}
      />
    )
  }
}

export default FilterFunds