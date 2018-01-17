'use strict';

const _ = require('lodash');
const nock = require('nock');
const mockData = require('./../data/mock.json');
const {buildUrl} = require('./../../lib/helpers/utils');
const url = require('url');

module.exports = {
  /**
   * Mock D2L endpoints using nock
   * @param {string} host
   * @return {Object<nock.Interceptor>}
   */
  mockD2LEndpoints(host) {
    const scope = nock(host);

    // For each property in the mock data create a interceptor list from the requests in the object
    const endpointInterceptorMap = _.mapValues(mockData, data => {
      const interceptors = _.mapValues(data.requests, request => {
        const requestUrl = buildUrl(data.endpoint, request.params);
        const requestUrlObject = url.parse(requestUrl);

        const method = data.method.toLowerCase();
        const interceptor = scope[method](incomingPath => {
          // Use callback to match incomingPath with endpoint path
          return incomingPath.startsWith(requestUrlObject.pathname);
        });

        return interceptor.reply(request.statusCode, request.response);
      });
      return interceptors;
    });

    return endpointInterceptorMap;
  }
};
