import { Row, Col } from 'react-flexbox-grid';
import { Link, withRouter } from 'react-router-dom'
import { Column, Table, AutoSizer, SortDirection, SortIndicator } from 'react-virtualized';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import utils from '../../_utils/utils'
import { toUnitAmount } from '../../_utils/format'

import styles from './elementListTransactions.module.css';
import 'react-virtualized/styles.css'
import * as Colors from 'material-ui/styles/colors'
import BigNumber from 'bignumber.js';
import TokenIcon from '../../_atomic/atoms/tokenIcon'

// const list = Immutable.List(generateRandomList());

class ElementListAssets extends PureComponent {

  static propTypes = {
    list: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    renderCopyButton: PropTypes.func.isRequired,
    renderEtherscanButton: PropTypes.func.isRequired,
    dragoDetails: PropTypes.object.isRequired,
    assetPrices: PropTypes.object.isRequired
  };



  constructor(props, context) {
    super(props, context);
    const { list } = this.props
    const sortDirection = SortDirection.DESC;
    const sortedList = list.sortBy(item => item.symbol)
      .update(
        list => (sortDirection === SortDirection.DESC ? list : list.reverse()),
    );
    const rowCount = list.size
    this.state = {
      disableHeader: false,
      headerHeight: 30,
      height: 200,
      width: 600,
      hideIndexRow: false,
      overscanRowCount: 10,
      rowHeight: 40,
      rowCount: rowCount,
      scrollToIndex: undefined,
      sortDirection,
      sortedList,
      useDynamicRowHeight: false
    };

    this._getRowHeight = this._getRowHeight.bind(this);
    this._headerRenderer = this._headerRenderer.bind(this);
    this._noRowsRenderer = this._noRowsRenderer.bind(this);
    this._onRowCountChange = this._onRowCountChange.bind(this);
    this._onScrollToRowChange = this._onScrollToRowChange.bind(this);
    this._rowClassName = this._rowClassName.bind(this);
    this._sort = this._sort.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { list } = nextProps
    const sortDirection = SortDirection.DESC;
    const sortedList = list.sortBy(item => item.symbol)
      .update(
        list => (sortDirection === SortDirection.DESC ? list : list.reverse()),
    );
    const rowCount = list.size
    this.setState({
      sortedList: sortedList,
      rowCount: rowCount,
    })
    const sourceLogClass = this.constructor.name
    // console.log(`${sourceLogClass} -> componentWillReceiveProps`);
  }

  render() {
    const {
      disableHeader,
      headerHeight,
      height,
      hideIndexRow,
      overscanRowCount,
      rowHeight,
      rowCount,
      scrollToIndex,
      sortBy,
      sortDirection,
      sortedList,
      useDynamicRowHeight,
      list
    } = this.state;

    const rowGetter = ({ index }) => this._getDatum(sortedList, index);

    return (

      <Row>
        <Col xs={12}>
          <div style={{ flex: '1 1 auto' }}>
            <AutoSizer disableHeight>
              {({ width }) => (
                <Table
                  id={"assets-table"}
                  ref="Table"
                  disableHeader={disableHeader}
                  headerClassName={styles.headerColumn}
                  headerHeight={headerHeight}
                  height={height}
                  noRowsRenderer={this._noRowsRenderer}
                  overscanRowCount={overscanRowCount}
                  rowClassName={this._rowClassName}
                  rowHeight={useDynamicRowHeight ? this._getRowHeight : rowHeight}
                  rowGetter={rowGetter}
                  rowCount={rowCount}
                  scrollToIndex={scrollToIndex}
                  sort={this._sort}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  width={width}
                >
                  <Column
                    width={100}
                    disableSort
                    label="TOKEN"
                    cellDataGetter={({ rowData }) => rowData.symbol}
                    dataKey="symbol"
                    className={styles.exampleColumn}
                    cellRenderer={({ cellData }) => this.renderSymbol(cellData)}
                    flexShrink={1}
                  />
                  <Column
                    width={200}
                    disableSort
                    label="NAME"
                    cellDataGetter={({ rowData }) => rowData.name}
                    dataKey="date"
                    className={styles.exampleColumn}
                    cellRenderer={({ cellData }) => this.renderName(cellData)}
                    flexShrink={1}
                  />
                  <Column
                    width={100}
                    disableSort
                    label="AMOUNT"
                    cellDataGetter={({ rowData }) => rowData}
                    dataKey="amount"
                    className={styles.exampleColumn}
                    cellRenderer={({ rowData }) => this.renderBalance(rowData)}
                    flexShrink={1}
                  />
                  <Column
                    width={30}
                    disableSort
                    label="TX"
                    cellDataGetter={({ rowData }) => rowData}
                    dataKey="tx"
                    className={styles.exampleColumn}
                    cellRenderer={({ rowData }) => this.renderTx(rowData)}
                    flexShrink={1}
                  />
                  <Column
                    width={100}
                    disableSort
                    label="PRICE ETH"
                    cellDataGetter={({ rowData }) => rowData}
                    dataKey="prices"
                    className={styles.exampleColumn}
                    cellRenderer={({ rowData }) => this.renderPrice(rowData)}
                    flexGrow={1}
                  />
                  <Column
                    width={100}
                    disableSort
                    label="VALUE ETH"
                    cellDataGetter={({ rowData }) => rowData}
                    dataKey="values"
                    className={styles.exampleColumn}
                    cellRenderer={({ rowData }) => this.renderValue(rowData)}
                    flexGrow={1}
                  />
                </Table>
              )}
            </AutoSizer>
          </div>
        </Col>
      </Row>
    );
  }

