'use strict';

const Client = require('./index');

const client = new Client({
  appId: '31brpbcCLsVim_K4jJ8vzw',
  appKey: 'sagYSTT_HOts39qrGQTFWA',
  host: 'https://devcop.brightspace.com',
  port: 443,
  callbackTarget: 'http://abc.com/auth?iid=123'
});

console.log(client.getAuthenticationUrl());

client
  // .getVersions()
  // .getUserEnrollments('Khn0CLf31FiIeI3YLguDaS','Rz4qj2f2QKZS0MSQ2-RUzo')
  // .listQuizzes('unstable', '6606', 'Khn0CLf31FiIeI3YLguDaS','Rz4qj2f2QKZS0MSQ2-RUzo')
  .listEnrollments('1.0', '6630', 'Khn0CLf31FiIeI3YLguDaS','Rz4qj2f2QKZS0MSQ2-RUzo')
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error(err.message);
  });
