/* eslint-disable no-console */
import React, { Component } from 'react';
import axios from 'axios';
import ButtonWithLoading from './components/Button';
import Search from './components/Search';
import Table from './components/Table';
import './styles/main.scss';
import {
  DEFAULT_QUERY,
  DEFAULT_HPP,
  PATH_BASE,
  PATH_SEARCH,
  PARAM_SEARCH,
  PARAM_PAGE,
  PARAM_HPP,
} from './constants/constants';

const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}0&${PARAM_HPP}${DEFAULT_HPP}`;
console.log(url);

const updateSearchTopStoriesState = (hits, page) => (prevState) => {
  // console.log(prevState);
  const { searchKey, results } = prevState;

  const oldHits = results && results[searchKey]
    ? results[searchKey].hits : [];

  const updatedHits = [...oldHits, ...hits];

  return {
    results: {
      ...results,
      [searchKey]: { hits: updatedHits, page },
    },
    isLoading: false,
  };
};

class App extends Component {
  isItMounted = false;

  state = {
    results: null,
    searchKey: '',
    searchTerm: DEFAULT_QUERY,
    error: null,
    isLoading: false,
  };

  componentDidMount() {
    this.isItMounted = true;

    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    this.isItMounted = false;
  }

  needsToSearchTopStories = searchTerm =>
    (!this.state.results[searchTerm]);

  onSearchSubmit = (event) => {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });

    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  };

  fetchSearchTopStories = (searchTerm, page = 0) => {
    this.setState({ isLoading: true });

    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this.isItMounted && this.setSearchTopStories(result.data))
      .catch(error => this.isItMounted && this.setState({ error }));
  };

  setSearchTopStories = (result) => {
    const { hits, page } = result;
    this.setState(updateSearchTopStoriesState(hits, page));
  };

  onSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  onDismiss = (id) => {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item =>
      (item.objectID !== id);

    const updatedHits = hits.filter(isNotId);

    console.log(this.state.results.hits);
    console.log(updatedHits);

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page },
      },
    });
  };

  render() {
    const {
      searchTerm, results, searchKey, error, isLoading,
    } = this.state;

    const page = (results && results[searchKey] && results[searchKey].page) || 0;

    const list = (results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div className="page privet hi-all-and">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        {error
          ? (
            <div className="interactions">
              <p>Something went wrong.</p>
            </div>
          ) : (
            <Table
              list={list}
              onDismiss={this.onDismiss}
            />
          )
        }
        <div className="interactions">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
          >
            More News
          </ButtonWithLoading>
        </div>
      </div>
    );
  }
}

export default App;
