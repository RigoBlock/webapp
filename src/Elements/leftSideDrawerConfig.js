import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, withRouter, NavLink } from 'react-router-dom';
import {APP, DS} from '../utils/const.js'

import styles from './elements.module.css';

import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/Menu';

import Divider from 'material-ui/Divider';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionSwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import ActionAssessment from 'material-ui/svg-icons/action/assessment';
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import { Visible, Hidden } from 'react-grid-system'

var drawerStyle = {
  activeLink: {
    backgroundColor: '#E0E0E0',
    color: '#757575',
   },
};

class LeftSideDrawerConfig extends Component {

  constructor(props) {
    super(props);
  }

  static propTypes = {
      location: PropTypes.object.isRequired,
    };

    state = {
      selectedItem: this.props.location.pathname
  }


 buildUrlPath = (location) => {
  var path = location.pathname.split( '/' );
  // path.splice(-1,1);
  // var url = path.join('/');
  return path[2]
  }

  setSelectedLink = (location) => {
    return location.pathname.split( '/' ).pop()
    }

  render() {
    var { location} = this.props
    return (

      <Drawer open={true}
      containerClassName={styles.containerleftDrawer} className={styles.leftDrawer}>
      <Hidden xs sm>
        <Menu
          selectedMenuItemStyle={ drawerStyle.activeLink }
          value={this.setSelectedLink(location)}        
          >
          <MenuItem checked={true} primaryText="Network" leftIcon={<ActionSwapHoriz />} 
            containerElement={<Link to={DS+APP+DS+this.buildUrlPath(location)+DS+"network"} />}
            value='network'/>
        </Menu>
      </Hidden>
      </Drawer>


    )
  }
}

export default withRouter(LeftSideDrawerConfig)