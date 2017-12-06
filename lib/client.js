'use strict';

const apiList = require('../data/api-list.json');
const get = require('lodash.get');
const joi = require('joi');
const moment = require('moment');
const requestPromise = require('request-promise');
const payloadSchema = require('../schema/payload-schema');
// constants
const LOGIN_ATTEMPT_LIMIT = 5;
const TOKEN_EXPIRATION_TIME_IN_MINUTES = 60;

class Client {
  /**
   * Configure the client
   * @param {Object} config - Config object
   * @param {Object} config.url - Url of the api
   * @param {Object} config.apiKey - API key to the api
   * @param {Object} config.useConsumerKey - Whether or not to fetch and use CONSUMER_KEY instead of API_KEY
   */
  constructor(config) {
    this._basePath = config.url;
    this._appId = config.appId;
    this._appKey = config.appKey;
    this._token = undefined;
    this._tokenExpirationTime = undefined;
  }

  /**
   * Process the request made to client
   * @param {string} methodName - Request method name
   * @param {Object} payload - Request payload
   * @returns {Promise}
   * @returns {Promise.<TResult>}
   * @private
   */
  _process(methodName, payload) {
    // validate the payload
    return this._validatePayload(methodName, payload)
      // send request
      .then(response => this._request(methodName, payload));
  }

  /**
   * Validates request payload against joi schema
   * @param {string} methodName - Request method name
   * @param {Object} payload - Request payload
   * @returns {Promise}
   * @private
   */
  _validatePayload(methodName, payload) {
    let schema = payloadSchema[methodName];

    return new Promise(function (resolve, reject) {
      joi.validate(payload, schema, function (error, data) {
        if (error) {
          // Handle error
        }
        resolve();
      })
    });

  }

  /**
   * Check if need to send request directly
   * Or do need to login first
   * Or should loging if request fails
   * @param {string} methodName - Request method name
   * @param {Object} payload - Request payload
   * @returns {Promise}
   * @private
   */
  _request(methodName, payload) {
    const currentTime = moment();
    const isTokenInvalid = !this._token || !this._tokenExpirationTime || currentTime > this._tokenExpirationTime;

    if(!this._useConsumerKey) {
      // no need to use consumer key, so
      // we do not need to login prior to request or if token expires
      return this._send(methodName, payload);
    }
    else if (isTokenInvalid) {
      // get the consumer key then request with that
      return this._requestWithLogin(methodName, payload);
    } else {
      // try to send request first with consumer key
      // if fails then get consumer key
      return this
        ._send(methodName, payload)
        .catch(() => this._requestWithLogin(methodName, payload));
    }
  }

  /**
   * Core method to send the request
   * @param {string} methodName - Request method name
   * @param {Object} payload - Request payload
   * @returns {Promise}
   * @private
   */
  _send(methodName, payload) {
    let apiTemplate = apiList[methodName].endpoint;
    let apiUrl = this._buildUrl(apiTemplate, payload);
    let token = this._token || this._apiKey;
    let auth = new Buffer(token + ':').toString("base64");

    const requestOptions = {
      url: this._basePath + apiUrl,
      method: `${apiList[methodName].method}`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'content-type': 'multipart/form-data'
      },
      json: true
    };

    let req =  requestPromise(requestOptions);
    this._setPayload(req, payload);
    return req;
  }

  /**
   * Attempt a number of login try the then send the request
   * @param methodName
   * @param options
   * @returns {Promise.<TResult>}
   * @private
   */
  _requestWithLogin(methodName, options) {
    let loginPromise = this._login();

    for (let i = 1; i < LOGIN_ATTEMPT_LIMIT; i++) {
      loginPromise = loginPromise.catch(() => this._login());
    }

    return loginPromise.then(() => this._send(methodName, options));
  }

  /**
   * Logins to the API ans saves returned token for further use
   * @returns {Promise}
   * @private
   */
  _login() {
    // invalidate the token before login
    this._token = undefined;

    return this._send('auth', {})
      .then(response => {
        this._token = response.token;

        const currentTime = moment();
        this._tokenExpirationTime = currentTime.add(TOKEN_EXPIRATION_TIME_IN_MINUTES, 'm');
      });
  }

  /**
   * Build request URl from url template
   * @param {String} urlTemplate - Url template string
   * @param {Object} params - Path params map
   * @param {Object} query - Query params map
   * @returns {*}
   * @private
   */
  _buildUrl(urlTemplate, params, query) {
    let paramRegex = new RegExp('\{(.+?)\}', 'gm'),
      paramNames;

    do {
      //Get the matching params
      paramNames = paramRegex.exec(urlTemplate);

      //If there is a match and has a param value for the match
      if (paramNames && params[paramNames[1]]) {

        //Replace and update the urlTemplate
        urlTemplate = urlTemplate.replace(paramNames[0], params[paramNames[1]]);
      }
    } while (paramNames);

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

        urlTemplate = urlTemplate + delimiter + queryKey + '=' + queryValue;
      }
    }

    return urlTemplate;
  }

  /**
   * Modifies the request to assign payload as form
   * @param {Promise} requestPromise - the request
   * @param {Object} payload - the payload to add
   * @private
   */
  _setPayload(requestPromise, payload) {
    let form = requestPromise.form();

    for (let key in payload) {
      let value = payload[key];
      if (Buffer.isBuffer(value)) {
        form.append(key, value, `${key}.jpg`);
      } else {
        form.append(key, value);
      }
    }
  }
}

module.exports = Client;
