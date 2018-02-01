import Immutable from 'immutable'
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import TextField from 'material-ui/TextField';
import PropTypes from 'prop-types';


class FilterVaults extends Component {

  static propTypes = {
    fundsList: PropTypes.array,
    filterList: PropTypes.func,
  };

  filterFunds = (event, newValue) => {
    const { fundsList, filterList } = this.props
    const inputValue = newValue.trim().toLowerCase();
    const inputLength = inputValue.length;
    const funds = fundsList
    const filteredFunds = () => {
      return inputLength === 0 ? fundsList : funds.filter(fund =>
      fund.params.name.value.toLowerCase().slice(0, inputLength) === inputValue)
    }
    filterList(filteredFunds())
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

export default FilterVaults