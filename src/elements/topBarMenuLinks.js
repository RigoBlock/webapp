import  * as Colors from 'material-ui/styles/colors'
import { Link, Route, withRouter } from 'react-router-dom'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import ActionAccountBalance from 'material-ui/svg-icons/action/account-balance'
import ActionHome from 'material-ui/svg-icons/action/home'
import ActionLightBulb from 'material-ui/svg-icons/action/lightbulb-outline'
import ActionPolymer from 'material-ui/svg-icons/action/polymer'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import Settings from 'material-ui/svg-icons/action/settings'
import Help from 'material-ui/svg-icons/action/help'
import Drawer from 'material-ui/Drawer'
import DropDownMenu from 'material-ui/DropDownMenu'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import NotificationWifi from 'material-ui/svg-icons/notification/wifi';
import FaltButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import ArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down'

import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import {grey400, darkBlack, lightBlack} from 'material-ui/styles/colors';

import {APP, DS} from '../utils/const.js'
// import ElementNotificationsDrawer from '.Elements/elementNotificationsDrawer'

import styles from './elements.module.css'

var menuStyles = {
    dropDown: {
        color: "#ffffff"
    },
    separator: {
        backgroundColor: "#ffffff",
        opacity: 0.5
    },
    profileIcon: {
        color: "#ffffff"
    },
};

var disabledUserType = {
  dropDown: {
  }
}

var enabledUserType = {
  dropDown: {
    color: "#ffffff"
  }
}


class NavLinks extends Component {

    constructor(props) {
        super(props);
      }

    static propTypes = {
        location: PropTypes.object.isRequired,
        handleTopBarSelectAccountType: PropTypes.func.isRequired,
        isManager: PropTypes.bool,
        handleToggleNotifications: PropTypes.func.isRequired,
      };

    state = {
      notificationsOpen: false,
      allEvents: null,
      minedEvents: null,
      pendingEvents: null,
      subscriptionIDDrago: null
    }

    componentDidMount () {
        this.activeSectionPath()
    }

    activeSectionPath = () => {
        const {location, match} = this.props
        var path = match.path.split( '/' )
        return path[3]
        }

    renderTopLinks = (links) => {
      const activeLink = this.activeSectionPath()
      var backgroundColorActive = Colors.blue500
      return links.map((link) => {
        link.to === activeLink ? backgroundColorActive = Colors.blue300 : backgroundColorActive = Colors.blue500
        return (
          <FlatButton key={link.label} label={link.label.toUpperCase()} containerElement={<Link to={'/'+link.to} />} disableTouchRipple={true} 
          hoverColor="#2196f3" className={styles.topbarbuttons}
          icon={link.icon}
          labelStyle={{fontWeight: 700}}
          backgroundColor={backgroundColorActive}
          />
        )
      })
    }

    buildUrlPath = (location) => {
      var path = location.pathname.split( '/' );
      // path.splice(-1,1);
      // var url = path.join('/');
      return path[2]
      }

      handleClick = (event) => {
        // This prevents ghost click.
        event.preventDefault();
    
        this.setState({
          open: true,
          anchorEl: event.currentTarget,
        });
      };
    
      handleRequestClose = () => {
        this.setState({
          open: false,
        });
      };

    render() {
      var { location, handleTopBarSelectAccountType, isManager, handleToggleNotifications } = this.props
      let userTypeDisabled = false;
      var userTypeLabel = 'HOLDER'
      const links = [
        {label: 'home', to: 'home', icon: <ActionHome color="white"/>},
        // {label: 'vault', to: 'vault', icon: <ActionAccountBalance color="white"/>},
        {label: 'vault', to: 'vaultv2', icon: <ActionAccountBalance color="white"/>},
        {label: 'drago', to: 'drago', icon: <ActionShowChart color="white"/>},
        // {label: 'exchange', to: 'exchange', icon: <ActionPolymer color="white"/>}
         ]

      const compactStyle = {
        padding: "0px !important"
      }


      const buttonAccountType = {
        border: "1px solid",
        borderColor: '#FFFFFF',
        // width: "140px"
      }


      // Disabling user type if isManager not defined
      if (typeof isManager === 'undefined') {
        isManager = false;
        userTypeDisabled = true;
        menuStyles = {...menuStyles, ...disabledUserType};
      } else {
        isManager ? userTypeLabel = 'WIZARD' : userTypeLabel = 'HOLDER'
        menuStyles = {...menuStyles, ...enabledUserType};
      }

      return (
        <ToolbarGroup>
          <ToolbarGroup>
            {this.renderTopLinks(links)}
          </ToolbarGroup>
          <ToolbarSeparator style={menuStyles.separator} />
          <ToolbarGroup>
            <FlatButton
              onClick={this.handleClick}
              labelPosition="before"
              label={userTypeLabel}
              labelStyle={{ color: '#FFFFFF' }}
              style={buttonAccountType}
              icon={<ArrowDropDown color='#FFFFFF'/>}
              hoverColor={Colors.blue300}
            />
            <Popover
              open={this.state.open}
              anchorEl={this.state.anchorEl}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              targetOrigin={{ horizontal: 'right', vertical: 'top' }}
              onRequestClose={this.handleRequestClose}
              style={{marginTop: "5px"}}

            >
              <Menu value={isManager} 
              onChange={handleTopBarSelectAccountType}
              desktop={true}
              className={styles.menuAccountType}
              >
                <MenuItem
                value={false} 
                primaryText={
                  <div>
                  <div className={styles.menuItemPrimaryText}>HOLDER</div>
                  <div><small>Invest in funds</small></div>
                  </div>
                }
                />
                <MenuItem value={true} 
                primaryText={
                  <div>
                  <div className={styles.menuItemPrimaryText}>WIZARD</div>
                  <div><small>Manage your funds</small></div>
                  </div>
                }
                />
              </Menu>
            </Popover>
            {/* <DropDownMenu value={isManager} onChange={handleTopBarSelectAccountType}
              labelStyle={menuStyles.dropDown} disabled={userTypeDisabled}
              anchorOrigin={ {vertical: 'bottom', horizontal: 'left',}}
              style={this.compactStyle}
              >
              <MenuItem value={false} primaryText="Holder" />
              <MenuItem value={true} primaryText="Wizard" />
            </DropDownMenu> */}
            <IconMenu
              iconButtonElement={<IconButton><AccountIcon /></IconButton>}
              iconStyle={menuStyles.profileIcon}
              anchorOrigin={ {vertical: 'bottom', horizontal: 'left',}}
              desktop={true}
            >
              <MenuItem leftIcon={<Settings />} value="config" primaryText="Config"
                containerElement={<Link to={DS + APP + DS + this.buildUrlPath(location) + DS + "config"} />} />
              <MenuItem leftIcon={<Help />} value="help" primaryText="Help" />
            </IconMenu>
            <IconButton tooltip="Network" onClick={handleToggleNotifications} iconStyle={menuStyles.profileIcon}>
              <NotificationWifi />
            </IconButton>
            {/* <ElementNotificationsDrawer handleToggleNotifications={this.handleToggleNotifications} accounts={accounts}/> */}
          </ToolbarGroup>
        </ToolbarGroup>
      )
    }
  }



  export default withRouter(NavLinks)