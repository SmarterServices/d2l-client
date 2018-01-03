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

// client
//   .getVersions()
//   .then(data => {
//     console.log(data);
//   })
//   .catch(err => {
//     console.log(err);
//   });

// client
//   .getUserEnrollments()
//   .then(data => {
//     console.log(data);
//   })
//   .catch(err => {
//     console.log(err);
//   });
client
  .listQuizzes('unstable', '6606')
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error(err);
  });
