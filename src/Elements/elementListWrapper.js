import Immutable from 'immutable'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import Loading from '../Loading'

class ElementListWrapper extends Component {

  static propTypes = {
    list: PropTypes.array,
    location: PropTypes.object,
    match: PropTypes.object,
    poolType: PropTypes.string
  };

  render() {
    // Exstracting the list form props
    // and checking if the list === null
    const {list, ...rest} = this.props;
    if ((list === null)) {
      return <Loading />
    }
    // Rendering the table is list is an array
    const immutableList = Immutable.List(list) 
    // Merging the immutable list into the props passed to children
    const newProps = { list: immutableList,  ...rest}
    return (    
      <span>
        {React.cloneElement(this.props.children, newProps)}
      </span>
    )
    
  }
}

export default ElementListWrapper