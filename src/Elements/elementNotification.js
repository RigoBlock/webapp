import React, { Component } from 'react';
import  * as Colors from 'material-ui/styles/colors';
import {ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import styles from './elementNotification.module.css';
import LinearProgress from 'material-ui/LinearProgress';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Search from 'material-ui/svg-icons/action/search'
import PropTypes from 'prop-types';

const transactionStyle = {
  executed: {
    backgroundColor: 'white',
    // border: '1px solid',
    borderRadius: '2px',
    // borderColor: Colors.green100,
    margin: '2px',
    progressBar: {
      color: Colors.green400,
      backgroundColor: Colors.green100,
    },
  },
  authorization: {
    backgroundColor: 'white',
    // border: '1px solid',
    borderRadius: '2px',
    // borderColor: Colors.amber50,
    margin: '2px',
    progressBar: {
      color: Colors.amber400,
      backgroundColor: Colors.amber100,
    },
  }, 
  pending: {
    backgroundColor: 'white',
    // border: '1px solid',
    borderRadius: '2px',
    // borderColor: Colors.lightBlue100,
    margin: '2px',
    progressBar: {
      color: Colors.lightBlue400,
      backgroundColor: Colors.lightBlue100,
    },
  }, 
  error: {
    backgroundColor: 'white',
    // border: '1px solid',
    borderRadius: '2px',
    borderColor: Colors.red100,
    margin: '2px',
    progressBar: {
      color: Colors.red400,
      backgroundColor: Colors.red100,
    },
  },
  innerDiv: {
    padding: '8px 8px 8px 72px'
  } 
}

export default class ElementNotification extends Component {

  static contextTypes = {
    ethereumNetworkName: PropTypes.string.isRequired,
  };
  
  static propTypes = {
    // accountName: PropTypes.string.isRequired,
    primaryText: PropTypes.string.isRequired,
    secondaryText: PropTypes.array.isRequired,
    eventType: PropTypes.string.isRequired,
    eventStatus: PropTypes.string.isRequired,
    txHash: PropTypes.string.isRequired
  };

  etherscanLink = () => {
    const { ethereumNetworkName } = this.context
    const {txHash} = this.props
    return (
      <a href={'https://'+ethereumNetworkName+'.etherscan.io/tx/'+txHash} target="_blank"></a>
    )
  }

  transactionMenu = () =>{
    const {txHash} = this.props
    const etherScanDisabled = txHash.length === 0 ? true : false
    return (
      <div className={styles.menu}>
        <IconMenu desktop={true}
          iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          <MenuItem leftIcon={<Search/>} primaryText="Etherscan" 
                      containerElement={this.etherscanLink()}
                      disabled={etherScanDisabled}
                      />
          {/* <MenuItem primaryText="Receipt" /> */}
        </IconMenu>
      </div>
    )
  }

  render() {
    const { primaryText, secondaryText, eventStatus } = this.props
    const showProgressBar = ['pending', 'authorization']
    return (
      <div style={transactionStyle[eventStatus]}>
        {this.transactionMenu()}
        <ListItem
          disabled={true}
          primaryText={primaryText}
          secondaryText={
            <p>
              {secondaryText[0]}<br />
              {secondaryText[1]}
            </p>
          }
          leftAvatar={<Avatar src="img/ETH.svg" />}
          secondaryTextLines={2}
          style={transactionStyle.innerDiv}
        >
        </ListItem>
        <div className={styles.progressBar}>
          {showProgressBar.includes(eventStatus)
            ? <LinearProgress color={transactionStyle[eventStatus].progressBar.color} style={transactionStyle[eventStatus].progressBar} mode="indeterminate" />
            : <LinearProgress color={transactionStyle[eventStatus].progressBar.color} style={transactionStyle[eventStatus].progressBar} mode="determinate" value={100} />
          }
        </div>
      </div>
    );
  }
}