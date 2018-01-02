'use strict';

const Client = require('./index');

const client = new Client({
  appId: '31brpbcCLsVim_K4jJ8vzw',
  appKey: 'sagYSTT_HOts39qrGQTFWA',
  host: 'https://devcop.brightspace.com',
  userId: 'Khn0CLf31FiIeI3YLguDaS',
  userKey: 'Rz4qj2f2QKZS0MSQ2-RUzo',
  port: 443
});

client
  .getVersions()
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.log(err);
  });

client
  .getUserEnrollments()
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.log(err);
  });

client
  .listQuizzes('unstable', '7308')
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.error(err);
  });
