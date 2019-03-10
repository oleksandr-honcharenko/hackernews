import React, { Component } from 'react';
import axios from 'axios';
import {sortBy} from 'lodash';
import classNames from 'classnames';
import './App.css';

const DEFAULT_QUERY = 'react';
const DEFAULT_HPP = '12';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}`;

console.log(url);


// eslint-disable-next-line
const list = [
    {
        title: 'React',
        url: 'https://reactjs.org/',
        author: 'Jordan Walke',
        num_comments: 13,
        points: 1,
        objectID: 0,
    },
    {
        title: 'Redux',
        url: 'https://redux.js.org/',
        author: 'Jordan Walke',
        num_comments: 37,
        points: 4,
        objectID: 1,
    },
    {
        title: 'React',
        url: 'https://reactjs.org/',
        author: 'Jor12dan W12alke',
        num_comments: 3,
        points: 4,
        objectID: 2,
    },
    {
        title: 'Redux',
        url: 'https://redux.js.org/',
        author: 'Dan Abramov, Andrew Clark',
        num_comments: 1228,
        points: 5,
        objectID: 3,
    },
];

const SORTS = {
    NONE: list => list,
    TITLE: list => sortBy(list, 'title'),
    AUTHOR: list => sortBy(list, 'author'),
    COMMENTS: list => sortBy(list, 'num_comments').reverse(),
    POINTS: list => sortBy(list, 'points').reverse(),
};

const updateSearchTopStoriesState = (hits, page) => (prevState) => {
    const {searchKey, results} = prevState;

    const oldHits = results && results[searchKey]
        ? results[searchKey].hits : [];

    const updatedHits = [...oldHits, ...hits];

    return {
        results: {
            ...results,
            [searchKey]: { hits: updatedHits, page}
        },
        isLoading: false
    };
};


class App extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            results: null,
            searchKey:"",
            searchTerm: DEFAULT_QUERY,
            error: null,
            isLoading: false,
        };

        this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
        this.setSearchTopStories = this.setSearchTopStories.bind(this);
        this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onSearchSubmit = this.onSearchSubmit.bind(this);
        this.onDismiss = this.onDismiss.bind(this);
    }

    needsToSearchTopStories(searchTerm) {
        return !this.state.results[searchTerm];
    }

    onSearchSubmit (event) {
        const {searchTerm} = this.state;
        this.setState({searchKey: searchTerm});

        if (this.needsToSearchTopStories(searchTerm)) {
            this.fetchSearchTopStories(searchTerm);
        }
        event.preventDefault();
    }

    fetchSearchTopStories(searchTerm, page = 0) {
        this.setState({ isLoading: true });

        axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
            .then(result => this._isMounted && this.setSearchTopStories(result.data))
            .catch(error => this._isMounted && this.setState({error}));
    }

    setSearchTopStories(result) {
        const {hits, page} = result;
        this.setState(updateSearchTopStoriesState(hits, page));
    }

    componentDidMount() {
        this._isMounted = true;

        const { searchTerm } = this.state;
        this.setState({searchKey: searchTerm});
        this.fetchSearchTopStories(searchTerm);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onSearchChange(event) {
        this.setState({ searchTerm: event.target.value });
    }

    onDismiss(id) {
        const {searchKey, results} = this.state;
        const {hits, page } = results[searchKey];

        const isNotId = item => {
            /*console.log(item.objectID !== id);*/                  //CONSOLE
            return item.objectID !== id
        };
        const updatedHits = hits.filter(isNotId);

        console.log(this.state.results.hits);                     //CONSOLE
        console.log(updatedHits);                               //CONSOLE

        this.setState({
            results: {
                ...results,
                [searchKey]: {hits: updatedHits, page}
            }
        });
    }


    render() {
        const { searchTerm, results, searchKey, error, isLoading } = this.state;
        /*console.log(result);*/                                  //CONSOLE

        const page = (results && results[searchKey] && results[searchKey].page) || 0;

        const list = (results && results[searchKey] && results[searchKey].hits) || [];

        //if (error) {            return <p>Something went wrong.</p>;        }

        return (
            <div className="page her">
                <div className="interactions">
                    <Search
                        value={searchTerm}
                        onChange={this.onSearchChange}
                        onSubmit={this.onSearchSubmit} >
                            Поиск
                    </Search>
                </div>
                { error
                ? <div className="interactions">
                        <p>Something went wrong.</p>
                    </div>
                : <Table
                    list={list}
                    onDismiss={this.onDismiss} />
                }
                <div className="interactions">
                    <ButtonWithLoading
                        isLoading = {isLoading}
                        onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
                    >
                        Больше историй
                    </ButtonWithLoading>
                    {/* isLoading
                        ? <Loading />
                        : <Button onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
                                Больше историй
                            </Button>
                    */}
                </div>
            </div>
        );
    }
}
// not ES 6 version (first iteration)
/*function withFoo(Component) {
    return function(props) {
        return <Component { ...props } />
    }
}*/

//ES 6 version
const withLoading = (Component) => ({ isLoading, ...rest }) =>
    isLoading
    ? <Loading />
    : <Component { ...rest } />;



const Loading = () =>
    <div>Загрузка ...</div>;
/*
const Search = ({value, onChange, onSubmit, children}) =>
    <form onSubmit={onSubmit}>
        <input
        type="text"
        value={value}
        onChange={onChange} />
        <button type="submit">
            {children}
        </button>
    </form>;
*/
//мигрируем с функционального компонента без состояния в классовый компонент
class Search extends Component {
    componentDidMount(){
        if (this.input) {
            this.input.focus();
        }
    }
    render() {
        const {
            value,
            onChange,
            onSubmit,
            children
        } = this.props;
        return (
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    ref={(node) => { this.input = node; }}
                />
                <button type="submit">
                    {children}
                </button>
            </form>
        );
    }
}
//
/*
const Search = ({value, onChange, onSubmit, children}) => {
    let input;
    return (
    <form onSubmit={onSubmit}>
        <input
            type="text"
            value={value}
            onChange={onChange}
            ref={(node) => input = node}
        />
        <button type="submit">
            {children}
        </button>
    </form>
    );
}
*/

const smallColumn = {width: '10%'};
class Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sortKey: 'NONE',
            isSortReverse: false,
        };

        this.onSort = this.onSort.bind(this);
    }

    onSort (sortKey) {
        const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;

        this.setState({ sortKey, isSortReverse });
    }

    render() {
        const {
            list,
            onDismiss
        } = this.props;

        const { sortKey, isSortReverse, } = this.state;

        const sortedList = SORTS[sortKey](list);
        const reverseSortedList = isSortReverse
            ? sortedList.reverse()
            : sortedList;

        return(
            <div className="table">
                <div className="table-header">
            <span style={{width: '40%'}}>
                <Sort sortKey={'TITLE'} onSort={this.onSort} activeSortKey={sortKey}>
                    Zagolovok
                </Sort>
            </span>
                    <span style={{width: '30%'}}>
                <Sort sortKey={'AUTHOR'} onSort={this.onSort} activeSortKey={sortKey}>
                    Avtor
                </Sort>
            </span>
                    <span style={{width: '10%'}}>
                <Sort sortKey={'COMMENTS'} onSort={this.onSort} activeSortKey={sortKey}>
                    Comments
                </Sort>
            </span>
                    <span style={{width: '10%'}}>
                <Sort sortKey={'POINTS'} onSort={this.onSort} activeSortKey={sortKey}>
                    Points
                </Sort>
            </span>
                    <span style={{width: '10%'}}>
                Archive
            </span>
                </div>
                {reverseSortedList.map(item =>
                    <div key={item.objectID} className="table-row">
                    <span style={{width: '40%'}}>
                        <a href={item.url}>{item.title}</a>
                    </span>
                        <span style={{width: '30%'}}> {item.author} </span>
                        <span style={smallColumn}> {item.num_comments} comm </span>
                        <span style={smallColumn}> {item.points} points </span>
                        <span style={smallColumn}>
                        <Button className="button-inline" onClick={() => onDismiss(item.objectID)}>
                            Отбросить
                        </Button>
                    </span>
                    </div>
                )}
            </div>
        );
    }
}

/*const Table = ({list, sortKey, isSortReverse, onSort, onDismiss}) => {
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse
        ? sortedList.reverse()
        : sortedList;

    return(
        <div className="table">
        <div className="table-header">
            <span style={{width: '40%'}}>
                <Sort sortKey={'TITLE'} onSort={onSort} activeSortKey={sortKey}>
                    Zagolovok
                </Sort>
            </span>
            <span style={{width: '30%'}}>
                <Sort sortKey={'AUTHOR'} onSort={onSort} activeSortKey={sortKey}>
                    Avtor
                </Sort>
            </span>
            <span style={{width: '10%'}}>
                <Sort sortKey={'COMMENTS'} onSort={onSort} activeSortKey={sortKey}>
                    Comments
                </Sort>
            </span>
            <span style={{width: '10%'}}>
                <Sort sortKey={'POINTS'} onSort={onSort} activeSortKey={sortKey}>
                    Points
                </Sort>
            </span>
            <span style={{width: '10%'}}>
                Archive
            </span>
        </div>
        {reverseSortedList.map(item =>
                <div key={item.objectID} className="table-row">
                    <span style={{width: '40%'}}>
                        <a href={item.url}>{item.title}</a>
                    </span>
                    <span style={{width: '30%'}}> {item.author} </span>
                    <span style={smallColumn}> {item.num_comments} comm </span>
                    <span style={smallColumn}> {item.points} points </span>
                    <span style={smallColumn}>
                        <Button className="button-inline" onClick={() => onDismiss(item.objectID)}>
                            Отбросить
                        </Button>
                    </span>
                </div>
        )}
    </div>
    );
};*/

const Button = ({onClick, className = "", children}) =>
            <button onClick={onClick} className={className} type="button">
                {children}
            </button>;

const Sort = ({ sortKey, activeSortKey, onSort, children}) => {
    const sortClass = classNames(
        'button-inline',
        { 'button-active': sortKey === activeSortKey }
    );


    return (
        <Button onClick={() => onSort(sortKey)} className={sortClass}>
             {children}
        </Button>
    );
};

const ButtonWithLoading = withLoading(Button);

export default App;

export {
    Button, Search, Table,
};



// eslint-disable-next-line
class ExplainBindingsComponent extends Component {
    // eslint-disable-next-line
    constructor() {
        super();
        //this.onClickMe = this.onClickMe.bind(this);

    }
    //через стрелочную функцию нет необходимости привязывать метод, ибо как я понимаю в таком обозначение метода зис
    //реферится к отцу, следоватьльно к самому класу, что и требовалось
    onClickMe = () => {
        console.log(this);
    };

    /*onClickMe() {
        console.log(this);
    }*/
    render() {
        return (
            <button
                onClick={this.onClickMe}
                type="button"
            >
                Нажми на меня
            </button>
        );
    }
}

/*

function Notification(_ref) {
    var text = _ref.text,
        state = _ref.state;
    return React.createElement("div", null, {
        info: React.createElement(Info, {
            text: text
        }),
        warning: React.createElement(Warning, {
            text: text
        }),
        error: React.createElement(Error, {
            text: text
        })
    }[state]);
}


Notification({text: "qwer", state: "info"})

*/