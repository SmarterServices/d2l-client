'use strict';

const Client = require('./index');

const client = new Client({
  appId: 'HrwlA6w-MNvp4dwDLz_mVw',
  appKey: 'fO4fdUSPBbT76NfkB-WpTA',
  host: 'https://smarterservices.brightspacedemo.com',
  port: 443,
  callbackTarget: 'http://abc.com/auth?iid=123'
});

console.log(client.getAuthenticationUrl());



client
  // .getVersions()
  // .getUserEnrollments('6fLHsBy0hDutfm3sJl6hIs','nXTNNcngESjQYDHjzIr2kz')
  // .listQuizzes('unstable', '6606', '6fLHsBy0hDutfm3sJl6hIs','nXTNNcngESjQYDHjzIr2kz')
  .listEnrollments('1.0', '6606', '6fLHsBy0hDutfm3sJl6hIs', 'nXTNNcngESjQYDHjzIr2kz')
  .then(userList => {
    console.log(userList);
  })
  .catch(err => {
    console.error(err.message);
  });
