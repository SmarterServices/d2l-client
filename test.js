'use strict';

const Client = require('./index');

const client = new Client({
  appId: '31brpbcCLsVim_K4jJ8vzw',
  appKey: 'sagYSTT_HOts39qrGQTFWA',
  host: 'https://devcop.brightspace.com',
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
