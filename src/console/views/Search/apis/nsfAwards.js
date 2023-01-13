import _ from 'lodash';

export const requestQuotes = _.memoize(async keyword => {
    const myHeaders = new Headers();

    myHeaders.append('Access-Control-Allow-Origin', "*")
    const res = await fetch(`https://api.nsf.gov/services/v1/awards.json?keyword=${keyword}`)
    // if(res.status !== 200) return [];

    const quotesArray = await res.json();
    return quotesArray;
});
