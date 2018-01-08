'use strict';
let _ = require('lodash');

let enrollmentMap = {
  courseId: 'OrgId',
  userId: 'UserId',
  firstName: 'FirstName',
  lastName: function (data) {
    let middleNameKey = 'MiddleName';
    let lastNameKey = 'LastName';

    let middleName = _.get(data, middleNameKey, '');
    let lastName = _.get(data, lastNameKey, '');

    let names = [];
    if (middleName) {
      names.push(middleName);
    }
    if (lastName) {
      names.push(lastName);
    }

    return names.join(' ');
  },
  emailAddress: 'ExternalEmail',
  enrollmentState: 'Activation.IsActive',
  rootAccountId: 'rootAccountId',

};

module.exports = enrollmentMap;
