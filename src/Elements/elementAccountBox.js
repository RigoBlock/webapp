import { Grid, Row, Col } from 'react-flexbox-grid'
import {Card, CardHeader, CardText} from 'material-ui/Card'
import Avatar from 'material-ui/Avatar'
import Chip from 'material-ui/Chip'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import { Link } from 'react-router-dom'
import Search from 'material-ui/svg-icons/action/search'
import Paper from 'material-ui/Paper'

import IdentityIcon from '../IdentityIcon';

import styles from './elementAccountBox.module.css'

const style = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

class ElementAccountBox extends Component {

  static contextTypes = {
    ethereumNetworkName: PropTypes.string.isRequired,
  };

  static propTypes = {
    account: PropTypes.object.isRequired,
    snackBar: PropTypes.func
  };

  renderCopyButton = (accountAddress) =>{
    if (!accountAddress ) {
      return null;
    }
    
    return (
      <CopyToClipboard text={accountAddress}
          onCopy={() => this.props.snackBar('Copied to clilpboard')}>
          <Link to={'#'} ><CopyContent className={styles.copyAddress}/></Link>
      </CopyToClipboard>
    );
  }

  renderEtherscanButton = (type, text) =>{
    if (!text ) {
      return null;
    }
    const { ethereumNetworkName } = this.context
    
    return (
    <a href={'https://'+ethereumNetworkName+'.etherscan.io/'+type+'/' + text} target='_blank'><Search className={styles.copyAddress}/></a>
    );
  }

  renderTitle = () =>{
    const {account} = this.props;
    return (
      <Row>
        <Col xs={8} className={styles.title}>
        {account.name}
        </Col>
        <Col xs={4} className={styles.actionButtons}>
        {this.renderCopyButton(account.address)} {this.renderEtherscanButton('address', account.address)}
        </Col>
      </Row>
    )
  }

  renderSubTitle = () =>{
    const {account} = this.props;
    return (
      <Row>
        <Col xs={12} className={styles.subTitle}>
        {account.address}
        </Col>
      </Row>
    )
  }

  render() {
    const {account} = this.props;
    return (
      <Paper className={styles.paperContainer} zDepth={1}>
        <Row>
          <Col xs={12}>
            <Row className={styles.accountTitleContainer}>
              <Col xs={2} >
                <div>
                  <IdentityIcon address={account.address} />
                </div>
              </Col>
              <Col xs={12} md={10}>
                <Row>
                  <Col xs={12}>
                    {this.renderTitle()}
                  </Col>
                  <Col xs={12}>
                    {this.renderSubTitle()}
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className={styles.accountBodyContainer}>
              <Col xs={12} md={10}>
                <Row end="xs">
                  <Col xs={12}>
                    <div className={styles.tokensAmmount}>
                      <div className={styles.accountChipTokenETH}>
                        <Chip style={{border: "1px solid", borderColor: "#E0E0E0", padding: "1px"}}
                        backgroundColor="#FFFFFF">
                          <Avatar src="img/ethereum-black-64x64.png" style={{border: "1px solid"}} backgroundColor="#E0E0E0"/>
                          {account.ethBalance} <span className={styles.tokensSymbolText}>ETH</span>
                        </Chip>
                      </div >
                      <div className={styles.accountChipTokenGGG}>
                      <Chip style={{border: "1px solid", borderColor: "#E0E0E0", padding: "1px"}}
                      backgroundColor="#FFFFFF">                          
                      <Avatar src="img/GGG.png" style={{border: "1px solid" }} backgroundColor="#E0E0E0"/>
                          {account.rigoTokenBalance} <span className={styles.tokensSymbolText}>GGG</span>
                        </Chip>
                      </div>
                    </div>
                  </Col>
                </Row>
                
              </Col>
              <Col xs={2} >
                  {account.source == 'MetaMask'
                  ?
                  <Avatar src="img/metamask.png" size={32} backgroundColor="#FFFFFF" alt="MetaMask"/>
                  :
                  <Avatar src="img/parity.png" size={32} backgroundColor="#FFFFFF"/>
                  }
              </Col>
            </Row>
          </Col>
        </Row>
      </Paper>
    )
    
  }
}

export default ElementAccountBox