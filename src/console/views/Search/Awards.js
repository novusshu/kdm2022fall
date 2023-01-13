import React from 'react';

import './styles/Quote.css';

const Award = ({quote}) => {
    return (
        <div className='quote-container'>
          <p className="quote">
            {quote}
          </p>
          <p className="quote-author">
            Award by
            <span className='highlight'> {quote.piFirstName} </span>
            of title
            <span className='highlight'> {quote.title}</span>
          </p>
        </div>
      );
};

export default Award;

