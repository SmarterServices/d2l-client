'use strict';
let _ = require('lodash');
const createMapper = require('map-factory');

let utils = {

  /**
   * Build an URL from url template
   * @param {String} urlTemplate
   * @param {Object} params
   * @param {Object} [query]
   * @return {String}
   */
  buildUrl: function (urlTemplate, params, query) {
    let paramRegex = new RegExp('\{(.+?)\}', 'gm');
    let paramNames;
    let tempUrl = urlTemplate;
    let url;

    do {
      //Get the matching params
      paramNames = paramRegex.exec(urlTemplate);

      //If there is a match and has a param value for the match
      if (paramNames && params[paramNames[1]]) {

        //Replace and update the tempUrl
        //should not modify the template
        //as it will create problem to match
        tempUrl = tempUrl.replace(paramNames[0], params[paramNames[1]]);
      }
    } while (paramNames);

    url = tempUrl;

    if (query) {
      // flag for first key
      let first = true;

      for (let queryKey in query) {
        // if first key use '?' as delimiter, '&' otherwise
        let delimiter = (first) ? '?' : '&';
        first = false;
        // append the query key-value pairs with original url
        let isObjectKey = typeof query[queryKey] === 'object';
        let queryValue = (isObjectKey) ?
          JSON.stringify(query[queryKey]) :
          query[queryKey];

        url = url + delimiter + queryKey + '=' + queryValue;
      }
    }

    return url;
  },

  /**
   * Creates new object by extracting values from data according to Keymap
   * @param {Object} data
   * @param {Object} keyMap - a map used to get properties from data
   * @return {Object} result - formattedResult
   */
  formatResponse: function formatResponse(data, keyMap) {

    if (Array.isArray(data)) {
      //call this function recursively
      let results = data.map(singleData => formatResponse(singleData, keyMap));
      return results;
    }

    //get values from data
    let result = _.mapValues(keyMap, (value) => {
      if (typeof value === 'function') {
        return value(data);
      }
      return _.get(data, value);
    });

    return result;
  }
};

module.exports = utils;