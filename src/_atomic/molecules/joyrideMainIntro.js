import { Col, Row } from 'react-flexbox-grid'
import Checkbox from 'material-ui/Checkbox'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './joyrideMainIntro.module.css'

class JoyrideMainIntro extends React.Component {
  static propTypes = {
    content: PropTypes.string.isRequired,
    onCheck: PropTypes.func.isRequired,
    hasGRGBalance: PropTypes.bool.isRequired,
    showHideOption: PropTypes.bool
  }

  static defaultProps = {
    content: '',
    showHideOption: true
  }

  checkWalletBalance = async () => {
    // Modern dapp browsers...
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.enable()
      } catch (error) {
        console.warn('User denied account access')
      }
    } else {
      console.log(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      )
    }
  }

  render() {
    const buttonCreateDrago = {
      border: '2px solid',
      borderColor: '#054186',
      fontWeight: '600',
      height: '45px',
      borderRadius: '4px',
      width: '210px',
      backgroundColor: '#054186'
    }
    const { hasGRGBalance, showHideOption } = this.props
    return (
      <div className={styles.container}>
        <div className={styles.rbLogo}>
          <img
            style={{ height: '38px' }}
            src="/img/rb-logo-final.png"
            alt="logo"
          />
        </div>
        <Row>
          <div className={styles.projectDescription}>
            <Col xs={12}>
              <h2>RigoBlock</h2>
              <div className={styles.efxDescriptionTxt}>
                RigoBlock is a blockchain protocol for{' '}
                <b>decentralized asset management</b>. It is an abstracted and
                generalized standard, built and deployed on the <b>Ethereum</b>{' '}
                public blockchain and portable to multiple blockchains, which
                streamlines the <b>creation and management</b> of complex
                applications for <b>asset</b> management.
              </div>
              <div className={styles.efxDescriptionMore}>
                <a
                  href="https://rigoblock.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &#62;&#62; Read more &#60;&#60;
                </a>
              </div>
            </Col>
          </div>
        </Row>
        <div className={styles.communityContainer}>
          <Row>
            <div className={styles.communityContainerTitle}>
              <Col xs={12}>Resources</Col>
            </div>
          </Row>
          <Divider />
          <div className={styles.communityContainerBody}>
            <Row>
              <Col xs={6}>
                <div className={styles.communityLink}>
                  {/* <div className={styles.imgLink}>
                  <ContentLink />
                </div> */}
                  <div>
                    <a
                      href="https://www.rigoblock.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      RigoBlock.com:
                    </a>{' '}
                    explore and learn more about our project.
                  </div>
                </div>
                <br />
                <div className={styles.communityLink}>
                  {/* <div className={styles.imgLink}>
                  <ContentLink />
                </div> */}
                  <div>
                    <a
                      href="https://discordapp.com/invite/FXd8EU8"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Community:
                    </a>{' '}
                    join our community and contribute to the decentralized
                    ecosystem.
                  </div>
                </div>
              </Col>
              <Col xs={6}>
                {!hasGRGBalance && (
                  <div className={styles.minimumBalance}>
                    Participate to Token Sale and receive your GRG access token
                  </div>
                )}

                <div className={styles.communityLink}>
                  {/* <div className={styles.imgLink}>
                  <ContentLink />
                </div> */}
                  <div style={{ fontWeight: 700 }}>
                    {hasGRGBalance && (
                      <div className={styles.icoDate}>
                      <a
                        href="https://rigoblock.com"
                        target="_blank"
                        rel="noopener noreferrer">
                        GRG gives you the full benefit of Proof of Performance. Receive GRG by operating a Vault.
                      </a>
                      </div>
                    )}
                    <div className={styles.icoButton}>
                      <FlatButton
                        href="https://beta.rigoblock.com/#/app/web/vault/dashboard"
                        labelPosition="before"
                        label="Earn GRG"
                        labelStyle={{
                          color: '#ffffff',
                          fontWeight: '600',
                          fontSize: '20px'
                        }}
                        id="joyride-efx-create-pool"
                        style={buttonCreateDrago}
                        // icon={<Chat color="#ffca57" />}
                        // hoverColor={Colors.blue300}
                      />
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
            <div className={styles.showTick}>
              <Row>
                <Col xs={12}>
                  {showHideOption && (
                    <Checkbox
                      label="Don't show next time."
                      labelPosition="left"
                      iconStyle={{ width: '14px' }}
                      onCheck={this.props.onCheck}
                    />
                  )}
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default JoyrideMainIntro