  actionButton(cellData, rowData) {
    const { match } = this.props;
    const url = rowData.params.dragoId.value.c + "/" + utils.dragoISIN(cellData, rowData.params.dragoId.value.c)
    return <FlatButton label="View" primary={true} containerElement={<Link to={match.path + "/" + url} />} />
  }

  renderSymbol(input) {
    return (
      <div>
        <TokenIcon symbol={input.toLowerCase()} />
        <span>&nbsp;&nbsp;{input.toUpperCase()}</span>
      </div>
    )
  }

  renderName(input) {
    return (
      <div>{input}</div>
    )
  }

  renderEthValue(ethValue) {
    return (
      <div>{new BigNumber(ethValue).toFixed(4)} <small>ETH</small></div>
    )
  }

  renderBalance(token) {
    return (
      <div>{toUnitAmount(new BigNumber(token.balance), token.decimals).toFixed(4)} <small>{token.symbol.toUpperCase()}</small></div>
    )
  }

  renderTx(token) {
    return (
      <span>{this.props.renderEtherscanButton('token', token.address, this.props.dragoDetails.address)}</span>
    )
  }

  renderPrice(token) {
    if (typeof this.props.assetPrices[token.symbol] !== 'undefined') {
      return (
        <div>{new BigNumber(this.props.assetPrices[token.symbol].priceEth).toFixed(7)}</div>
      )
    }
    return (
      <div><small>N/A</small></div>
    )
  }

  renderValue(token) {
    if (typeof this.props.assetPrices[token.symbol] !== 'undefined') {
      return (
        <div>{new BigNumber(this.props.assetPrices[token.symbol].priceEth).mul(toUnitAmount(new BigNumber(token.balance), token.decimals).toFixed(4)).toFixed(7)}</div>
      )
    }
    return (
      <div><small>N/A</small></div>
    )

  }

  renderAction(action) {
    switch (action) {
      case "BuyDrago":
        return <span style={{ color: Colors.green300, fontWeight: 600 }}>BUY</span>
      case "SellDrago":
        return <span style={{ color: Colors.red300, fontWeight: 600 }}>SELL</span>
      case "DragoCreated":
        return <span style={{ color: Colors.blue300, fontWeight: 600 }}>CREATED</span>
    }
  }

  renderTime(timestamp) {
    return (
      <span>{utils.dateFromTimeStamp(timestamp)}</span>
    )
  }

  renderDrgValue(rowData) {
    return (
      <div>{new BigNumber(rowData.drgvalue).toFixed(4)} <small>{rowData.symbol}</small></div>
    )
  }


  _getDatum(list, index) {
    return list.get(index % list.size);
  }

  _getRowHeight({ index }) {
    const { list } = this.state;

    return this._getDatum(list, index).size;
  }

  _headerRenderer({ dataKey, sortBy, sortDirection }) {
    return (
      <div>
        Full Name
        {sortBy === dataKey && <SortIndicator sortDirection={sortDirection} />}
      </div>
    );
  }

  _isSortEnabled() {
    const { list } = this.props;
    const { rowCount } = this.state;

    return rowCount <= list.size;
  }

  _noRowsRenderer() {
    return <div className={styles.noRows}>No rows</div>;
  }

  _onRowCountChange(event) {
    const rowCount = parseInt(event.target.value, 10) || 0;

    this.setState({ rowCount });
  }

  _onScrollToRowChange(event) {
    const { rowCount } = this.state;
    let scrollToIndex = Math.min(
      rowCount - 1,
      parseInt(event.target.value, 10),
    );

    if (isNaN(scrollToIndex)) {
      scrollToIndex = undefined;
    }

    this.setState({ scrollToIndex });
  }

  _rowClassName({ index }) {
    if (index < 0) {
      return styles.headerRow;
    } else {
      return index % 2 === 0 ? styles.evenRow : styles.oddRow;
    }
  }

  _sort({ sortBy, sortDirection }) {
    const sortedList = this._sortList({ sortBy, sortDirection });

    this.setState({ sortBy, sortDirection, sortedList });
  }

  _sortList({ sortBy, sortDirection }) {
    const { list } = this.props;
    return list
      .sortBy(item => item.timestamp)
      .update(
        list => (sortDirection === SortDirection.DESC ? list : list.reverse()),
    );
  }

  _updateUseDynamicRowHeight(value) {
    this.setState({
      useDynamicRowHeight: value,
    });
  }
}

export default withRouter(ElementListAssets)