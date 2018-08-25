import { defaultDragoDetails } from '../../_utils/const'
import ElementDialogAddressTitle from '../atoms/elementDialogAddressTitle'
import ElementDialogHeadTitle from '../atoms/elementDialogHeadTitle'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

class ActionsDialogHeader extends Component {
  static propTypes = {
    primaryText: PropTypes.string.isRequired,
    tokenDetails: PropTypes.object.isRequired,
    fundType: PropTypes.string.isRequired
  }

  static defaultProps = {
    primaryText: 'Null',
    fundType: 'drago',
    tokenDetails: defaultDragoDetails
  }

  render() {
    return (
      <div>
        <ElementDialogHeadTitle
          primaryText={this.props.primaryText}
          fundType={this.props.fundType}
        />
        {typeof tokenDetails !== 'undefined' ? (
          <ElementDialogAddressTitle
            tokenDetails={this.props.tokenDetails}
            fundType={this.props.fundType}
          />
        ) : null}
      </div>
    )
  }
}

export default ActionsDialogHeader
