'use strict';

const apiList = require('../data/api-list.json');
const get = require('lodash.get');
const joi = require('joi');
const moment = require('moment');
const D2L = require('valence');
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
    this._host = config.host;
    this._port = config.port;
    this._userId = config.userId || '';
    this._userKey = config.userKey || '';
    this._appContext = new D2L.ApplicationContext(config.appId, config.appKey);
  }

  _setMethodAndEndpoint(method, endpoint){
    this._method = method;
    this._endpoint = endpoint;
    return this;
  }

  _get(endpoint) {
    return this._setMethodAndEndpoint('GET', endpoint);
  }

  _post(endpoint) {
    return this._setMethodAndEndpoint('POST', endpoint);
  }

  _put(endpoint) {
    return this._setMethodAndEndpoint('PUT', endpoint);
  }

  _delete(endpoint) {
    return this._setMethodAndEndpoint('DELETE', endpoint);
  }

  _send(payload) {
    this._payload = payload;
    return this;
  }

  _end() {
    const url = this._userContext.createUrlForAuthentication(this._endpoint, this._method);

    const requestOptions = {
      url,
      method: this._method,
      json: true,
      body: this._payload
    };

    return requestPromise(requestOptions);
  }

  authenticateUser(userId, userKey) {
    this._userContext = this._appContext.createUserContextWithValues(
      this._host,
      this._port,
      userId || this._userId,
      userKey || this._userKey
    );
  }

  getVersions() {
    return this
      ._get('/d2l/api/versions/')
      ._end();
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
}

module.exports = Client;
