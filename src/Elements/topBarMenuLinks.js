import * as Colors from 'material-ui/styles/colors'
import { Link, withRouter } from 'react-router-dom'
import { ToolbarGroup, ToolbarSeparator } from 'material-ui/Toolbar'
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import ActionAccountBalance from 'material-ui/svg-icons/action/account-balance'
import ActionHome from 'material-ui/svg-icons/action/home'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import ActionPolymer from 'material-ui/svg-icons/action/polymer'
import Settings from 'material-ui/svg-icons/action/settings'
import Help from 'material-ui/svg-icons/action/help'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import NotificationWifi from 'material-ui/svg-icons/notification/wifi';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import ArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down'
import { APP, DS } from '../_utils/const.js'
import { connect } from 'react-redux';
// import ElementNotificationsDrawer from '.Elements/elementNotificationsDrawer'
import { IS_MANAGER } from '../_utils/const'
import styles from './elements.module.css'
import utils from '../_utils/utils'
import Badge from 'material-ui/Badge';


function mapStateToProps(state) {
  return state
}


var menuStyles = {
  dropDown: {
    color: "#ffffff"
  },
  separator: {
    backgroundColor: "#ffffff",
    opacity: 0.5
  },
  profileIcon: {
    open: {
      color: "#2196F3"
    },
    closed: {
      color: "#ffffff"
    }
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
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    handleToggleNotifications: PropTypes.func.isRequired,
    transactions: PropTypes.object.isRequired,
  };

  state = {
    notificationsOpen: false,
    allEvents: null,
    minedEvents: null,
    pendingEvents: null,
    subscriptionIDDrago: null,
    transactionsDrawerOpen: false,
    transactionsDrawerNetworkButtonStyle: styles.networkIconClosed,
    transactionsDrawerNetworkButtonIconStyle: menuStyles.profileIcon.closed
  }

  shouldComponentUpdate(nextProps, nextState) {
    const sourceLogClass = this.constructor.name
    var stateUpdate = true
    var propsUpdate = true
    propsUpdate = !utils.shallowEqual(this.props, nextProps)
    stateUpdate = !utils.shallowEqual(this.state, nextState)
    if (stateUpdate || propsUpdate) {
      // console.log(`${sourceLogClass} -> shouldComponentUpdate: TRUE -> Proceedding with rendering.`);
    }
    return stateUpdate || propsUpdate
  }

  isManagerAction = (isManager) => {
    return {
      type: IS_MANAGER,
      payload: isManager
    }
  };

  // value = 1 = Trader
  // value = 2 = Manager
  handleTopBarSelectAccountType = (event, value) => {
    const accountType = {
      false: false,
      true: true
    }
    this.props.dispatch(this.isManagerAction(accountType[value]))
  };

  componentDidMount() {
    this.activeSectionPath()
  }

  activeSectionPath = () => {
    const { location, match } = this.props
    var path = match.path.split('/')
    return path[3]
  }

  renderTopLinks = (links) => {
    const activeLink = this.activeSectionPath()
    var backgroundColorActive = Colors.blue500
    const { location } = this.props
    return links.map((link) => {
      link.to === activeLink ? backgroundColorActive = Colors.blue300 : backgroundColorActive = Colors.blue500
      return (
        <FlatButton key={link.label} label={link.label.toUpperCase()} containerElement={<Link to={DS + APP + DS + this.buildUrlPath(location) + DS + link.to} />} disableTouchRipple={true}
          hoverColor={Colors.blue500} className={styles.topbarbuttons}
          icon={link.icon}
          labelStyle={{ fontWeight: 700 }}
          backgroundColor={backgroundColorActive}
        />
      )
    })
  }

  buildUrlPath = (location) => {
    var path = location.pathname.split('/');
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

  handleToggleNotifications = () => {
    var transactionsDrawerNetworkButtonStyle, transactionsDrawerNetworkButtonIconStyle
    console.log(this.state.transactionsDrawerOpen)
    !this.state.transactionsDrawerOpen
      ? transactionsDrawerNetworkButtonStyle = styles.networkIconOpen
      : transactionsDrawerNetworkButtonStyle = styles.networkIconClosed
    !this.state.transactionsDrawerOpen
      ? transactionsDrawerNetworkButtonIconStyle = menuStyles.profileIcon.open
      : transactionsDrawerNetworkButtonIconStyle = menuStyles.profileIcon.closed
    this.setState({
      transactionsDrawerOpen: !this.state.transactionsDrawerOpen,
      transactionsDrawerNetworkButtonStyle,
      transactionsDrawerNetworkButtonIconStyle
    });
    this.props.handleToggleNotifications()
  }

  render() {
    const { location, user } = this.props
    const { transactions } = this.props
    var userTypeDisabled = false;
    var userTypeLabel = 'HOLDER'
    const links = [
      { label: 'home', to: 'home', icon: <ActionHome color="white" /> },
      { label: 'vault', to: 'vault', icon: <ActionAccountBalance color="white" /> },
      { label: 'drago', to: 'drago', icon: <ActionShowChart color="white" /> },
      { label: 'exchange', to: 'exchange', icon: <ActionPolymer color="white" /> }
    ]
    const buttonAccountType = {
      border: "1px solid",
      borderColor: '#FFFFFF',
      // width: "140px"
    }
    // Disabling user type if isManager not defined
    if (typeof user.isManager === 'undefined') {
      user.isManager = false;
      userTypeDisabled = true;
      menuStyles = { ...menuStyles, ...disabledUserType };
    } else {
      user.isManager ? userTypeLabel = 'WIZARD' : userTypeLabel = 'HOLDER'
      menuStyles = { ...menuStyles, ...enabledUserType };
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
            icon={<ArrowDropDown color='#FFFFFF' />}
            hoverColor={Colors.blue300}
          />
          <Popover
            open={this.state.open}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
            onRequestClose={this.handleRequestClose}
            style={{ marginTop: "5px" }}

          >
            <Menu value={user.isManager}
              onChange={this.handleTopBarSelectAccountType}
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
              <MenuItem
                value={true}
                primaryText={
                  <div>
                    <div className={styles.menuItemPrimaryText}>WIZARD</div>
                    <div><small>Manage your funds</small></div>
                  </div>
                }
              />
            </Menu>
          </Popover>
          <IconMenu
            iconButtonElement={<IconButton><AccountIcon /></IconButton>}
            iconStyle={menuStyles.profileIcon.closed}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }}
            desktop={true}
          >
            <MenuItem leftIcon={<Settings />} value="config" primaryText="Config"
              containerElement={<Link to={DS + APP + DS + this.buildUrlPath(location) + DS + "config"} />} />
            <MenuItem leftIcon={<Help />} value="help" primaryText="Help" />
          </IconMenu>
          {transactions.pending > 0
            ?
            <div className={this.state.transactionsDrawerNetworkButtonStyle}>
              <Badge
                badgeContent={transactions.pending}
                secondary={true}
                style={{ padding: "0px !important" }}
                badgeStyle={{ top: 0, right: 0, fontSize: "10px", width: "20px", height: "20px" }}
              >
                <IconButton
                  tooltip="Network"
                  onClick={this.handleToggleNotifications}
                  iconStyle={this.state.transactionsDrawerNetworkButtonIconStyle}>
                  <NotificationWifi />
                </IconButton>
              </Badge>
            </div>
            :
            <div className={this.state.transactionsDrawerNetworkButtonStyle}>
              <IconButton tooltip="Network"
                onClick={this.handleToggleNotifications}
                iconStyle={this.state.transactionsDrawerNetworkButtonIconStyle}
              // style={{
              //   marginTop: "-5px",
              //   marginBottom: "-5px"
              // }
              // }
              >
                <NotificationWifi />
              </IconButton>
            </div>
          }

        </ToolbarGroup>
      </ToolbarGroup>
    )
  }
}

export default withRouter(connect(mapStateToProps)(NavLinks))