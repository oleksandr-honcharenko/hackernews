/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import Button from './Button';

const smallColumn = { width: '10%' };
const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

const Sort = ({
  sortKey, activeSortKey, onSort, children,
}) => {
  const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey },
  );

  return (
    <Button onClick={() => onSort(sortKey)} className={sortClass}>
      {children}
    </Button>
  );
};

class Table extends Component {
  state = {
    sortKey: 'NONE',
    isSortReverse: false,
  };

  onSort = (sortKey) => {
    const { sortKey: sortKeyNew, isSortReverse: isSortReversed } = this.state;
    const isSortReverse = sortKeyNew === sortKey && !isSortReversed;

    this.setState({ sortKey, isSortReverse });
  };

  render() {
    const {
      list,
      onDismiss,
    } = this.props;

    const { sortKey, isSortReverse } = this.state;

    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse
      ? sortedList.reverse()
      : sortedList;

    return (
      <div className="table">
        <div className="table-header">
          <span style={{ width: '40%' }}>
            <Sort
              sortKey="TITLE"
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              {'Title'}
            </Sort>
          </span>
          <span style={{ width: '30%' }}>
            <Sort
              sortKey="AUTHOR"
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              {'Author'}
            </Sort>
          </span>
          <span style={smallColumn}>
            <Sort
              sortKey="COMMENTS"
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              {'Comments'}
            </Sort>
          </span>
          <span style={smallColumn}>
            <Sort
              sortKey="POINTS"
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              {'Points'}
            </Sort>
          </span>
          <span style={smallColumn}>
            {'Dissmiss'}
          </span>
        </div>
        {reverseSortedList.map(item =>
          (
            <div key={item.objectID} className="table-row">
              <span style={{ width: '40%' }}>
                <a href={item.url}>{item.title}</a>
              </span>
              <span style={{ width: '30%' }}>
                { item.author }
              </span>
              <span style={smallColumn}>
                {item.num_comments}
                {'comm'}
              </span>
              <span style={smallColumn}>
                {item.points}
                {'points'}
              </span>
              <span style={smallColumn}>
                <Button className="button-inline" onClick={() => onDismiss(item.objectID)}>
                  {'Отбросить'}
                </Button>
              </span>
            </div>
          ))
        }
      </div>
    );
  }
}

export default Table;
