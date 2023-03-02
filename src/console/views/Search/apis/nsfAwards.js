import _ from 'lodash';

export const requestQuotes = _.memoize(async keyword => {
    // to bypass the CORS issue
    const res = await fetch(`https://cors-anywhere.herokuapp.com/api.nsf.gov/services/v1/awards.xml?keyword=${keyword}`)
    if(res.status !== 200) return [];

    const quotesArray = await res.json();
    return quotesArray;
});
