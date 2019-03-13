/* 1eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import Button from './components/Button';
import Search from './components/Search';
import Table from './components/Table';

const DEFAULT_QUERY = 'react';
const DEFAULT_HPP = '12';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}`;

console.log(url);

const updateSearchTopStoriesState = (hits, page) => (prevState) => {
  console.log(prevState);
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
  _isMounted = false;

  state = {
    results: null,
    searchKey: '',
    searchTerm: DEFAULT_QUERY,
    error: null,
    isLoading: false,
  };

  componentDidMount() {
    this._isMounted = true;

    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    this._isMounted = false;
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
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({ error }));
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

    console.log(this.state.results.hits); // CONSOLE
    console.log(updatedHits); // CONSOLE

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
      <div className="page privet">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Поиск
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
            Больше историй
          </ButtonWithLoading>
        </div>
      </div>
    );
  }
}

const withLoading = ComponentLoaded => ({ isLoading, ...rest }) => {
  if (isLoading) {
    return <Loading />;
  }
  return <ComponentLoaded {...rest} />;
};

const Loading = () =>
  <div>Загрузка ...</div>;

const ButtonWithLoading = withLoading(Button);

export default App;
