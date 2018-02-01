import  * as Colors from 'material-ui/styles/colors'
import { Grid, Row, Col } from 'react-flexbox-grid'
import BigNumber from 'bignumber.js'
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import React, { Component, PureComponent } from 'react'
import ReactDOM from 'react-dom'

import IdentityIcon from '../IdentityIcon';
import Loading from '../Loading'
import utils from '../utils/utils'


import styles from './pageNetworkConfig.module.css'
import Toggle from 'material-ui/Toggle';
import ElementBoxHeadTitle from '../Elements/elementBoxHeadTitle'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import { ALLOWED_ENDPOINTS, DEFAULT_ENDPOINT } from '../utils/const';



class PageNetworkConfig extends Component {

  constructor(props) {
    super(props);
    // Allowed endpoints are defined in const.js
    var selectedEndpoint = localStorage.getItem('endpoint')
    var allowedEndpoints = new Map(ALLOWED_ENDPOINTS)
    if (allowedEndpoints.has(selectedEndpoint)) {
      allowedEndpoints.set(selectedEndpoint, true) 
    } else {
      allowedEndpoints.set(DEFAULT_ENDPOINT, true)
      selectedEndpoint = DEFAULT_ENDPOINT
    }
    this.state = {
      selectedEndpoint: selectedEndpoint,
      allowedEndpoints: allowedEndpoints,
      save: true,
    }
  }

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
      location: PropTypes.object.isRequired,
      ethBalance: PropTypes.object.isRequired,
      accounts: PropTypes.array.isRequired,
      // accountsInfo: PropTypes.object.isRequired, 
      ethBalance: PropTypes.object.isRequired,
    };

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    snackBar = (msg) =>{
      this.setState({
        snackBar: true,
        snackBarMsg: msg
      })
    }

    handlesnackBarRequestClose = () => {
      this.setState({
        snackBar: false,
        snackBarMsg: ''
      })
    }

    onToggle = (event) =>{
      // console.log(event.target.getAttribute('data-endpoint'))
      const selectedEndpoint = event.target.getAttribute('data-endpoint')
      console.log(ALLOWED_ENDPOINTS)
      var allowedEndpoints = new Map(ALLOWED_ENDPOINTS)
      localStorage.setItem('endpoint', selectedEndpoint)
      allowedEndpoints.set(selectedEndpoint, true)
      this.setState ({
        selectedEndpoint: selectedEndpoint,
        allowedEndpoints: allowedEndpoints,
        save: false,
      })
    }

    handleRefresh = () =>{
      window.location.reload(false)
    }

    render() {
      const { allowedEndpoints, selectedEndpoint } = this.state 

      const stylesToggle = {
        block: {
          maxWidth: 250,
        },
        toggle: {
          marginBottom: 16,
        },
        thumbOff: {
          backgroundColor: '#ffcccc',
        },
        trackOff: {
          backgroundColor: '#ff9d9d',
        },
        thumbSwitched: {
          backgroundColor: 'red',
        },
        trackSwitched: {
          backgroundColor: '#ff9d9d',
        },
        labelStyle: {
          color: 'red',
        },
      };

      return (
        <div className={styles.boxContainer}>
          <Row>
            <Col xs={12}>
              <ElementBoxHeadTitle primaryText="Endpoint" />
            </Col>
            <Col xs={12}>
              <Paper className={styles.paperContainer} zDepth={1}>
                <p>Please select your preferred access point to the blockchain.</p>
                <p>RigoBlock and Infura provide secure, reliable, and scalable access to Ethereum.</p>
                <p>RigoBlock protocol is currently deployed on <b>Kovan</b> network only.</p>
                <p>&nbsp;</p>
                <div style={stylesToggle.block}>
                  <Toggle
                    label="Infura"
                    style={stylesToggle.toggle}
                    onToggle={this.onToggle}
                    data-endpoint="infura"
                    toggled={allowedEndpoints.get('infura')}
                  />
                  <Toggle
                    label="RigoBlock"
                    style={stylesToggle.toggle}
                    onToggle={this.onToggle}
                    data-endpoint="rigoblock"
                    toggled={allowedEndpoints.get('rigoblock')}
                  />
                  <Toggle
                    label="Local"
                    style={stylesToggle.toggle}
                    toggled={allowedEndpoints.get('local')}
                    disabled={true}
                  />
                  {/* <Toggle
                    label="Custom"
                    style={stylesToggle.toggle}
                    toggled={allowedEndpoints.get('custom')}
                  />
                  <TextField
                    hintText="https://"
                    floatingLabelText="Custom RPC endpoint"
                    floatingLabelFixed={true}
                    disabled={true}
                    errorText="Must be a valid URL"
                  /> */}
                </div>
                <Row>
                  <Col xs={12}>
                    <p>You need to refresh you browser to save and make this setting active. Please proceed:</p>
                  </Col>
                  <Col xs={12}>
                    <RaisedButton label="Refresh"
                      primary={true}
                      disabled={this.state.save}
                      onClick={this.handleRefresh} />
                  </Col>
                </Row>
              </Paper>
            </Col>
          </Row>
        </div> 
      )
    }
  }

  export default PageNetworkConfig