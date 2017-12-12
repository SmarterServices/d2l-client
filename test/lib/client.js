'use strict';

const Client = require('./../../index');
const expect = require('chai').expect;

describe('Client', function testClient() {
  it('Should create new client', function testCreateNewClient() {
    const client = new Client({
      url: "https://devcop.brightspace.com",
      appId: "test",
      appKey: "test"
    });
    expect(client).instanceof(Client);
  });
});
