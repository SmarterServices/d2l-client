'use strict';

const endpoints = require('../data/endpoints.json');
const D2L = require('valence');
const requestPromise = require('request-promise');
const utils = require('./helpers/utils');
const enrollmentMap = require('././data/enrollment-map');

class Client {
  /**
   * Configure the client
   * @param {Object} config - Config object
   * @param {Object} config.url - Url of the api
   * @param {Object} config.apiKey - API key to the api
   * @param {Object} config.useConsumerKey - Whether or not to fetch and use CONSUMER_KEY instead of API_KEY
   */
  constructor(config) {
    this._appId = config.appId;
    this._appKey = config.appKey;
    this._host = config.host;
    this._port = config.port;
    this._callback = config.callbackTarget;
    this._userId = config.userId || '';
    this._userKey = config.userKey || '';
    this._appContext = new D2L.ApplicationContext(this._appId, this._appKey);
    this._setUserContext(this._userId, this._userKey);
  }

  /**
   * Set method and endpoint to instance
   * @param {string} method
   * @param {string} endpoint
   * @return {Object<Client>}
   * @memberof Client
   */
  _setMethodAndEndpoint(method, endpoint) {
    this._method = method;
    this._endpoint = endpoint;
    return this;
  }

  /**
   * @param {string} endpoint
   * @returns {Object<Client}
   * @memberof Client
   */
  _get(endpoint) {
    return this._setMethodAndEndpoint('GET', endpoint);
  }

  /**
   * @param {string} endpoint
   * @returns {Object<Client}
   * @memberof Client
   */
  _post(endpoint) {
    return this._setMethodAndEndpoint('POST', endpoint);
  }

  /**
   * @param {string} endpoint
   * @returns {Object<Client}
   * @memberof Client
   */
  _put(endpoint) {
    return this._setMethodAndEndpoint('PUT', endpoint);
  }

  /**
   * @param {string} endpoint
   * @returns {Object<Client}
   * @memberof Client
   */
  _delete(endpoint) {
    return this._setMethodAndEndpoint('DELETE', endpoint);
  }

  /**
   * Set the payload to send
   * @param {Object} payload
   * @return {Object<Client>}
   * @memberof Client
   */
  _send(payload) {
    this._payload = payload;
    return this;
  }

  /**
   * Send the actual request with set method, url and payload
   * @return {Promise}
   * @memberof Client
   */
  _end() {
    const url = this._userContext.createUrlForAuthentication(this._endpoint, this._method);

    const requestOptions = {
      url,
      method: this._method,
      json: true,
      body: this._payload,
      resolveWithFullResponse: false
    };

    return requestPromise(requestOptions);
  }

  /**
   * Set the user context of instance
   * @param {string} [userId=this._userId]
   * @param {string} [userKey=this._userKey]
   * @memberof Client
   */
  _setUserContext(userId = this._userId, userKey = this._userKey) {
    this._userContext = this._appContext.createUserContextWithValues(
      this._host,
      this._port,
      userId,
      userKey
    );
  }

  /**
   * Get D2L Authentication URL
   * @param {string} callback
   * @returns {string}
   */
  getAuthenticationUrl(callback = this._callback) {
    return this._appContext.createUrlForAuthentication(this._host, this._port, callback);
  }

  /**
   * Get API versions
   * @return {Promise}
   * @memberof Client
   */
  getVersions() {
    return this
      ._get(endpoints.getVersions)
      ._end();
  }

  /**
   * Get user enrollments
   * @param {string} [userId=this._userId]
   * @param {string} [userKey=this._userKey]
   * @return {Promise}
   * @memberof Client
   */
  getUserEnrollments(userId = this._userId, userKey = this._userKey) {
    this._setUserContext(userId, userKey);

    return this
      ._get(endpoints.getUserEnrollments)
      ._end();
  }

  /**
   * List quizzes
   * @param {string} version
   * @param {string} orgUnitId - unitId of organization
   * @param {string} [userId=this._userKey]
   * @param {string} [userKey=this._userKey]
   * @return {Promise}
   * @memberof Client
   */
  listQuizzes(version, orgUnitId, userId = this._userId, userKey = this._userKey) {
    this._setUserContext(userId, userKey);

    let endpoint = utils.buildUrl(endpoints.listQuizzes, {version, orgUnitId});

    return this
      ._get(endpoint)
      ._end();
  }

  /**
   * List classes under an organization
   * @param {String} version
   * @param {String} orgUnitId - unitId of organization
   * @return {Promise.<Object>} List of enrollments
   */
  _listClass(version, orgUnitId) {

    let endpoint = utils.buildUrl(endpoints.listClass, {version, orgUnitId});

    return this
      ._get(endpoint)
      ._end();
  }

  /**
   * Get User Details
   * @param {String} version
   * @param {String} userId - id of the getUser
   * @return {Promise}
   */
  _getUser(version, userId) {

    let endpoint = utils.buildUrl(endpoints.getUser, {version, userId});

    return this
      ._get(endpoint)
      ._end();
  }


  /**
   * Returns details of enrollments under an organizations
   * @param {String} version
   * @param {String} orgUnitId - unitId of organization
   * @param {String} [userId=this._userKey]
   * @param {String} [userKey=this._userKey]
   * @return {Promise<Object>}
   */
  listEnrollments(version, orgUnitId, userId = this._userId, userKey = this._userKey) {

    let _this = this;
    this._setUserContext(userId, userKey);

    return this
      ._listClass(version, orgUnitId)
      .then(function getUserDetails(userList) {
        let promises = [];

        //get details of each user
        userList.forEach(function (user) {
          promises.push(_this._getUser(version, user.Identifier));
        });

        return Promise.all(promises);
      })
      .then(function formatData(userList) {
        let formattedUsers = utils.formatResponse(userList, enrollmentMap);
        return Promise.resolve(formattedUsers);
      });;

  }

}

module.exports = Client;
