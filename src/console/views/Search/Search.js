import React, { useState } from 'react';

// import './styles/Search.css';
import Award from './Awards';
import SearchBar from './SearchBar';
import { requestQuotes } from './apis/nsfAwards';

const Search = () => {
  const [quotes, setQuotes] = useState([]);
  const [noResults, setNoResults] = useState(false);

  const onSearchSubmit = async term => {
    console.log('New Search submit:', term);
    const quotesArray = await requestQuotes(term);
    setNoResults(quotesArray?.length === 0);
    console.log(quotesArray)
    setQuotes(quotesArray);
  };

  const clearResults = () => setQuotes([]);

  const renderedQuotes = quotes.map((quote, i) => {
    return <Award quote={quote} key={i} />
  })


  return (
    <div >
      <h1 className='title'>Search Awards</h1>

      <div className='disclaimer-container'>
        <p className='disclaimer'>
          Get Awards
        </p>
      </div>
      
      <SearchBar onSearchSubmit={onSearchSubmit} clearResults={clearResults}/>

      { noResults &&
        <p className='no-results'>
          No results found.
        </p>
      }
      <div className='main-content'>
        {renderedQuotes}
      </div>

    </div>
  );
};

export default Search;
