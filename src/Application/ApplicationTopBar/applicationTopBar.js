import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom'
import AppBar from 'material-ui/AppBar';
import NavLinks from '../../Elements/topBarMenuLinks';

class ApplicationTopBar extends Component {
    constructor(props) {
      super(props)

    }

    static propTypes = {
      location: PropTypes.object.isRequired,
      handleTopBarSelectAccountType: PropTypes.func,
      handleToggleNotifications: PropTypes.func.isRequired,
    };

    state = {

    }

renderTitle = () =>{
  return (
    <div>
      {/* <span>RigoBlock</span>&nbsp;<span style={{fontSize: "12px"}}>beta <img style={{height: "20px", width: "20px"}} src='/img/new_logo_white.png'/></span> */}
      <span><img style={{height: "32px", paddingTop: "8px"}} src='/img/new_logo_white.png'/></span>&nbsp;<span style={{fontSize: "12px"}}>beta </span>
      {/* <img style={{height: "100px", width: "100px"}} src='/img/new_logo_white.png'/> */}
    </div>
    
  )
}

    render() {
      const { location, handleTopBarSelectAccountType, handleToggleNotifications } = this.props
      return (
        <AppBar
          title={this.renderTitle()}
          showMenuIconButton={false}
          iconElementRight={<NavLinks handleToggleNotifications={handleToggleNotifications}
          location={location} handleTopBarSelectAccountType={ handleTopBarSelectAccountType }/>}
        />  
      )
    }
  }

export default withRouter(ApplicationTopBar)